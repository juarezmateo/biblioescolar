// Lógica de negocio de BiblioEscolar. Cada regla cita su RN de docs/spec.md
const DIA = 24 * 60 * 60 * 1000;
const HORAS_48 = 48 * 60 * 60 * 1000;
const DIAS_PRESTAMO = 7;           // RN1
const MAX_PRESTAMOS = 3;           // RN2
const MAX_RESERVAS = 2;            // RN9
const MAX_SANCION_DIAS = 30;       // RN12

class ReglaError extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

class Biblioteca {
  constructor() {
    this.libros = new Map();
    this.alumnos = new Map();
    this.prestamos = [];
    this.reservas = [];
    this.sigId = 1;
  }

  agregarAlumno({ id, nombre }) {
    this.alumnos.set(id, { id, nombre, sancionHasta: 0 });
  }

  agregarLibro({ id, titulo, autor, cantidad }) {
    this.libros.set(id, { id, titulo, autor, cantidad });
  }

  _alumno(id) {
    const a = this.alumnos.get(id);
    if (!a) throw new ReglaError('ALUMNO_NO_EXISTE', 'No existe el alumno');
    return a;
  }

  _libro(id) {
    const l = this.libros.get(id);
    if (!l) throw new ReglaError('LIBRO_NO_EXISTE', 'No existe el libro');
    return l;
  }

  _activos(alumnoId) {
    return this.prestamos.filter(p => p.alumnoId === alumnoId && !p.devueltoEn);
  }

  _libres(libroId) {
    const libro = this._libro(libroId);
    const prestados = this.prestamos.filter(p => p.libroId === libroId && !p.devueltoEn).length;
    const listas = this.reservas.filter(r => r.libroId === libroId && r.estado === 'lista').length;
    return libro.cantidad - prestados - listas;
  }

  _procesar(libroId, ahora) {
    // RN11: las reservas listas que pasaron 48 hs vencen y el ejemplar pasa al siguiente
    for (const r of this.reservas) {
      if (r.libroId === libroId && r.estado === 'lista' && ahora > r.venceEn) {
        r.estado = 'vencida';
      }
    }
    // RN10: si hay lugar, el primero de la fila pasa a "lista" por 48 hs
    while (this._libres(libroId) > 0) {
      const primera = this.reservas
        .filter(r => r.libroId === libroId && r.estado === 'espera')
        .sort((a, b) => a.creada - b.creada)[0];
      if (!primera) break;
      primera.estado = 'lista';
      primera.venceEn = ahora + HORAS_48;
    }
  }

  disponibles(libroId, ahora) {
    this._procesar(libroId, ahora);
    return this._libres(libroId);
  }

  prestar(alumnoId, libroId, ahora) {
    const alumno = this._alumno(alumnoId);
    this._libro(libroId);
    this._procesar(libroId, ahora);

    // RN12: sancionado no puede pedir
    if (alumno.sancionHasta > ahora) {
      throw new ReglaError('SANCIONADO', 'El alumno está sancionado');
    }
    const activos = this._activos(alumnoId);
    // RN5: con un vencido no puede retirar otro
    if (activos.some(p => p.vence < ahora)) {
      throw new ReglaError('TIENE_VENCIDO', 'Tiene un préstamo vencido');
    }
    // RN2: máximo 3
    if (activos.length >= MAX_PRESTAMOS) {
      throw new ReglaError('LIMITE_PRESTAMOS', 'Ya tiene 3 préstamos');
    }
    // RN4: no repetir libro
    if (activos.some(p => p.libroId === libroId)) {
      throw new ReglaError('LIBRO_REPETIDO', 'Ya tiene este libro');
    }

    // RN10: si tiene reserva lista, retira con ella
    const lista = this.reservas.find(r =>
      r.alumnoId === alumnoId && r.libroId === libroId && r.estado === 'lista');
    if (lista) {
      lista.estado = 'cumplida';
    } else if (this._libres(libroId) <= 0) {
      // RN3: no más ejemplares que los que hay
      throw new ReglaError('SIN_EJEMPLARES', 'No hay ejemplares disponibles');
    }

    const prestamo = {
      id: this.sigId++, alumnoId, libroId,
      desde: ahora, vence: ahora + DIAS_PRESTAMO * DIA, // RN1
      renovaciones: 0, devueltoEn: null,
    };
    this.prestamos.push(prestamo);
    return prestamo;
  }

  devolver(prestamoId, ahora) {
    const p = this.prestamos.find(x => x.id === prestamoId);
    if (!p || p.devueltoEn) throw new ReglaError('PRESTAMO_INVALIDO', 'Préstamo inexistente o ya devuelto');
    p.devueltoEn = ahora;

    // RN12: 2 días de sanción por día de atraso, máximo 30
    if (ahora > p.vence) {
      const diasAtraso = Math.ceil((ahora - p.vence) / DIA);
      const dias = Math.min(diasAtraso * 2, MAX_SANCION_DIAS);
      const alumno = this._alumno(p.alumnoId);
      alumno.sancionHasta = Math.max(alumno.sancionHasta, ahora + dias * DIA);
    }
    this._procesar(p.libroId, ahora); // RN10
    return p;
  }

  renovar(prestamoId, ahora) {
    const p = this.prestamos.find(x => x.id === prestamoId);
    if (!p || p.devueltoEn) throw new ReglaError('PRESTAMO_INVALIDO', 'Préstamo inexistente o ya devuelto');
    this._procesar(p.libroId, ahora);
    // RN6: una sola renovación
    if (p.renovaciones >= 1) throw new ReglaError('YA_RENOVADO', 'Ya se renovó una vez');
    // RN7: no si venció
    if (ahora > p.vence) throw new ReglaError('VENCIDO', 'El préstamo está vencido');
    // RN7: no si hay reservas
    const hayReservas = this.reservas.some(r =>
      r.libroId === p.libroId && (r.estado === 'espera' || r.estado === 'lista'));
    if (hayReservas) throw new ReglaError('LIBRO_RESERVADO', 'El libro tiene reservas');
    p.vence += DIAS_PRESTAMO * DIA;
    p.renovaciones += 1;
    return p;
  }

  reservar(alumnoId, libroId, ahora) {
    this._alumno(alumnoId);
    // RN8: solo si no hay ejemplares
    if (this.disponibles(libroId, ahora) > 0) {
      throw new ReglaError('HAY_EJEMPLARES', 'Hay ejemplares, pedilo directamente');
    }
    // RN9: no reservar lo que ya tiene prestado
    if (this._activos(alumnoId).some(p => p.libroId === libroId)) {
      throw new ReglaError('LIBRO_REPETIDO', 'Ya tiene este libro');
    }
    const vigentes = this.reservas.filter(r =>
      r.alumnoId === alumnoId && (r.estado === 'espera' || r.estado === 'lista'));
    if (vigentes.some(r => r.libroId === libroId)) {
      throw new ReglaError('RESERVA_REPETIDA', 'Ya reservó este libro');
    }
    // RN9: máximo 2 reservas
    if (vigentes.length >= MAX_RESERVAS) {
      throw new ReglaError('LIMITE_RESERVAS', 'Ya tiene 2 reservas');
    }
    const reserva = { id: this.sigId++, alumnoId, libroId, creada: ahora, estado: 'espera', venceEn: null };
    this.reservas.push(reserva);
    return reserva;
  }

  // RN13
  cancelarReserva(reservaId, ahora) {
    const r = this.reservas.find(x => x.id === reservaId);
    if (!r || (r.estado !== 'espera' && r.estado !== 'lista')) {
      throw new ReglaError('RESERVA_INVALIDA', 'Reserva inexistente o ya cerrada');
    }
    r.estado = 'cancelada';
    this._procesar(r.libroId, ahora);
    return r;
  }
}

module.exports = { Biblioteca, ReglaError, DIA, HORAS_48 };
