import { DIAS_PRESTAMO } from '@/constants/biblioteca';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Fecha de devolución (ISO) de un préstamo que empieza en `desde`. */
export function calcularVencimiento(desde: Date = new Date()): string {
  return new Date(desde.getTime() + DIAS_PRESTAMO * MS_POR_DIA).toISOString();
}

const formateador = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function formatearFecha(iso: string): string {
  return formateador.format(new Date(iso));
}
