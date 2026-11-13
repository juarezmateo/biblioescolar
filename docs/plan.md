# Plan técnico

## Arquitectura
Frontend (React) → API (Express) → lógica (`src/biblioteca.js`) → base de datos.
La lógica es una clase independiente de Express, así se testea sin levantar el servidor.

## Base de datos
PostgreSQL (Neon), porque los datos están muy relacionados (alumnos, libros, préstamos, reservas) y necesitamos integridad. Por ahora los datos viven en memoria, que sirve para los tests.

## Modelo de datos
- alumno(id, nombre, sancionHasta)
- libro(id, titulo, autor, cantidad)
- prestamo(id, alumnoId, libroId, desde, vence, renovaciones, devueltoEn)
- reserva(id, alumnoId, libroId, creada, estado, venceEn)

## API
- GET /libros
- POST /prestamos
- POST /prestamos/:id/devolver
- POST /prestamos/:id/renovar
- POST /reservas
- DELETE /reservas/:id
- GET /alumnos/:id/prestamos

## Dónde vive cada regla
Todas las RN están en `src/biblioteca.js`. Las rutas solo traducen HTTP (RN14 se chequea en la ruta con el rol).

## Decisiones técnicas
- El reloj se pasa como parámetro (`ahora`) para testear plazos de 7 días y 48 horas sin esperar.
- Los errores de regla llevan un código (`ReglaError.codigo`) y la API los devuelve como 409.

## Preguntas para el analista
- ¿Cómo se autentica cada rol? Por ahora un header; se mejora después.
