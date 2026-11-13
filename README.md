# BiblioEscolar 📚

Sistema web de préstamos, devoluciones y reservas para la biblioteca de un colegio secundario.

## Link público
- Aplicación: *(completar con la dirección de Render cuando se publique)*
- Usuario de prueba alumno: elegir cualquier nombre de la lista.
- Usuario de prueba bibliotecario: la clave se define en `BIBLIOTECARIO_CLAVE` *(en desarrollo: `biblio123`)*.

## Cómo correrlo
```
npm install
npm test        # 23 tests
npm start       # http://localhost:3000
```
Copiar `.env.example` a `.env` y cambiar la clave. **El `.env` no se sube a GitHub.**

## Qué hace
- Alumnos: ven el catálogo, reservan libros ocupados, renuevan y ven su sanción.
- Bibliotecario: presta, recibe devoluciones, agrega libros y alumnos.
- 14 reglas de negocio: máximo 3 libros, 7 días, una renovación, fila de reservas con 48 hs para retirar, sanciones por atraso.

## Documentación (carpeta `docs/`)
| Documento | Contenido |
|---|---|
| `relevamiento.md` | Situación actual, objetivos, alcance, requerimientos, riesgos, trazabilidad |
| `idea.md`, `decisiones.md`, `glosario.md`, `preguntas-abiertas.md` | Proceso de definición |
| `spec.md` | Reglas de negocio (RN) e historias de usuario (HU) |
| `plan.md`, `tasks.md` | Plan técnico y tareas |
| `manual-usuario.md` | Manual del alumno y del bibliotecario |
| `manual-tecnico.md` | Arquitectura, API, seguridad, cómo extender |
| `manual-instalacion.md` | Instalación, variables de entorno y despliegue |
| `plan-de-pruebas.md` | Pruebas automáticas, manuales y Postman |
| `informe.md` | Informe final |

`AGENTS.md` y `.cursor/rules/` tienen el reglamento de los agentes.

## Estado
Ver `docs/tasks.md`. Pendiente: base de datos persistente (T9) y publicación (T10).
