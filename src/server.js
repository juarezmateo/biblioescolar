const express = require('express');
const { Biblioteca, ReglaError } = require('./biblioteca');

const app = express();
app.use(express.json());

// CORS: solo acepta pedidos del frontend (FRONTEND_URL va en el .env / panel de Render)
app.use((req, res, next) => {
  const permitido = process.env.FRONTEND_URL;
  if (permitido) res.header('Access-Control-Allow-Origin', permitido);
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-rol');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const biblio = new Biblioteca();
biblio.agregarAlumno({ id: 'ana', nombre: 'Ana' });
biblio.agregarLibro({ id: 'L1', titulo: 'Don Quijote', autor: 'Cervantes', cantidad: 2 });

// RN14: solo el bibliotecario presta y devuelve (versión simple, por header)
function soloBibliotecario(req, res, next) {
  if (req.get('x-rol') !== 'bibliotecario') {
    return res.status(403).json({ error: 'Solo el bibliotecario puede hacer esto' });
  }
  next();
}
const ahora = () => Date.now();

app.get('/libros', (req, res) => {
  const lista = [...biblio.libros.values()].map(l => ({ ...l, disponibles: biblio.disponibles(l.id, ahora()) }));
  res.json(lista);
});
app.post('/prestamos', soloBibliotecario, (req, res) =>
  res.status(201).json(biblio.prestar(req.body.alumnoId, req.body.libroId, ahora())));
app.post('/prestamos/:id/devolver', soloBibliotecario, (req, res) =>
  res.json(biblio.devolver(Number(req.params.id), ahora())));
app.post('/prestamos/:id/renovar', (req, res) =>
  res.json(biblio.renovar(Number(req.params.id), ahora())));
app.post('/reservas', (req, res) =>
  res.status(201).json(biblio.reservar(req.body.alumnoId, req.body.libroId, ahora())));
app.delete('/reservas/:id', (req, res) =>
  res.json(biblio.cancelarReserva(Number(req.params.id), ahora())));
app.get('/alumnos/:id/prestamos', (req, res) =>
  res.json(biblio.prestamos.filter(p => p.alumnoId === req.params.id && !p.devueltoEn)));

app.use((err, req, res, next) => {
  if (err instanceof ReglaError) return res.status(409).json({ codigo: err.codigo, error: err.message });
  res.status(500).json({ error: 'Error interno' });
});

const puerto = process.env.PORT || 3000;
if (require.main === module) app.listen(puerto, () => console.log('BiblioEscolar en puerto ' + puerto));
module.exports = app;
