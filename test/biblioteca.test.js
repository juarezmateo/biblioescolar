const test = require('node:test');
const assert = require('node:assert');
const { Biblioteca, DIA, HORAS_48 } = require('../src/biblioteca');

const T0 = new Date('2026-03-02T10:00:00').getTime();

function armar() {
  const b = new Biblioteca();
  ['ana', 'beto', 'cami'].forEach(id => b.agregarAlumno({ id, nombre: id }));
  b.agregarLibro({ id: 'L1', titulo: 'Don Quijote', autor: 'Cervantes', cantidad: 1 });
  b.agregarLibro({ id: 'L2', titulo: 'Martín Fierro', autor: 'Hernández', cantidad: 3 });
  b.agregarLibro({ id: 'L3', titulo: 'El Eternauta', autor: 'Oesterheld', cantidad: 3 });
  b.agregarLibro({ id: 'L4', titulo: 'Rayuela', autor: 'Cortázar', cantidad: 3 });
  return b;
}
const falla = (fn, codigo) =>
  assert.throws(fn, e => e.codigo === codigo, `esperaba ${codigo}`);

test('T1 RN1: el préstamo dura 7 días', () => {
  const b = armar();
  const p = b.prestar('ana', 'L1', T0);
  assert.strictEqual(p.vence, T0 + 7 * DIA);
});

test('T1 RN2: máximo 3 préstamos', () => {
  const b = armar();
  b.prestar('ana', 'L2', T0); b.prestar('ana', 'L3', T0); b.prestar('ana', 'L4', T0);
  falla(() => b.prestar('ana', 'L1', T0), 'LIMITE_PRESTAMOS');
});

test('T1 RN3: no se presta más de lo que hay', () => {
  const b = armar();
  b.prestar('ana', 'L1', T0);
  falla(() => b.prestar('beto', 'L1', T0), 'SIN_EJEMPLARES');
});

test('T1 RN4: no repetir el mismo libro', () => {
  const b = armar();
  b.prestar('ana', 'L2', T0);
  falla(() => b.prestar('ana', 'L2', T0), 'LIBRO_REPETIDO');
});

test('T2 RN5: con vencido no puede retirar otro', () => {
  const b = armar();
  b.prestar('ana', 'L2', T0);
  falla(() => b.prestar('ana', 'L3', T0 + 8 * DIA), 'TIENE_VENCIDO');
});

test('T3 RN12: devolver en la fecha exacta no sanciona', () => {
  const b = armar();
  const p = b.prestar('ana', 'L2', T0);
  b.devolver(p.id, p.vence);
  assert.doesNotThrow(() => b.prestar('ana', 'L3', p.vence));
});

test('T3 RN12: 3 días de atraso = 6 días de sanción', () => {
  const b = armar();
  const p = b.prestar('ana', 'L2', T0);
  const tarde = p.vence + 3 * DIA;
  b.devolver(p.id, tarde);
  falla(() => b.prestar('ana', 'L3', tarde + 5 * DIA), 'SANCIONADO');
  assert.doesNotThrow(() => b.prestar('ana', 'L3', tarde + 6 * DIA + 1));
});

test('T3 RN12: la sanción tiene tope de 30 días', () => {
  const b = armar();
  const p = b.prestar('ana', 'L2', T0);
  const tarde = p.vence + 60 * DIA;
  b.devolver(p.id, tarde);
  assert.doesNotThrow(() => b.prestar('ana', 'L3', tarde + 30 * DIA + 1));
});

test('T4 RN8: no se reserva si hay ejemplares', () => {
  const b = armar();
  falla(() => b.reservar('ana', 'L2', T0), 'HAY_EJEMPLARES');
});

test('T4 RN9: máximo 2 reservas y no reservar lo que ya tiene', () => {
  const b = armar();
  b.agregarLibro({ id: 'L5', titulo: 'X', autor: 'Y', cantidad: 1 });
  b.agregarLibro({ id: 'L6', titulo: 'Z', autor: 'W', cantidad: 1 });
  b.prestar('beto', 'L1', T0); b.prestar('beto', 'L5', T0); b.prestar('beto', 'L6', T0);
  b.reservar('ana', 'L1', T0); b.reservar('ana', 'L5', T0);
  falla(() => b.reservar('ana', 'L6', T0), 'LIMITE_RESERVAS');
  falla(() => b.reservar('beto', 'L1', T0), 'LIBRO_REPETIDO');
});

test('T5 RN10: al devolver, la primera reserva queda lista y nadie más lo retira', () => {
  const b = armar();
  const p = b.prestar('ana', 'L1', T0);
  b.reservar('beto', 'L1', T0 + 1000);
  b.reservar('cami', 'L1', T0 + 2000);
  b.devolver(p.id, T0 + DIA);
  falla(() => b.prestar('cami', 'L1', T0 + DIA), 'SIN_EJEMPLARES');
  assert.doesNotThrow(() => b.prestar('beto', 'L1', T0 + DIA));
});

test('T5 RN11: la reserva lista vence a las 48 hs y pasa al siguiente', () => {
  const b = armar();
  const p = b.prestar('ana', 'L1', T0);
  b.reservar('beto', 'L1', T0 + 1000);
  b.reservar('cami', 'L1', T0 + 2000);
  b.devolver(p.id, T0 + DIA);
  const despues = T0 + DIA + HORAS_48 + 1000;
  falla(() => b.prestar('beto', 'L1', despues), 'SIN_EJEMPLARES');
  assert.doesNotThrow(() => b.prestar('cami', 'L1', despues));
});

test('T4 RN13: cancelar una reserva la cierra', () => {
  const b = armar();
  b.prestar('ana', 'L1', T0);
  const r = b.reservar('beto', 'L1', T0 + 1000);
  b.cancelarReserva(r.id, T0 + 2000);
  assert.strictEqual(r.estado, 'cancelada');
});

test('T6 RN6: se renueva una sola vez, +7 días', () => {
  const b = armar();
  const p = b.prestar('ana', 'L2', T0);
  b.renovar(p.id, T0 + DIA);
  assert.strictEqual(p.vence, T0 + 14 * DIA);
  falla(() => b.renovar(p.id, T0 + 2 * DIA), 'YA_RENOVADO');
});

test('T6 RN7: no se renueva vencido ni con reservas', () => {
  const b = armar();
  const p = b.prestar('ana', 'L1', T0);
  b.reservar('beto', 'L1', T0 + 1000);
  falla(() => b.renovar(p.id, T0 + DIA), 'LIBRO_RESERVADO');
  const q = b.prestar('cami', 'L2', T0);
  falla(() => b.renovar(q.id, T0 + 8 * DIA), 'VENCIDO');
});
