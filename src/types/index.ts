export type Libro = {
  isbn: string;        // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;  // ejemplares en el estante al iniciar la app
};

export type Prestamo = {
  isbn: string;
  persona: string;
  /** Fecha de devolución en formato ISO. */
  vence: string;
  /** Identificador de la notificación programada, o null si el recordatorio está apagado. */
  idNotificacion: string | null;
};

export type Aviso = {
  id: string;
  mensaje: string;
};

export type RecursoPermiso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
