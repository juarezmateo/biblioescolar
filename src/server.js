const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { Biblioteca, ReglaError, DIA } = require('./biblioteca');
const { sembrar } = require('./datos-iniciales');

function crearApp(opciones = {}) {
  const biblio = opciones.biblio || new Biblioteca();
  // La clave NO está en el código: viene de la variable de entorno (ver manual de instalación)
  const clave = opciones.clave || process.env.BIBLIOTECARIO_CLAVE || 'biblio123';
  const demo = opciones.demo !== undefined ? opciones.demo : process.env.MODO_DEMO !== 'no';

  const app = express();
  app.use(express.json());

  let desfase = 0; // solo para el modo demo: permite "avanzar el reloj"
  const ahora = () => Date.now() + desfase;
  const sesiones = new Map();

  // CORS: solo acepta pedidos del frontend indicado en FRONTEND_URL
  app.use((req, res, next) => {
    const permitido = process.env.FRONTEND_URL;
    if (permitido) res.header('Access-Control-Allow-Origin', permitido);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use((req, res, next) => {
    const t = (req.get('authorization') || '').replace('Bearer ', '');
    req.sesion = sesiones.get(t);
    next();
  });

  const exigir = rol => (req, res, next) => {
    if (!req.sesion) return res.status(401).json({ error: 'Tenés que ingresar primero' });
    if (rol && req.sesion.rol !== rol) {
      // RN14: solo el bibliotecario presta y recibe devoluciones
      return res.status(403).json({ error: 'No tenés permiso para hacer esto' });
    }
    next();
  };

  const refrescar = () => { for (const l of biblio.libros.values()) biblio.disponibles(l.id, ahora()); };
  const libroDe = id => biblio.libros.get(id);

  // ---------- Ingreso ----------
  app.get('/api/alumnos-login', (req, res) =>
    res.json([...biblio.alumnos.values()].map(a => ({ id: a.id, nombre: a.nombre }))));

  app.post('/api/login', (req, res) => {
    const { rol, clave: c, alumnoId } = req.body;
    let sesion;
    if (rol === 'bibliotecario') {
      if (c !== clave) return res.status(401).json({ error: 'Clave incorrecta' });
      sesion = { rol };
    } else if (rol === 'alumno' && biblio.alumnos.has(alumnoId)) {
      sesion = { rol, alumnoId };
    } else {
      return res.status(401).json({ error: 'Datos de ingreso inválidos' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    sesiones.set(token, sesion);
    res.json({ token, ...sesion });
  });

  // ---------- Catálogo ----------
  app.get('/api/libros', (req, res) => {
    refrescar();
    res.json([...biblio.libros.values()].map(l => ({
      ...l,
      disponibles: biblio._libres(l.id),
      enEspera: biblio.reservas.filter(r => r.libroId === l.id && r.estado === 'espera').length,
    })));
  });

  // ---------- Alumno ----------
  app.get('/api/mi-cuenta', exigir('alumno'), (req, res) => {
    refrescar();
    const id = req.sesion.alumnoId;
    const a = biblio.alumnos.get(id);
    const prestamos = biblio._activos(id).map(p => ({
      ...p, titulo: libroDe(p.libroId).titulo, vencido: p.vence < ahora(),
    }));
    const reservas = biblio.reservas
      .filter(r => r.alumnoId === id && (r.estado === 'espera' || r.estado === 'lista'))
      .map(r => ({ ...r, titulo: libroDe(r.libroId).titulo }));
    res.json({
      alumno: { id: a.id, nombre: a.nombre, sancionHasta: a.sancionHasta > ahora() ? a.sancionHasta : 0 },
      prestamos, reservas,
    });
  });

  app.post('/api/reservas', exigir(), (req, res) => {
    const alumnoId = req.sesion.rol === 'alumno' ? req.sesion.alumnoId : req.body.alumnoId;
    res.status(201).json(biblio.reservar(alumnoId, req.body.libroId, ahora()));
  });

  app.delete('/api/reservas/:id', exigir(), (req, res) => {
    const r = biblio.reservas.find(x => x.id === Number(req.params.id));
    if (r && req.sesion.rol === 'alumno' && r.alumnoId !== req.sesion.alumnoId) {
      return res.status(403).json({ error: 'Esa reserva no es tuya' });
    }
    res.json(biblio.cancelarReserva(Number(req.params.id), ahora()));
  });

  app.post('/api/prestamos/:id/renovar', exigir(), (req, res) => {
    const p = biblio.prestamos.find(x => x.id === Number(req.params.id));
    if (p && req.sesion.rol === 'alumno' && p.alumnoId !== req.sesion.alumnoId) {
      return res.status(403).json({ error: 'Ese préstamo no es tuyo' });
    }
    res.json(biblio.renovar(Number(req.params.id), ahora()));
  });

  // ---------- Bibliotecario ----------
  app.get('/api/prestamos', exigir('bibliotecario'), (req, res) => {
    refrescar();
    res.json(biblio.prestamos.filter(p => !p.devueltoEn).map(p => ({
      ...p, alumno: biblio.alumnos.get(p.alumnoId).nombre,
      titulo: libroDe(p.libroId).titulo, vencido: p.vence < ahora(),
    })));
  });

  app.post('/api/prestamos', exigir('bibliotecario'), (req, res) =>
    res.status(201).json(biblio.prestar(req.body.alumnoId, req.body.libroId, ahora())));

  app.post('/api/prestamos/:id/devolver', exigir('bibliotecario'), (req, res) =>
    res.json(biblio.devolver(Number(req.params.id), ahora())));

  app.get('/api/alumnos', exigir('bibliotecario'), (req, res) =>
    res.json([...biblio.alumnos.values()].map(a => ({
      ...a, sancionado: a.sancionHasta > ahora(), prestamosActivos: biblio._activos(a.id).length,
    }))));

  app.post('/api/alumnos', exigir('bibliotecario'), (req, res) => {
    const id = String(req.body.id || '').trim();
    const nombre = String(req.body.nombre || '').trim();
    if (!id || !nombre) return res.status(400).json({ error: 'Falta el legajo o el nombre' });
    if (biblio.alumnos.has(id)) return res.status(409).json({ error: 'Ya existe un alumno con ese legajo' });
    biblio.agregarAlumno({ id, nombre });
    res.status(201).json({ id, nombre });
  });

  app.post('/api/libros', exigir('bibliotecario'), (req, res) => {
    const titulo = String(req.body.titulo || '').trim();
    const autor = String(req.body.autor || '').trim();
    const cantidad = Number(req.body.cantidad);
    if (!titulo || !autor) return res.status(400).json({ error: 'Falta el título o el autor' });
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return res.status(400).json({ error: 'La cantidad tiene que ser un número entero mayor a 0' });
    }
    const id = 'L' + (biblio.libros.size + 1);
    biblio.agregarLibro({ id, titulo, autor, cantidad });
    res.status(201).json({ id, titulo, autor, cantidad });
  });

  // ---------- Modo demo (reloj simulado) ----------
  app.get('/api/reloj', (req, res) => res.json({ demo, ahora: ahora() }));
  app.post('/api/demo/avanzar', exigir('bibliotecario'), (req, res) => {
    if (!demo) return res.status(404).json({ error: 'El modo demo está desactivado' });
    const dias = Number(req.body.dias);
    if (!Number.isFinite(dias) || dias < 0 || dias > 60) {
      return res.status(400).json({ error: 'Días inválidos (0 a 60)' });
    }
    desfase += dias * DIA;
    res.json({ ahora: ahora() });
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use((err, req, res, next) => {
    if (err instanceof ReglaError) return res.status(409).json({ codigo: err.codigo, error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  });
  return app;
}

if (require.main === module) {
  const biblio = new Biblioteca();
  sembrar(biblio);
  const puerto = process.env.PORT || 3000;
  crearApp({ biblio }).listen(puerto, () => console.log('BiblioEscolar en http://localhost:' + puerto));
}
module.exports = { crearApp };
