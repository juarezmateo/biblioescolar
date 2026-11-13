const API = window.API_URL || '';
let token = sessionStorage.getItem('token');
let sesion = JSON.parse(sessionStorage.getItem('sesion') || 'null');
let pantalla = null;

const raiz = document.getElementById('app');
const barra = document.getElementById('barra');
const zonaMensaje = document.getElementById('mensaje');

// Crea elementos sin usar innerHTML (así no se puede inyectar HTML)
function h(tag, props = {}, ...hijos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k.startsWith('on')) e[k] = v;
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  for (const x of hijos.flat()) e.append(x instanceof Node ? x : document.createTextNode(x ?? ''));
  return e;
}

const fecha = ms => new Date(ms).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

function mostrar(texto, tipo = 'ok') {
  zonaMensaje.replaceChildren(h('div', { class: tipo }, texto));
  setTimeout(() => zonaMensaje.replaceChildren(), 6000);
}

async function api(metodo, url, cuerpo) {
  const r = await fetch(API + url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && token) salir();
    throw new Error(datos.error || 'Ocurrió un error');
  }
  return datos;
}

// Ejecuta una acción, muestra el resultado y vuelve a dibujar la pantalla
async function accion(fn, textoOk) {
  try { await fn(); if (textoOk) mostrar(textoOk); }
  catch (e) { mostrar(e.message, 'error'); }
  dibujar();
}

function salir() {
  token = null; sesion = null; pantalla = null;
  sessionStorage.clear();
  dibujar();
}

function tabla(columnas, filas, vacio = 'No hay datos para mostrar.') {
  if (!filas.length) return h('p', {}, vacio);
  return h('div', { class: 'tabla-scroll' }, h('table', {},
    h('thead', {}, h('tr', {}, columnas.map(c => h('th', {}, c)))),
    h('tbody', {}, filas.map(f => h('tr', {}, f.map(c => h('td', {}, c)))))));
}

function menu(opciones) {
  return h('nav', {}, opciones.map(([id, texto]) =>
    h('button', { class: pantalla === id ? 'activa' : '', onclick: () => { pantalla = id; dibujar(); } }, texto)));
}

// ---------- Pantalla de ingreso ----------
async function pantallaLogin() {
  let alumnos = [];
  try { alumnos = await api('GET', '/api/alumnos-login'); } catch (e) { mostrar(e.message, 'error'); }

  const selAlumno = h('select', {}, alumnos.map(a => h('option', { value: a.id }, `${a.nombre} (legajo ${a.id})`)));
  const clave = h('input', { type: 'password', placeholder: 'Clave', autocomplete: 'current-password' });

  const entrar = async cuerpo => {
    try {
      const d = await api('POST', '/api/login', cuerpo);
      token = d.token; sesion = { rol: d.rol, alumnoId: d.alumnoId };
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('sesion', JSON.stringify(sesion));
      pantalla = null;
      dibujar();
    } catch (e) { mostrar(e.message, 'error'); }
  };

  raiz.replaceChildren(
    h('section', {}, h('h2', {}, 'Soy alumno/a'),
      h('form', { onsubmit: ev => { ev.preventDefault(); entrar({ rol: 'alumno', alumnoId: selAlumno.value }); } },
        h('label', {}, 'Elegí tu nombre', selAlumno),
        h('button', { class: 'principal' }, 'Ingresar'))),
    h('section', {}, h('h2', {}, 'Soy bibliotecario/a'),
      h('form', { onsubmit: ev => { ev.preventDefault(); entrar({ rol: 'bibliotecario', clave: clave.value }); } },
        h('label', {}, 'Clave', clave),
        h('button', { class: 'principal' }, 'Ingresar'))));
}

// ---------- Alumno ----------
async function pantallaCatalogo() {
  const libros = await api('GET', '/api/libros');
  return h('section', {}, h('h2', {}, 'Catálogo'),
    tabla(['Título', 'Autor', 'Disponibles', 'En espera', ''],
      libros.map(l => [l.titulo, l.autor,
        h('span', { class: 'etiqueta ' + (l.disponibles > 0 ? 'verde' : 'roja') }, `${l.disponibles} de ${l.cantidad}`),
        String(l.enEspera),
        l.disponibles > 0 ? 'Pedilo en la biblioteca'
          : h('button', { onclick: () => accion(() => api('POST', '/api/reservas', { libroId: l.id }), 'Reserva realizada') }, 'Reservar')])));
}

async function pantallaMiCuenta() {
  const c = await api('GET', '/api/mi-cuenta');
  const partes = [];
  if (c.alumno.sancionHasta) {
    partes.push(h('div', { class: 'error' }, `Estás sancionado/a hasta el ${fecha(c.alumno.sancionHasta)}. No podés retirar libros hasta entonces.`));
  }
  partes.push(h('section', {}, h('h2', {}, 'Mis préstamos'),
    tabla(['Libro', 'Vence', 'Estado', ''],
      c.prestamos.map(p => [p.titulo, fecha(p.vence),
        h('span', { class: 'etiqueta ' + (p.vencido ? 'roja' : 'verde') }, p.vencido ? 'Vencido' : 'Vigente'),
        p.renovaciones >= 1 ? 'Ya renovado'
          : h('button', { onclick: () => accion(() => api('POST', `/api/prestamos/${p.id}/renovar`), 'Préstamo renovado') }, 'Renovar')]),
      'No tenés préstamos activos.')));
  partes.push(h('section', {}, h('h2', {}, 'Mis reservas'),
    tabla(['Libro', 'Estado', ''],
      c.reservas.map(r => [r.titulo,
        r.estado === 'lista' ? `¡Lista para retirar! Hasta el ${fecha(r.venceEn)}` : 'En espera',
        h('button', { class: 'peligro', onclick: () => accion(() => api('DELETE', `/api/reservas/${r.id}`), 'Reserva cancelada') }, 'Cancelar')]),
      'No tenés reservas.')));
  return h('div', {}, partes);
}

// ---------- Bibliotecario ----------
async function pantallaPrestamos() {
  const ps = await api('GET', '/api/prestamos');
  return h('section', {}, h('h2', {}, 'Préstamos activos'),
    tabla(['Alumno', 'Libro', 'Vence', 'Estado', ''],
      ps.map(p => [p.alumno, p.titulo, fecha(p.vence),
        h('span', { class: 'etiqueta ' + (p.vencido ? 'roja' : 'verde') }, p.vencido ? 'Vencido' : 'Vigente'),
        h('button', { onclick: () => accion(() => api('POST', `/api/prestamos/${p.id}/devolver`), 'Devolución registrada') }, 'Devolver')]),
      'No hay préstamos activos.'));
}

async function pantallaPrestar() {
  const [alumnos, libros] = await Promise.all([api('GET', '/api/alumnos'), api('GET', '/api/libros')]);
  const selA = h('select', {}, alumnos.map(a => h('option', { value: a.id }, `${a.nombre} (${a.prestamosActivos}/3)${a.sancionado ? ' – SANCIONADO' : ''}`)));
  const selL = h('select', {}, libros.map(l => h('option', { value: l.id }, `${l.titulo} – disp. ${l.disponibles}`)));
  return h('section', {}, h('h2', {}, 'Registrar préstamo'),
    h('p', {}, 'Si el alumno tiene una reserva lista de ese libro, se retira con ella.'),
    h('form', { onsubmit: ev => { ev.preventDefault(); accion(() => api('POST', '/api/prestamos', { alumnoId: selA.value, libroId: selL.value }), 'Préstamo registrado'); } },
      h('label', {}, 'Alumno', selA), h('label', {}, 'Libro', selL), h('button', { class: 'principal' }, 'Prestar')));
}

async function pantallaLibros() {
  const libros = await api('GET', '/api/libros');
  const t = h('input', { required: '', placeholder: 'Título' });
  const a = h('input', { required: '', placeholder: 'Autor' });
  const n = h('input', { required: '', type: 'number', min: '1', value: '1', style: 'width:80px' });
  return h('div', {},
    h('section', {}, h('h2', {}, 'Agregar libro'),
      h('form', { onsubmit: ev => { ev.preventDefault(); accion(() => api('POST', '/api/libros', { titulo: t.value, autor: a.value, cantidad: n.value }), 'Libro agregado'); } },
        h('label', {}, 'Título', t), h('label', {}, 'Autor', a), h('label', {}, 'Ejemplares', n), h('button', { class: 'principal' }, 'Agregar'))),
    h('section', {}, h('h2', {}, 'Libros'),
      tabla(['Título', 'Autor', 'Ejemplares', 'Disponibles', 'En espera'],
        libros.map(l => [l.titulo, l.autor, String(l.cantidad), String(l.disponibles), String(l.enEspera)]))));
}

async function pantallaAlumnos() {
  const alumnos = await api('GET', '/api/alumnos');
  const id = h('input', { required: '', placeholder: 'Legajo' });
  const nombre = h('input', { required: '', placeholder: 'Nombre y apellido' });
  return h('div', {},
    h('section', {}, h('h2', {}, 'Agregar alumno'),
      h('form', { onsubmit: ev => { ev.preventDefault(); accion(() => api('POST', '/api/alumnos', { id: id.value, nombre: nombre.value }), 'Alumno agregado'); } },
        h('label', {}, 'Legajo', id), h('label', {}, 'Nombre', nombre), h('button', { class: 'principal' }, 'Agregar'))),
    h('section', {}, h('h2', {}, 'Alumnos'),
      tabla(['Legajo', 'Nombre', 'Préstamos', 'Estado'],
        alumnos.map(a => [a.id, a.nombre, `${a.prestamosActivos}/3`,
          h('span', { class: 'etiqueta ' + (a.sancionado ? 'roja' : 'verde') }, a.sancionado ? `Sancionado hasta ${fecha(a.sancionHasta)}` : 'Habilitado')]))));
}

async function pantallaDemo() {
  const r = await api('GET', '/api/reloj');
  if (!r.demo) return h('section', {}, h('p', {}, 'El modo demo está desactivado.'));
  const boton = dias => h('button', { onclick: () => accion(() => api('POST', '/api/demo/avanzar', { dias }), `Reloj adelantado ${dias} día(s)`) }, `+${dias} día${dias > 1 ? 's' : ''}`);
  return h('section', {}, h('h2', {}, 'Reloj de demostración'),
    h('p', {}, 'Sirve para probar vencimientos, sanciones y reservas sin esperar días reales. Fecha del sistema: ', h('b', {}, fecha(r.ahora))),
    h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, boton(1), boton(2), boton(7), boton(8), boton(15)));
}

// ---------- Armado general ----------
const MENUS = {
  alumno: [['catalogo', 'Catálogo'], ['cuenta', 'Mi cuenta']],
  bibliotecario: [['prestamos', 'Préstamos activos'], ['prestar', 'Prestar'], ['libros', 'Libros'], ['alumnos', 'Alumnos'], ['demo', 'Reloj demo']],
};
const VISTAS = { catalogo: pantallaCatalogo, cuenta: pantallaMiCuenta, prestamos: pantallaPrestamos, prestar: pantallaPrestar, libros: pantallaLibros, alumnos: pantallaAlumnos, demo: pantallaDemo };

async function dibujar() {
  if (!sesion) {
    barra.replaceChildren();
    return pantallaLogin();
  }
  if (!pantalla) pantalla = MENUS[sesion.rol][0][0];
  barra.replaceChildren(
    h('span', {}, sesion.rol === 'bibliotecario' ? 'Bibliotecario/a ' : 'Alumno/a '),
    h('button', { onclick: salir }, 'Salir'));
  try {
    const contenido = await VISTAS[pantalla]();
    raiz.replaceChildren(menu(MENUS[sesion.rol]), contenido);
  } catch (e) {
    mostrar(e.message, 'error');
  }
}

dibujar();
