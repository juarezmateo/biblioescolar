const test = require('node:test');
const assert = require('node:assert');
const { crearApp } = require('../src/server');
const { Biblioteca } = require('../src/biblioteca');

async function levantar() {
  const biblio = new Biblioteca();
  biblio.agregarAlumno({ id: '1', nombre: 'Ana' });
  biblio.agregarAlumno({ id: '2', nombre: 'Beto' });
  biblio.agregarLibro({ id: 'L1', titulo: 'Quijote', autor: 'Cervantes', cantidad: 1 });
  biblio.agregarLibro({ id: 'L2', titulo: 'Fierro', autor: 'Hernández', cantidad: 5 });
  biblio.agregarLibro({ id: 'L3', titulo: 'Eternauta', autor: 'Oesterheld', cantidad: 5 });
  biblio.agregarLibro({ id: 'L4', titulo: 'Rayuela', autor: 'Cortázar', cantidad: 5 });
  const server = crearApp({ biblio, clave: 'secreta', demo: true }).listen(0);
  const base = 'http://localhost:' + server.address().port;
  const llamar = async (metodo, url, body, token) => {
    const r = await fetch(base + url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, datos: await r.json().catch(() => ({})) };
  };
  const bib = (await llamar('POST', '/api/login', { rol: 'bibliotecario', clave: 'secreta' })).datos.token;
  const ana = (await llamar('POST', '/api/login', { rol: 'alumno', alumnoId: '1' })).datos.token;
  const beto = (await llamar('POST', '/api/login', { rol: 'alumno', alumnoId: '2' })).datos.token;
  return { server, llamar, bib, ana, beto };
}

test('login: clave incorrecta da 401', async () => {
  const { server, llamar } = await levantar();
  const r = await llamar('POST', '/api/login', { rol: 'bibliotecario', clave: 'mal' });
  assert.strictEqual(r.status, 401);
  server.close();
});

test('RN14: sin sesión 401 y alumno no puede prestar (403)', async () => {
  const { server, llamar, ana } = await levantar();
  assert.strictEqual((await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L2' })).status, 401);
  assert.strictEqual((await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L2' }, ana)).status, 403);
  server.close();
});

test('bibliotecario presta (201) y al 4º préstamo hay conflicto (409, RN2)', async () => {
  const { server, llamar, bib } = await levantar();
  for (const l of ['L2', 'L3', 'L4']) {
    assert.strictEqual((await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: l }, bib)).status, 201);
  }
  const r = await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L1' }, bib);
  assert.strictEqual(r.status, 409);
  assert.strictEqual(r.datos.codigo, 'LIMITE_PRESTAMOS');
  server.close();
});

test('un alumno no puede renovar el préstamo de otro (403)', async () => {
  const { server, llamar, bib, beto } = await levantar();
  const p = (await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L2' }, bib)).datos;
  assert.strictEqual((await llamar('POST', `/api/prestamos/${p.id}/renovar`, null, beto)).status, 403);
  server.close();
});

test('flujo de reserva: reservar, devolver y retirar con la reserva lista', async () => {
  const { server, llamar, bib, beto } = await levantar();
  const p = (await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L1' }, bib)).datos;
  assert.strictEqual((await llamar('POST', '/api/reservas', { libroId: 'L1' }, beto)).status, 201);
  await llamar('POST', `/api/prestamos/${p.id}/devolver`, null, bib);
  const cuenta = (await llamar('GET', '/api/mi-cuenta', null, beto)).datos;
  assert.strictEqual(cuenta.reservas[0].estado, 'lista');
  assert.strictEqual((await llamar('POST', '/api/prestamos', { alumnoId: '2', libroId: 'L1' }, bib)).status, 201);
  server.close();
});

test('modo demo: al avanzar 8 días el préstamo figura vencido', async () => {
  const { server, llamar, bib, ana } = await levantar();
  await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L2' }, bib);
  await llamar('POST', '/api/demo/avanzar', { dias: 8 }, bib);
  const cuenta = (await llamar('GET', '/api/mi-cuenta', null, ana)).datos;
  assert.strictEqual(cuenta.prestamos[0].vencido, true);
  server.close();
});

test('devolver tarde sanciona y se ve en mi-cuenta (RN12)', async () => {
  const { server, llamar, bib, ana } = await levantar();
  const p = (await llamar('POST', '/api/prestamos', { alumnoId: '1', libroId: 'L2' }, bib)).datos;
  await llamar('POST', '/api/demo/avanzar', { dias: 10 }, bib);
  await llamar('POST', `/api/prestamos/${p.id}/devolver`, null, bib);
  const cuenta = (await llamar('GET', '/api/mi-cuenta', null, ana)).datos;
  assert.ok(cuenta.alumno.sancionHasta > 0);
  server.close();
});

test('validaciones: libro con cantidad inválida da 400', async () => {
  const { server, llamar, bib } = await levantar();
  const r = await llamar('POST', '/api/libros', { titulo: 'X', autor: 'Y', cantidad: 0 }, bib);
  assert.strictEqual(r.status, 400);
  server.close();
});
