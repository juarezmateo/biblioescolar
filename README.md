# BiblioEscolar 

Sistema de préstamos y reservas para la biblioteca de un colegio secundario.

## Link público
- Frontend: *(completar cuando se publique en Netlify)*
- Backend: *(completar cuando se publique en Render)*

## Cómo correrlo
```
npm install
npm test        # corre los 15 tests
npm start       # levanta la API en el puerto 3000
```

## Variables de entorno (archivo .env, nunca se sube a GitHub)
- `FRONTEND_URL`: dirección del frontend, para CORS.
- `DATABASE_URL`: cadena de conexión a Neon (cuando se conecte la base).
- `PORT`: lo pone Render solo.

## Documentación
Está en la carpeta `docs/`: idea, decisiones, glosario, preguntas abiertas, spec, plan, tasks e informe. El reglamento de los agentes está en `AGENTS.md` y `.cursor/rules/`.
