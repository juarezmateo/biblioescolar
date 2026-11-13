# AGENTS.md – Reglamento de la obra

## Proyecto
BiblioEscolar: préstamos de biblioteca escolar. Ver `docs/idea.md`.

## Fuente de verdad
`docs/spec.md` manda sobre todo lo demás. Si algo no está en la spec, se pregunta; no se inventa.

## Stack
Node.js + Express (backend), tests con `node --test`. Frontend: React + Vite. Base de datos: PostgreSQL en Neon (cuando se conecte).

## Reglas generales
- Cada regla del código cita su RN en un comentario.
- Un commit por tarea.
- Secretos solo en `.env`, nunca en el repo.
- Los tests se escriben antes que el código y el desarrollador no los modifica.

## Agentes
Analista, arquitecto, desarrollador, tester y revisor. Sus reglas están en `.cursor/rules/`.
