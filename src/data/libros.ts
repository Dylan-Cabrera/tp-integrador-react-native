import type { Libro } from '@/types';

/**
 * Catálogo inicial. Los dos primeros son los libros físicos para probar el escáner:
 * reemplazalos por dos libros que tengas a mano, con el ISBN-13 impreso en su contratapa.
 */
export const LIBROS: Libro[] = [
  { isbn: '9780132350884', titulo: 'Clean Code', autor: 'Robert C. Martin', anio: 2008, ejemplares: 1 },
  { isbn: '9780307474728', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, ejemplares: 3 },
  { isbn: '9789500420211', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 1944, ejemplares: 2 },
  { isbn: '9789500420228', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, ejemplares: 0 },
  { isbn: '9789507391132', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, ejemplares: 1 },
  { isbn: '9789507310683', titulo: 'Martín Fierro', autor: 'José Hernández', anio: 1872, ejemplares: 2 },
  { isbn: '9789507311253', titulo: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', anio: 1961, ejemplares: 0 },
  { isbn: '9789507311260', titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 1948, ejemplares: 2 },
  { isbn: '9789501102017', titulo: 'Don Segundo Sombra', autor: 'Ricardo Güiraldes', anio: 1926, ejemplares: 1 },
  { isbn: '9780135957059', titulo: 'The Pragmatic Programmer', autor: 'David Thomas y Andrew Hunt', anio: 2019, ejemplares: 0 },
  { isbn: '9780201633610', titulo: 'Design Patterns', autor: 'Erich Gamma y otros', anio: 1994, ejemplares: 1 },
  { isbn: '9780134757599', titulo: 'Refactoring', autor: 'Martin Fowler', anio: 2018, ejemplares: 1 },
  { isbn: '9780596517748', titulo: 'JavaScript: The Good Parts', autor: 'Douglas Crockford', anio: 2008, ejemplares: 1 },
  { isbn: '9781593279509', titulo: 'Eloquent JavaScript', autor: 'Marijn Haverbeke', anio: 2018, ejemplares: 2 },
  { isbn: '9789702605553', titulo: 'Estructuras de datos y algoritmos', autor: 'Alfred Aho y otros', anio: 1983, ejemplares: 2 },
  { isbn: '9788448172305', titulo: 'Fundamentos de bases de datos', autor: 'Abraham Silberschatz', anio: 2006, ejemplares: 0 },
];
