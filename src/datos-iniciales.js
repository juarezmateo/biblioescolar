// Datos de ejemplo para poder probar el sistema apenas se levanta
function sembrar(b) {
  [['1001', 'Ana Pérez'], ['1002', 'Beto Gómez'], ['1003', 'Cami Díaz'], ['1004', 'Dani Ruiz'], ['1005', 'Eli Sosa']]
    .forEach(([id, nombre]) => b.agregarAlumno({ id, nombre }));
  [
    ['Don Quijote de la Mancha', 'Miguel de Cervantes', 1],
    ['Martín Fierro', 'José Hernández', 3],
    ['El Eternauta', 'H. G. Oesterheld', 2],
    ['Rayuela', 'Julio Cortázar', 1],
    ['Ficciones', 'Jorge Luis Borges', 2],
    ['Harry Potter y la piedra filosofal', 'J. K. Rowling', 3],
    ['El principito', 'Antoine de Saint-Exupéry', 4],
    ['Hamlet', 'William Shakespeare', 1],
  ].forEach(([titulo, autor, cantidad], i) =>
    b.agregarLibro({ id: 'L' + (i + 1), titulo, autor, cantidad }));
}
module.exports = { sembrar };
