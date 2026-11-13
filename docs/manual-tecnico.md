# Manual técnico – BiblioEscolar

## 1. Arquitectura
```
Navegador (public/index.html + app.js)
        │  HTTP + JSON  (Authorization: Bearer <token>)
        ▼
API Express (src/server.js)      ← autenticación, permisos, validación de datos
        │
        ▼
Lógica de negocio (src/biblioteca.js)   ← TODAS las reglas RN1–RN13
        │
        ▼
Datos: memoria (actual) → PostgreSQL/Neon (tarea T9)
```
**Decisión clave:** la lógica no depende de Express. Se puede testear sin servidor y es fácil cambiar la forma de guardar los datos.

## 2. Estructura de carpetas
```
biblioescolar/
├── AGENTS.md              Reglamento de la obra
├── README.md
├── package.json
├── .cursor/rules/         Reglas de cada agente
├── docs/                  Documentación (este manual y los demás)
├── public/                Frontend (index.html, app.js, config.js)
├── src/
│   ├── biblioteca.js      Reglas de negocio
│   ├── server.js          API y servidor de archivos
│   └── datos-iniciales.js Datos de ejemplo
└── test/
    ├── biblioteca.test.js Tests de reglas (15)
    └── api.test.js        Tests de la API (8)
```

## 3. Módulo `Biblioteca`
| Método | Qué hace | Reglas |
|---|---|---|
| `prestar(alumnoId, libroId, ahora)` | Valida y crea el préstamo | RN1–RN5, RN10, RN12 |
| `devolver(prestamoId, ahora)` | Cierra el préstamo, sanciona si hay atraso, activa la fila | RN10, RN12 |
| `renovar(prestamoId, ahora)` | Suma 7 días una sola vez | RN6, RN7 |
| `reservar(alumnoId, libroId, ahora)` | Pone en la fila | RN8, RN9 |
| `cancelarReserva(reservaId, ahora)` | Cierra la reserva | RN13 |
| `disponibles(libroId, ahora)` | Ejemplares libres (procesa reservas vencidas) | RN3, RN11 |

**El reloj es un parámetro (`ahora`)**, no `Date.now()` adentro. Así los tests prueban plazos de 7 días o 48 horas al instante, y el modo demo puede adelantar el reloj.

### Cálculo de disponibles
`disponibles = ejemplares − préstamos activos − reservas "lista"`

Una reserva "lista" guarda un ejemplar para ese alumno, por eso resta.

### Ciclo de vida de una reserva
```
espera ──(se libera un ejemplar)──► lista ──(el alumno retira)──► cumplida
   │                                  │
   └──(cancela)──► cancelada          └──(pasan 48 hs)──► vencida
```
`_procesar(libroId, ahora)` se ejecuta antes de cada consulta: vence las listas pasadas de tiempo y promueve a la primera de la fila (por orden de `creada`) mientras haya ejemplares libres.

### Sanción
`días = min(ceil(atraso en días) × 2, 30)`; `sancionHasta = max(sanción actual, ahora + días)`. Devolver en la fecha exacta de vencimiento no es atraso.

## 4. API
Prefijo `/api`. Todas las respuestas son JSON. Autenticación con `Authorization: Bearer <token>`.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/alumnos-login` | público | Alumnos para elegir al ingresar |
| POST | `/login` | público | Body: `{rol, clave}` o `{rol:"alumno", alumnoId}`. Devuelve `{token, rol}` |
| GET | `/libros` | público | Catálogo con `disponibles` y `enEspera` |
| GET | `/mi-cuenta` | alumno | Alumno, préstamos activos y reservas vigentes |
| POST | `/reservas` | cualquiera | Body: `{libroId}` (el bibliotecario puede enviar `alumnoId`) |
| DELETE | `/reservas/:id` | dueño | Cancela una reserva |
| POST | `/prestamos/:id/renovar` | dueño | Renueva |
| GET | `/prestamos` | bibliotecario | Préstamos activos |
| POST | `/prestamos` | bibliotecario | Body: `{alumnoId, libroId}` |
| POST | `/prestamos/:id/devolver` | bibliotecario | Registra devolución |
| GET/POST | `/alumnos` | bibliotecario | Lista / alta (`{id, nombre}`) |
| POST | `/libros` | bibliotecario | Alta (`{titulo, autor, cantidad}`) |
| GET | `/reloj` | público | `{demo, ahora}` |
| POST | `/demo/avanzar` | bibliotecario | Body: `{dias}` (0 a 60) |

### Códigos de respuesta
| Código | Cuándo |
|---|---|
| 200 / 201 | Éxito / creado |
| 400 | Datos inválidos (faltan campos, cantidad no válida) |
| 401 | Sin sesión o clave incorrecta |
| 403 | Rol sin permiso, o recurso de otro alumno (RN14) |
| 409 | Se violó una regla de negocio. Incluye `codigo` y `error` |
| 500 | Error interno |

### Códigos de regla (campo `codigo` en 409)
`SANCIONADO`, `TIENE_VENCIDO`, `LIMITE_PRESTAMOS`, `LIBRO_REPETIDO`, `SIN_EJEMPLARES`, `YA_RENOVADO`, `VENCIDO`, `LIBRO_RESERVADO`, `HAY_EJEMPLARES`, `RESERVA_REPETIDA`, `LIMITE_RESERVAS`, `RESERVA_INVALIDA`, `PRESTAMO_INVALIDO`, `ALUMNO_NO_EXISTE`, `LIBRO_NO_EXISTE`.

Ejemplo:
```
POST /api/prestamos   (como bibliotecario)
{ "alumnoId": "1001", "libroId": "L1" }
→ 201 { "id": 1, "alumnoId": "1001", "libroId": "L1", "vence": 1795137706056, ... }
```

## 5. Seguridad

- **Roles:** el token se genera con `crypto.randomBytes` y se guarda en el servidor. Cada ruta verifica el rol (RN14).
- **Propiedad:** un alumno solo puede renovar y cancelar lo suyo.
- **Secretos:** `BIBLIOTECARIO_CLAVE` y `DATABASE_URL` se leen de variables de entorno. El `.env` está en el `.gitignore`.
- **CORS:** con `FRONTEND_URL` definida, solo ese origen puede llamar al backend.
- **XSS:** el frontend crea el DOM con `createElement` y `textContent`, nunca con `innerHTML`.
- **Validación:** los endpoints de alta validan tipos y rangos.

### Limitaciones conocidas

1. Los alumnos ingresan eligiendo su nombre, sin contraseña.
2. Los datos están en memoria: al reiniciar el servidor se pierden (se vuelve a los datos de ejemplo).
3. Las sesiones también están en memoria.
4. No hay límite de intentos de login.

## 6. Cómo extenderlo

- **Agregar una regla:** (1) escribirla en `spec.md`, (2) escribir el test, (3) implementarla en `biblioteca.js` citando la RN, (4) agregarla a la matriz de trazabilidad.
- **Cambiar un valor** (ej. días de préstamo): modificar las constantes del inicio de `biblioteca.js` y actualizar la spec y los tests.
- **Pasar a PostgreSQL (T9):** crear las 4 tablas del modelo de datos, reemplazar los arrays/Maps de la clase por consultas, manteniendo los mismos métodos para que los tests se sigan cumpliendo.
