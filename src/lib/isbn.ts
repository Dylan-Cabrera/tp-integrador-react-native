import { LARGO_ISBN } from '@/constants/biblioteca';
import { LIBROS } from '@/data/libros';
import type { Libro } from '@/types';

const SOLO_DIGITOS = new RegExp(`^\\d{${LARGO_ISBN}}$`);

/** Quita espacios y guiones que la persona pueda haber escrito. */
export function normalizarIsbn(texto: string): string {
  return texto.replace(/[\s-]/g, '');
}

export function tieneFormatoIsbn(isbn: string): boolean {
  return SOLO_DIGITOS.test(isbn);
}

/** Devuelve el libro del catálogo con ese ISBN, o undefined si el formato es inválido o no existe. */
export function buscarLibroPorIsbn(isbn: string): Libro | undefined {
  if (!tieneFormatoIsbn(isbn)) {
    return undefined;
  }
  return LIBROS.find((libro) => libro.isbn === isbn);
}
