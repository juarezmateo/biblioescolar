# Plan técnico

## Arquitectura
Frontend (HTML + JS en `public/`) → API (Express) → lógica (`src/biblioteca.js`) → datos.
Express sirve también el frontend, así que se publica un solo servicio.
La lógica es una clase independiente de Express, así se testea sin levantar el servidor.

## Base de datos
PostgreSQL (Neon), porque los datos están muy relacionados (alumnos, libros, préstamos, reservas) y necesitamos integridad. Por ahora los datos viven en memoria, que sirve para los tests.

## Modelo de datos

- alumno(id, nombre, sancionHasta)
- libro(id, titulo, autor, cantidad)
- prestamo(id, alumnoId, libroId, desde, vence, renovaciones, devueltoEn)
- reserva(id, alumnoId, libroId, creada, estado, venceEn)

## API
Ver la tabla completa en `manual-tecnico.md`.

## Dónde vive cada regla
Todas las RN están en `src/biblioteca.js`. Las rutas solo traducen HTTP (RN14 se chequea en la ruta con el rol).

## Decisiones técnicas

- Frontend sin framework: son pocas pantallas y así no hace falta paso de compilación; el DOM se arma con `createElement` (sin `innerHTML`).
- El reloj se pasa como parámetro (`ahora`) para testear plazos de 7 días y 48 horas sin esperar.
- Los errores de regla llevan un código (`ReglaError.codigo`) y la API los devuelve como 409.

## Preguntas para el analista

- ¿Cómo se autentica cada alumno? Por ahora elige su nombre; queda pendiente una clave por alumno.
