# Manual de instalación y despliegue

## 1. Requisitos

- Node.js 18 o superior (se probó con v22)
- npm
- Git

## 2. Instalación local
```bash
git clone <URL-DEL-REPOSITORIO>
cd biblioescolar
npm install
npm test          # debe mostrar 23 tests pasando
npm start         # abre http://localhost:3000
```
El sistema arranca con datos de ejemplo: 5 alumnos (legajos 1001 a 1005) y 8 libros.

## 3. Variables de entorno
Crear un archivo `.env` o definirlas en el servicio donde se publique. **Nunca subir el `.env` a GitHub.**

| Variable | Obligatoria | Descripción | Ejemplo |
|---|---|---|---|
| `BIBLIOTECARIO_CLAVE` | **Sí en producción** | Clave del bibliotecario. Si no se define, se usa `biblio123` (solo para desarrollo) | `una-clave-larga` |
| `FRONTEND_URL` | Solo si el front se publica aparte | Origen permitido por CORS | `https://biblioescolar.netlify.app` |
| `MODO_DEMO` | No | `no` desactiva el reloj simulado | `no` |
| `PORT` | No | Puerto (Render lo define solo) | `3000` |
| `DATABASE_URL` | Cuando se conecte la base (T9) | Cadena de conexión a Neon | *(no escribirla en el código)* |

> Node no lee `.env` solo. Para cargarlo localmente: `node --env-file=.env src/server.js`.

## 4. Publicación en Render (todo en un solo servicio)
El backend también sirve las pantallas, así que alcanza con **un** servicio.

1. Subir el proyecto a GitHub.
2. En Render: **New → Web Service** y elegir el repositorio.
3. Configurar:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. En **Environment**, cargar `BIBLIOTECARIO_CLAVE` (y `MODO_DEMO` si se quiere).
5. Desplegar. Render da una dirección tipo `https://biblioescolar.onrender.com`.
6. Copiar esa dirección en el README (sección "Link público").

Nota: en el plan gratuito el servicio se duerme; el primer pedido puede tardar unos 30 segundos.

## 5. Alternativa: frontend en Netlify + backend en Render

1. Publicar el backend en Render como en el punto 4 y definir `FRONTEND_URL` con la dirección de Netlify.
2. Editar `public/config.js`: `window.API_URL = 'https://TU-BACKEND.onrender.com';`
3. En Netlify, publicar la carpeta `public` (sin comando de build).

## 6. Base de datos en Neon (pendiente, tarea T9)

1. Crear un proyecto en Neon y copiar la cadena de conexión.
2. Guardarla como `DATABASE_URL` en `.env` (local) y en el panel de Render.
3. Crear las tablas del modelo de datos (`relevamiento.md`, sección 10).
4. Adaptar `biblioteca.js` para leer y escribir en la base.

## 7. Verificación después de publicar

- [ ] Abre la página de ingreso.
- [ ] El bibliotecario entra con la clave de producción (y no con `biblio123`).
- [ ] Se puede prestar, devolver, reservar y renovar.
- [ ] Desde la consola del navegador no hay errores de CORS.
- [ ] El repositorio no contiene `.env` ni claves.

## 8. Problemas comunes
| Problema | Causa probable | Solución |
|---|---|---|
| "Clave incorrecta" | La variable `BIBLIOTECARIO_CLAVE` no coincide | Revisar el panel de Render |
| Error de CORS | `FRONTEND_URL` mal escrita (con `/` al final, por ejemplo) | Ponerla exacta, sin barra final |
| Tarda 30 s en abrir | Plan gratuito de Render dormido | Esperar o abrir antes de la presentación |
| Se perdieron los datos | Se reinició el servidor (datos en memoria) | Conectar la base (T9) |
