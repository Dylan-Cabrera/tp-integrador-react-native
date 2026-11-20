import { ESPERAS_INICIALES } from '@/data/esperasIniciales';
import { Cola } from '@/estructuras/Cola';
import { Pila } from '@/estructuras/Pila';
import type { Aviso, Prestamo } from '@/types';

export type EstadoBiblioteca = {
  /** Préstamos de todas las personas (la usuaria de la app y quienes reciben libros en el mostrador). */
  prestamos: Prestamo[];
  /** ISBN → personas en espera. */
  esperas: Record<string, Cola<string>>;
  /** ISBN → ejemplares que volvieron al estante desde el mostrador. */
  devueltos: Record<string, number>;
  /** ISBN de los detalles abiertos; el tope es el más reciente. */
  recientes: Pila<string>;
  sesion: boolean;
  avisos: Aviso[];
};

export type AccionBiblioteca =
  | { tipo: 'VER_LIBRO'; isbn: string }
  | { tipo: 'PRESTAR'; isbn: string; persona: string; vence: string }
  | { tipo: 'ENCOLAR'; isbn: string; persona: string }
  | { tipo: 'DEVOLVER'; isbn: string; persona: string }
  | { tipo: 'ENTREGAR_SIGUIENTE'; isbn: string; vence: string }
  | { tipo: 'GUARDAR_ID_NOTIFICACION'; isbn: string; persona: string; id: string | null }
  | { tipo: 'AGREGAR_AVISO'; aviso: Aviso }
  | { tipo: 'DESCARTAR_AVISO'; id: string }
  | { tipo: 'INICIAR_SESION' }
  | { tipo: 'CERRAR_SESION' };

export function crearEstadoInicial(): EstadoBiblioteca {
  const esperas: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(ESPERAS_INICIALES)) {
    esperas[isbn] = new Cola(personas);
  }
  return {
    prestamos: [],
    esperas,
    devueltos: {},
    recientes: new Pila<string>(),
    sesion: false,
    avisos: [],
  };
}

function esDe(prestamo: Prestamo, isbn: string, persona: string): boolean {
  return prestamo.isbn === isbn && prestamo.persona === persona;
}

/**
 * Reducer puro: nunca muta el estado recibido. Pila y Cola se clonan antes de modificarse,
 * así React recibe una referencia nueva y vuelve a renderizar.
 */
export function bibliotecaReducer(
  estado: EstadoBiblioteca,
  accion: AccionBiblioteca,
): EstadoBiblioteca {
  switch (accion.tipo) {
    case 'VER_LIBRO': {
      if (estado.recientes.tope() === accion.isbn) {
        return estado;
      }
      const recientes = estado.recientes.clonar();
      recientes.apilar(accion.isbn);
      return { ...estado, recientes };
    }

    case 'PRESTAR': {
      const nuevo: Prestamo = {
        isbn: accion.isbn,
        persona: accion.persona,
        vence: accion.vence,
        idNotificacion: null,
      };
      return { ...estado, prestamos: [...estado.prestamos, nuevo] };
    }

    case 'ENCOLAR': {
      const cola = estado.esperas[accion.isbn]?.clonar() ?? new Cola<string>();
      cola.encolar(accion.persona);
      return { ...estado, esperas: { ...estado.esperas, [accion.isbn]: cola } };
    }

    case 'DEVOLVER':
      return {
        ...estado,
        prestamos: estado.prestamos.filter((p) => !esDe(p, accion.isbn, accion.persona)),
      };

    case 'ENTREGAR_SIGUIENTE': {
      const cola = estado.esperas[accion.isbn]?.clonar();
      const persona = cola?.desencolar();
      if (cola === undefined || persona === undefined) {
        return estado;
      }
      const nuevo: Prestamo = {
        isbn: accion.isbn,
        persona,
        vence: accion.vence,
        idNotificacion: null,
      };
      return {
        ...estado,
        esperas: { ...estado.esperas, [accion.isbn]: cola },
        devueltos: {
          ...estado.devueltos,
          [accion.isbn]: (estado.devueltos[accion.isbn] ?? 0) + 1,
        },
        prestamos: [...estado.prestamos, nuevo],
      };
    }

    case 'GUARDAR_ID_NOTIFICACION':
      return {
        ...estado,
        prestamos: estado.prestamos.map((p) =>
          esDe(p, accion.isbn, accion.persona) ? { ...p, idNotificacion: accion.id } : p,
        ),
      };

    case 'AGREGAR_AVISO':
      return { ...estado, avisos: [...estado.avisos, accion.aviso] };

    case 'DESCARTAR_AVISO':
      return { ...estado, avisos: estado.avisos.filter((a) => a.id !== accion.id) };

    case 'INICIAR_SESION':
      return { ...estado, sesion: true };

    case 'CERRAR_SESION':
      return { ...estado, sesion: false };
  }
}
