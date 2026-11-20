import type { EstadoBiblioteca } from '@/lib/bibliotecaReducer';
import type { Libro, Prestamo } from '@/types';

/**
 * Datos derivados del estado. Se calculan en cada render en lugar de guardarse,
 * para que un mismo dato no viva en dos lugares.
 */

export function ejemplaresDisponibles(estado: EstadoBiblioteca, libro: Libro): number {
  const prestados = estado.prestamos.filter((p) => p.isbn === libro.isbn).length;
  const devueltos = estado.devueltos[libro.isbn] ?? 0;
  return Math.max(0, libro.ejemplares + devueltos - prestados);
}

export function personasEnEspera(estado: EstadoBiblioteca, isbn: string): string[] {
  return estado.esperas[isbn]?.aArray() ?? [];
}

/** Posición (empezando en 1) de la persona en la lista de espera, o 0 si no está. */
export function posicionEnEspera(estado: EstadoBiblioteca, isbn: string, persona: string): number {
  return personasEnEspera(estado, isbn).indexOf(persona) + 1;
}

export function prestamoDe(
  estado: EstadoBiblioteca,
  isbn: string,
  persona: string,
): Prestamo | undefined {
  return estado.prestamos.find((p) => p.isbn === isbn && p.persona === persona);
}

export function prestamosDe(estado: EstadoBiblioteca, persona: string): Prestamo[] {
  return estado.prestamos.filter((p) => p.persona === persona);
}

/** ISBN de los libros donde la persona está esperando. */
export function esperasDe(estado: EstadoBiblioteca, persona: string): string[] {
  return Object.keys(estado.esperas).filter((isbn) => posicionEnEspera(estado, isbn, persona) > 0);
}

export type PrevisionReserva =
  | { tipo: 'duplicada' }
  | { tipo: 'prestamo' }
  | { tipo: 'espera'; posicion: number };

/**
 * Qué pasaría si la persona reservara el libro ahora.
 * Respeta el orden: si ya hay gente esperando, se entra a la lista aunque haya ejemplares.
 */
export function preverReserva(
  estado: EstadoBiblioteca,
  libro: Libro,
  persona: string,
): PrevisionReserva {
  if (
    prestamoDe(estado, libro.isbn, persona) !== undefined ||
    posicionEnEspera(estado, libro.isbn, persona) > 0
  ) {
    return { tipo: 'duplicada' };
  }
  const enEspera = personasEnEspera(estado, libro.isbn).length;
  if (ejemplaresDisponibles(estado, libro) > 0 && enEspera === 0) {
    return { tipo: 'prestamo' };
  }
  return { tipo: 'espera', posicion: enEspera + 1 };
}
