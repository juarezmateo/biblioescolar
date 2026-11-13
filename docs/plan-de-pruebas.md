# Plan de pruebas

## 1. Pruebas automáticas
Comando: `npm test` → **23 tests, 23 pasan, 0 fallan.**

### Reglas de negocio (`test/biblioteca.test.js`, 15 tests)
RN1 duración 7 días · RN2 máximo 3 · RN3 sin ejemplares · RN4 libro repetido · RN5 vencido bloquea · RN12 sanción (fecha exacta, 3 días = 6, tope 30) · RN8 y RN9 reservas · RN10 y RN11 reserva lista y vencimiento 48 hs · RN13 cancelar · RN6 y RN7 renovación.

### API (`test/api.test.js`, 8 tests)

1. Login con clave incorrecta → 401.
2. Sin sesión → 401; alumno prestando → 403 (RN14).
3. Préstamo → 201; el 4º → 409 `LIMITE_PRESTAMOS`.
4. Alumno renovando el préstamo de otro → 403.
5. Flujo completo de reserva: reservar, devolver, la reserva queda lista y se retira.
6. Modo demo: tras 8 días el préstamo figura vencido.
7. Devolución tardía → sanción visible en "mi cuenta".
8. Validación: cantidad de ejemplares 0 → 400.

## 2. Pruebas manuales (en el navegador)
Completar la columna **Resultado** al probar (OK / FALLA) y anotar la fecha.

| Código | Pasos | Resultado esperado | Resultado |
|---|---|---|---|
| CP01 | Ingresar como alumno "Ana Pérez" | Se ve el Catálogo | |
| CP02 | Ingresar como bibliotecario con clave incorrecta | Mensaje "Clave incorrecta" | |
| CP03 | Bibliotecario: prestar "Don Quijote" a Ana | "Préstamo registrado"; aparece en Préstamos activos | |
| CP04 | Prestar el mismo libro a Beto | Error "No hay ejemplares disponibles" | |
| CP05 | Como Beto: Catálogo → Reservar "Don Quijote" | "Reserva realizada"; en Catálogo "En espera: 1" | |
| CP06 | Bibliotecario: devolver el libro de Ana | Para Beto la reserva figura "Lista para retirar" | |
| CP07 | Prestar "Don Quijote" a Dani | Error (el ejemplar está guardado para Beto) | |
| CP08 | Prestar "Don Quijote" a Beto | Se registra el préstamo | |
| CP09 | Prestar 3 libros a Cami y un cuarto | Error "Ya tiene 3 préstamos" | |
| CP10 | Como Ana: renovar un préstamo | Vence 7 días más tarde; el botón pasa a "Ya renovado" | |
| CP11 | Reloj demo +8 días | Los préstamos figuran "Vencido" | |
| CP12 | Con un vencido, intentar prestar otro al mismo alumno | Error "Tiene un préstamo vencido" | |
| CP13 | Devolver el vencido (8 días = 1 día de atraso) | Alumno sancionado 2 días; aviso rojo en "Mi cuenta" | |
| CP14 | Intentar prestarle durante la sanción | Error "El alumno está sancionado" | |
| CP15 | Alumno intenta reservar un libro disponible | Error "Hay ejemplares, pedilo directamente" | |
| CP16 | Agregar libro con 2 ejemplares | Aparece en el catálogo con 2 disponibles | |
| CP17 | Agregar alumno con legajo repetido | Error "Ya existe un alumno con ese legajo" | |
| CP18 | Salir y abrir el panel de bibliotecario sin ingresar | Vuelve al ingreso | |

## 3. Pruebas con Postman
Se incluye la colección `docs/postman/BiblioEscolar.postman_collection.json`.

1. Importarla en Postman.
2. Ejecutar **Login bibliotecario**: el test guarda el token en la variable `token`.
3. Ejecutar el resto en orden. La variable `base` es `http://localhost:3000` (cambiarla por la dirección de Render para probar en internet).

## 4. Informe de resultados
| Fecha | Tipo | Resultado |
|---|---|---|
| *(hoy)* | Automáticas | 23/23 pasan |
| *[completar]* | Manuales (CP01–CP18) | |
| *[completar]* | Postman en el servidor publicado | |
