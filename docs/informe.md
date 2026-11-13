# Informe del proyecto – BiblioEscolar

## 1. Qué hicimos
Un sistema de préstamos de biblioteca con 14 reglas de negocio (ver `spec.md`). Seguimos el proceso del curso: idea → decisiones → glosario → preguntas abiertas → spec → agentes → plan → tareas → código con tests.

## 2. Por qué ese orden de tareas
Empezamos por préstamos (T1, T2) porque todas las demás reglas dependen de ellos: no se puede devolver, renovar ni reservar sin un préstamo. Después hicimos devoluciones y sanciones (T3). Las reservas (T4 y T5) son la parte más difícil, porque hay que manejar la fila, las 48 horas y qué pasa si dos alumnos quieren el mismo libro, así que las hicimos antes de la API y las pantallas. La renovación (T6) quedó después porque necesita saber si hay reservas. La API (T7) va después de la lógica porque solo la usa, y el frontend (T8) al final porque depende de la API.

## 3. Pruebas realizadas
Se corrieron 15 tests automáticos con `npm test`. Resultado: **15 pasan, 0 fallan**.

| Regla | Qué se probó |
|---|---|
| RN1 | El préstamo vence a los 7 días |
| RN2 | No se pueden tener más de 3 préstamos |
| RN3 | No se presta un ejemplar que ya no está |
| RN4 | No se repite el mismo libro |
| RN5 | Con un vencido no se retira otro |
| RN6 / RN7 | Una sola renovación; no si está vencido o reservado |
| RN8 / RN9 | Reservar solo sin ejemplares; máximo 2; no reservar lo que ya se tiene |
| RN10 / RN11 | La reserva queda lista 48 hs y después pasa al siguiente |
| RN12 | Sanción de 2 días por día de atraso, tope 30, y sin atraso si se devuelve en la fecha exacta |
| RN13 | Cancelar reserva |

Todavía falta probar los endpoints con una colección de Postman y anotar los resultados acá.

## 4. Plan técnico
Ver `plan.md`.

## 5. Qué falta
Las tareas T8 (frontend), T9 (base de datos) y T10 (publicación). Están sin marcar en `tasks.md`.
