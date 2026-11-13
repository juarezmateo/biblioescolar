# AGENTS.md – Reglamento de la obra

## Proyecto
BiblioEscolar: préstamos de biblioteca escolar. Ver `docs/idea.md`.

## Fuente de verdad
`docs/spec.md` manda sobre todo lo demás. Si algo no está en la spec, se pregunta; no se inventa.

## Stack
Node.js + Express (backend, también sirve el frontend). Frontend: HTML + JavaScript sin framework (carpeta public/). Tests con `node --test`. Base de datos: PostgreSQL en Neon (pendiente, T9).

## Reglas generales
- Cada regla del código cita su RN en un comentario.
- Un commit por tarea.
- Secretos solo en `.env`, nunca en el repo.
- Los tests se escriben antes que el código y el desarrollador no los modifica.

## Agentes
Analista, arquitecto, desarrollador, tester y revisor. Sus reglas están en `.cursor/rules/`.
