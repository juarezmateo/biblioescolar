# Relevamiento del proyecto – BiblioEscolar

| Dato | Valor |
|---|---|
| Proyecto | BiblioEscolar – Sistema de préstamos y reservas de biblioteca escolar |
| Integrantes | *[completar con nombres]* |
| Institución | *[completar con el nombre del colegio]* |
| Curso | Generación T · Bootcamp IA-First · Proyecto final (Módulo 5) |
| Versión del documento | 1.0 |

> **Nota sobre el relevamiento:** como en el resto del curso, no hay un cliente real que responda, así que el equipo hizo de cliente (ver `decisiones.md`). Las respuestas de la sección 4 son las decisiones tomadas por el equipo, pensadas para que sean realistas. Si se consulta a un bibliotecario real, hay que ajustarlas.

## 1. Situación actual (as-is)
Los préstamos de la biblioteca se anotan a mano en un cuaderno: nombre del alumno, libro y fecha. Para saber quién tiene un libro hay que buscar en el cuaderno.

### Problemas detectados
| # | Problema | Consecuencia |
|---|---|---|
| P1 | Nadie sabe con certeza qué libros están prestados | Se pierden libros y se pierde tiempo buscando |
| P2 | No se controla cuántos libros se lleva cada alumno | Algunos alumnos acumulan libros |
| P3 | No hay forma de reservar un libro ocupado | Conflictos entre alumnos y favoritismos |
| P4 | Los atrasos no tienen consecuencias claras | Los libros vuelven tarde o no vuelven |
| P5 | Las renovaciones se piden "de palabra" | No queda registro |
| P6 | Solo se puede consultar el catálogo yendo a la biblioteca | Los alumnos no saben qué hay disponible |

## 2. Objetivos
**General:** digitalizar la gestión de préstamos, devoluciones y reservas, aplicando reglas claras y equitativas.

**Específicos:**

1. Registrar quién tiene cada libro y hasta cuándo (resuelve P1).
2. Limitar y controlar los préstamos por alumno (P2).
3. Ofrecer reservas con fila de espera justa (P3).
4. Aplicar sanciones automáticas por atraso (P4).
5. Permitir renovar con registro y con reglas (P5).
6. Dejar que los alumnos consulten el catálogo y su situación desde cualquier dispositivo (P6).

## 3. Alcance
**Incluye:** catálogo, alta de libros y alumnos, préstamos, devoluciones, renovaciones, reservas, sanciones, ingreso por rol, modo demo con reloj simulado.

**No incluye (por ahora):** envío de mails o notificaciones, multas en dinero, códigos de barras, libros perdidos o dañados, docentes como usuarios, estadísticas y reportes, contraseña individual por alumno, base de datos persistente (ver sección 9).

## 4. Preguntas de relevamiento y respuestas
| Pregunta | Respuesta adoptada |
|---|---|
| ¿Cuánto tiempo se puede tener un libro? | 7 días |
| ¿Cuántos libros a la vez? | 3 |
| ¿Se puede renovar? | Una vez, 7 días más, si nadie lo reservó |
| ¿Qué pasa si un libro está ocupado? | Se puede reservar (máximo 2 reservas por alumno) |
| ¿Cuánto se guarda un libro reservado? | 48 horas desde que se devuelve |
| ¿Qué pasa si se devuelve tarde? | 2 días de sanción por cada día de atraso, tope 30 |
| ¿Quién registra préstamos? | Solo el bibliotecario |
| ¿Qué ve el alumno? | Catálogo, sus préstamos, sus reservas y su sanción |

## 5. Actores
| Actor | Rol | Necesidades |
|---|---|---|
| Bibliotecario/a | Administra la biblioteca | Registrar préstamos y devoluciones rápido; ver vencidos; cargar libros y alumnos |
| Alumno/a | Usa la biblioteca | Saber qué hay disponible; reservar; renovar; ver su sanción |
| Dirección / docentes | Interesados | Que los libros se cuiden y se devuelvan |

## 6. Procesos
### Préstamo (propuesto)

1. El alumno elige un libro y se acerca al bibliotecario.
2. El bibliotecario selecciona alumno y libro y confirma.
3. El sistema valida: sanción, vencidos, límite de 3, libro repetido, disponibilidad.
4. Si todo está bien, queda registrado con vencimiento a 7 días. Si no, muestra el motivo.

### Devolución

1. El bibliotecario presiona "Devolver".
2. Si hubo atraso, el sistema sanciona automáticamente.
3. Si hay reservas, la primera de la fila queda "lista" por 48 horas.

### Reserva

1. El alumno ve un libro sin ejemplares y presiona "Reservar".
2. Queda en la fila, ordenada por orden de llegada.
3. Cuando se devuelve un ejemplar, pasa a "lista" y el alumno tiene 48 horas para retirarlo.
4. Si no lo retira, la reserva vence y pasa al siguiente.

## 7. Requerimientos
### Funcionales
| Código | Requerimiento | Reglas | Historia |
|---|---|---|---|
| RF1 | Ingresar como alumno o bibliotecario | RN14 | – |
| RF2 | Consultar catálogo con disponibilidad | RN3 | HU7 |
| RF3 | Registrar préstamo con validaciones | RN1–RN5, RN12 | HU1 |
| RF4 | Registrar devolución y aplicar sanción | RN12 | HU2 |
| RF5 | Renovar préstamo | RN6, RN7 | HU3 |
| RF6 | Reservar libro y cancelar reserva | RN8, RN9, RN13 | HU4, HU6 |
| RF7 | Gestionar fila y vencimiento de reservas | RN10, RN11 | HU5 |
| RF8 | Alta de libros y alumnos | – | – |
| RF9 | Ver la propia cuenta (préstamos, reservas, sanción) | – | HU7 |
| RF10 | Modo demo con reloj simulado | – | – |

### No funcionales
| Código | Requerimiento |
|---|---|
| RNF1 | Usable desde computadora y celular (diseño adaptable) |
| RNF2 | Los mensajes de error explican el motivo en lenguaje simple |
| RNF3 | Los secretos (clave del bibliotecario, cadena de conexión) van en variables de entorno |
| RNF4 | Las reglas de negocio están separadas de la parte web y tienen tests automáticos |
| RNF5 | El backend solo acepta pedidos del frontend configurado (CORS) |
| RNF6 | La interfaz no inserta HTML del usuario (prevención de XSS) |
| RNF7 | Debe poder probarse desde internet sin instalar nada |

## 8. Restricciones y supuestos

- Un solo bibliotecario usa el panel a la vez (no hay control de concurrencia avanzado).
- Todos los alumnos pueden elegir su nombre al ingresar: es una simplificación para la demo (ver riesgos).
- Plan gratuito de Render: el servidor "duerme" y el primer pedido puede tardar unos 30 segundos.

## 9. Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Un alumno ingresa como otro alumno | Alta | Medio | Pendiente: contraseña o código por alumno |
| Se reinicia el servidor y se pierden los datos (almacenamiento en memoria) | Alta | Alto | Tarea T9: conectar PostgreSQL |
| Clave del bibliotecario por defecto en desarrollo | Media | Alto | En producción definir `BIBLIOTECARIO_CLAVE` |
| Libro perdido o dañado | Media | Medio | Fuera de alcance, queda como pregunta abierta |
| El modo demo adelanta el reloj para todos | Baja | Bajo | Se desactiva con `MODO_DEMO=no` |

## 10. Modelo de datos
```
alumno (id PK, nombre, sancionHasta)
libro (id PK, titulo, autor, cantidad)
prestamo (id PK, alumnoId FK, libroId FK, desde, vence, renovaciones, devueltoEn)
reserva (id PK, alumnoId FK, libroId FK, creada, estado, venceEn)
   estado: espera | lista | cumplida | vencida | cancelada
```
Relaciones: un alumno tiene muchos préstamos y muchas reservas; un libro tiene muchos préstamos y muchas reservas.

## 11. Trazabilidad
| Regla | Historia | Test automático | Pantalla |
|---|---|---|---|
| RN1 | HU1 | T1 (7 días) | Prestar |
| RN2 | HU1 | T1 (máx. 3) + API (4º préstamo) | Prestar |
| RN3 | HU1 | T1 (sin ejemplares) | Catálogo, Prestar |
| RN4 | HU1 | T1 (repetido) | Prestar |
| RN5 | HU1 | T2 | Prestar |
| RN6 | HU3 | T6 | Mi cuenta |
| RN7 | HU3 | T6 | Mi cuenta |
| RN8 | HU4 | T4 | Catálogo |
| RN9 | HU4 | T4 | Catálogo |
| RN10 | HU2, HU5 | T5 + API (flujo de reserva) | Mi cuenta |
| RN11 | HU5 | T5 | Mi cuenta |
| RN12 | HU2 | T3 + API (sanción) | Mi cuenta, Alumnos |
| RN13 | HU6 | T4 | Mi cuenta |
| RN14 | HU1, HU2 | API (401 / 403) | Ingreso |

## 12. Criterios de aceptación del proyecto

- Todas las RN implementadas y con tests que pasan.
- Todas las pantallas funcionando (ingreso, catálogo, mi cuenta, préstamos, prestar, libros, alumnos, demo).
- Documentación completa en el repositorio.
- Aplicación publicada y accesible desde internet.
