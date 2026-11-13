# Informe del proyecto – BiblioEscolar

## 1. Qué hicimos
Un sistema funcional de préstamos de biblioteca con 14 reglas de negocio (`spec.md`), una API, un frontend con 8 pantallas y la documentación completa: relevamiento, manuales de usuario, técnico e instalación, y plan de pruebas. Seguimos el proceso del curso: idea → decisiones → glosario → preguntas abiertas → spec → agentes → plan → tareas → código con tests.

## 2. Por qué ese orden de tareas
Empezamos por préstamos (T1, T2) porque todas las demás reglas dependen de ellos: no se puede devolver, renovar ni reservar sin un préstamo. Después hicimos devoluciones y sanciones (T3). Las reservas (T4 y T5) son la parte más difícil, porque hay que manejar la fila, las 48 horas y qué pasa si dos alumnos quieren el mismo libro, así que las hicimos antes de la API y las pantallas. La renovación (T6) quedó después porque necesita saber si hay reservas. La API (T7) va después de la lógica porque solo la usa, y el frontend (T8) al final porque depende de la API. Como el reloj es un parámetro de la lógica, pudimos probar plazos de días y horas sin esperar.

## 3. Pruebas realizadas
`npm test`: **23 pruebas, 23 pasan, 0 fallan** (15 de reglas de negocio y 8 de la API). Además se probó que el servidor levanta, sirve las pantallas y responde al ingresar y prestar. El detalle y los casos manuales y de Postman están en `plan-de-pruebas.md`.

Resumen por regla: RN1 a RN13 con tests de lógica; RN14 con tests de API (401 sin sesión, 403 para alumno).

## 4. Plan técnico
Ver `plan.md` y `manual-tecnico.md`.

## 5. Estado y pendientes

- Hecho: T1 a T8 y T9a (documentación).
- Pendiente: T9 (base de datos PostgreSQL), T10 (publicación en internet) y T11 (pruebas manuales y Postman en el servidor publicado).
- Limitaciones conocidas: los alumnos ingresan sin contraseña y los datos están en memoria (ver riesgos en `relevamiento.md`).
