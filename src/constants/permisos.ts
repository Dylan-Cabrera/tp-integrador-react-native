import type { RecursoPermiso } from '@/types';

type TextosPermiso = {
  titulo: string;
  beneficio: string;
  bloqueado: string;
};

export const TEXTOS_PERMISO: Record<RecursoPermiso, TextosPermiso> = {
  camara: {
    titulo: 'Escanear libros',
    beneficio: 'Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.',
    bloqueado:
      'La cámara está desactivada para esta app. Podés habilitarla en Ajustes o escribir el ISBN a mano.',
  },
  notificaciones: {
    titulo: 'Recordatorios',
    beneficio: 'Usamos tus notificaciones para avisarte antes de que venza un préstamo.',
    bloqueado:
      'Las notificaciones están desactivadas para esta app. Podés habilitarlas en Ajustes; mientras tanto, los avisos aparecen en Mis reservas.',
  },
};
