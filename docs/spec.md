# Spec – BiblioEscolar

## Objetivo
Manejar préstamos, devoluciones y reservas de la biblioteca del colegio con reglas claras.

## Roles
Bibliotecario y alumno.

## Reglas de negocio

- **RN1** Un préstamo dura 7 días.
- **RN2** Un alumno puede tener como máximo 3 préstamos activos.
- **RN3** No se pueden prestar más ejemplares de los que hay disponibles.
- **RN4** Un alumno no puede tener dos préstamos activos del mismo libro.
- **RN5** Si el alumno tiene un préstamo vencido, no puede retirar otro libro.
- **RN6** Un préstamo se renueva una sola vez, por 7 días más.
- **RN7** No se renueva si el préstamo ya venció o si el libro tiene reservas (en espera o listas).
- **RN8** Solo se reserva un libro si no hay ejemplares disponibles.
- **RN9** Un alumno tiene como máximo 2 reservas activas, y no puede reservar un libro que ya tiene prestado.
- **RN10** Al devolverse un ejemplar, el primero de la fila queda con reserva "lista" por 48 horas.
- **RN11** Si pasan las 48 horas sin retirar, la reserva vence y el ejemplar pasa al siguiente.
- **RN12** Devolver tarde genera una sanción de 2 días por cada día de atraso (máximo 30). Durante la sanción no se puede pedir prestado.
- **RN13** El alumno puede cancelar su reserva.
- **RN14** Solo el bibliotecario registra préstamos y devoluciones.

## Historias de usuario

- **HU1** Como bibliotecario quiero registrar un préstamo.
  - Dado un alumno sin sanción y con lugar, cuando presto un libro disponible, entonces queda activo por 7 días (RN1, RN2, RN3).
  - Dado un alumno con 3 préstamos, cuando intento prestar, entonces me rechaza (RN2).
- **HU2** Como bibliotecario quiero registrar una devolución.
  - Dado un préstamo con atraso, cuando lo devuelvo, entonces el alumno queda sancionado (RN12).
  - Dado un libro con reservas, cuando lo devuelvo, entonces la primera reserva queda lista (RN10).
- **HU3** Como alumno quiero renovar un préstamo.
  - Dado un préstamo vigente sin reservas, cuando renuevo, entonces se suman 7 días (RN6).
  - Dado un libro reservado, cuando intento renovar, entonces me rechaza (RN7).
- **HU4** Como alumno quiero reservar un libro ocupado.
  - Dado un libro sin ejemplares, cuando reservo, entonces quedo en la fila (RN8, RN9).
- **HU5** Como alumno quiero retirar mi reserva lista.
  - Dada una reserva lista en plazo, cuando el bibliotecario me presta, entonces la reserva se cumple (RN10).
  - Dada una reserva pasada de 48 hs, cuando alguien consulta, entonces vence y pasa al siguiente (RN11).
- **HU6** Como alumno quiero cancelar una reserva (RN13).
- **HU7** Como alumno quiero ver el catálogo y mis préstamos.

## Casos borde

- Devolver justo en la fecha de vencimiento: no hay atraso.
- Dos alumnos que piden el último ejemplar: el segundo recibe error (RN3).
- Reserva lista de otro alumno: el ejemplar guardado no cuenta como disponible.

## Pendientes
Ninguno.
