# Manual de usuario – BiblioEscolar

## 1. Cómo ingresar

1. Abrí el link del sistema en el navegador (computadora o celular).
2. **Si sos alumno/a:** elegí tu nombre en la lista y apretá **Ingresar**.
3. **Si sos bibliotecario/a:** escribí la clave y apretá **Ingresar**.
4. Para salir, apretá **Salir** arriba a la derecha.

---
## 2. Manual del alumno

### 2.1 Catálogo
Muestra todos los libros con:

- **Disponibles:** verde si hay ejemplares, rojo si no hay.
- **En espera:** cuántos alumnos están en la fila.

Si un libro está disponible, **pedilo en la biblioteca** al bibliotecario. Si no hay ejemplares, aparece el botón **Reservar**.

### 2.2 Reservar un libro

1. Buscá el libro en el Catálogo.
2. Apretá **Reservar**. Quedás en la fila por orden de llegada.
3. Podés tener **hasta 2 reservas** al mismo tiempo.
4. No podés reservar un libro que ya tenés prestado.

Cuando devuelvan el libro, tu reserva pasa a **"¡Lista para retirar!"** y tenés **48 horas** para ir a buscarlo. Pasado ese tiempo la reserva vence y le toca al siguiente.

### 2.3 Mi cuenta

- **Mis préstamos:** libro, fecha de vencimiento y estado (Vigente / Vencido).
- **Renovar:** suma 7 días. Se puede **una sola vez**, y no si el préstamo ya venció o si otro alumno reservó el libro.
- **Mis reservas:** estado (En espera / Lista) y botón **Cancelar**.
- **Aviso rojo de sanción:** si lo ves, no podés retirar libros hasta la fecha que dice.

### 2.4 Reglas que tenés que saber
| Regla | Detalle |
|---|---|
| Duración | 7 días por libro |
| Máximo | 3 libros a la vez |
| Libro repetido | No podés tener dos veces el mismo libro |
| Libro vencido | Si tenés uno vencido no podés retirar otro |
| Atraso | 2 días de sanción por cada día de atraso (máximo 30) |

---
## 3. Manual del bibliotecario

### 3.1 Préstamos activos
Lista de todos los libros que están afuera, con alumno, vencimiento y estado. Los vencidos se ven en rojo. Desde acá se registra la **devolución** con el botón **Devolver**.

- Si la devolución es tardía, el sistema **sanciona automáticamente**.
- Si el libro tenía reservas, la primera de la fila queda lista por 48 horas.

### 3.2 Prestar

1. Elegí el alumno (se ve cuántos libros tiene, por ejemplo `2/3`, y si está sancionado).
2. Elegí el libro (se ve cuántos hay disponibles).
3. Apretá **Prestar**.

Si el sistema no lo permite, muestra el motivo (ver tabla de mensajes). Si el alumno tiene una **reserva lista** de ese libro, el préstamo se hace con esa reserva.

### 3.3 Libros
Completá título, autor y cantidad de ejemplares y apretá **Agregar**. Abajo está la lista con disponibles y fila de espera.

### 3.4 Alumnos
Completá legajo y nombre y apretá **Agregar**. El legajo no se puede repetir. La lista muestra préstamos activos y si el alumno está sancionado.

### 3.5 Reloj demo
Sirve para **probar** el sistema sin esperar días reales: adelanta el reloj 1, 2, 7, 8 o 15 días. Por ejemplo, después de prestar un libro, adelantá 8 días para ver cómo aparece vencido, y devolvelo para ver la sanción. *(En una biblioteca real este modo se desactiva.)*

---
## 4. Mensajes del sistema y qué hacer
| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| El alumno está sancionado | Devolvió tarde y todavía está en período de sanción | Esperar a que termine la sanción |
| Tiene un préstamo vencido | Tiene un libro que debía haber devuelto | Devolver el libro vencido primero |
| Ya tiene 3 préstamos | Llegó al máximo | Devolver algún libro |
| Ya tiene este libro | Pidió un libro que ya tiene | Elegir otro |
| No hay ejemplares disponibles | Todos los ejemplares están afuera o guardados para reservas | Reservar el libro |
| Hay ejemplares, pedilo directamente | Intentó reservar un libro que sí está disponible | Pedirlo en la biblioteca |
| Ya reservó este libro | Ya está en la fila de ese libro | Esperar |
| Ya tiene 2 reservas | Llegó al máximo de reservas | Cancelar una reserva |
| Ya se renovó una vez | Solo se permite una renovación | Devolver el libro en la fecha |
| El préstamo está vencido | No se puede renovar un préstamo vencido | Devolverlo |
| El libro tiene reservas | Otro alumno lo está esperando | Devolverlo en la fecha |
| Clave incorrecta | La clave del bibliotecario no coincide | Volver a escribirla |
| Tenés que ingresar primero | La sesión se cerró | Ingresar de nuevo |

## 5. Preguntas frecuentes
**¿Por qué un libro figura "0 disponibles" si nadie lo tiene?** Porque está guardado 48 horas para un alumno que lo reservó.

**¿Qué pasa con mis reservas si me sancionan?** Siguen en la fila, pero no podés retirar hasta que termine la sanción.

**¿Se puede deshacer una devolución?** No. Si hubo un error, avisar al equipo de desarrollo (pendiente de mejorar).

**El sistema tardó mucho en abrir.** En el plan gratuito de Render el servidor se "duerme" y el primer pedido puede tardar hasta 30 segundos.
