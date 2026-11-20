import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { CREDENCIALES, USUARIO_ACTUAL } from '@/constants/biblioteca';
import {
  bibliotecaReducer,
  crearEstadoInicial,
  type EstadoBiblioteca,
} from '@/lib/bibliotecaReducer';
import { preverReserva, type PrevisionReserva } from '@/lib/consultas';
import { calcularVencimiento } from '@/lib/fechas';
import type { Libro } from '@/types';

type ValorBiblioteca = {
  estado: EstadoBiblioteca;
  verLibro: (isbn: string) => void;
  reservar: (libro: Libro) => PrevisionReserva;
  devolver: (isbn: string) => void;
  entregarAlSiguiente: (isbn: string) => string | undefined;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  agregarAviso: (mensaje: string) => void;
  descartarAviso: (id: string) => void;
};

const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

function crearIdAviso(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(bibliotecaReducer, undefined, crearEstadoInicial);

  const verLibro = useCallback((isbn: string) => {
    despachar({ tipo: 'VER_LIBRO', isbn });
  }, []);

  const reservar = useCallback(
    (libro: Libro): PrevisionReserva => {
      const prevision = preverReserva(estado, libro, USUARIO_ACTUAL);
      if (prevision.tipo === 'prestamo') {
        despachar({
          tipo: 'PRESTAR',
          isbn: libro.isbn,
          persona: USUARIO_ACTUAL,
          vence: calcularVencimiento(),
        });
      } else if (prevision.tipo === 'espera') {
        despachar({ tipo: 'ENCOLAR', isbn: libro.isbn, persona: USUARIO_ACTUAL });
      }
      return prevision;
    },
    [estado],
  );

  const devolver = useCallback((isbn: string) => {
    despachar({ tipo: 'DEVOLVER', isbn, persona: USUARIO_ACTUAL });
  }, []);

  const entregarAlSiguiente = useCallback(
    (isbn: string): string | undefined => {
      const persona = estado.esperas[isbn]?.frente();
      if (persona !== undefined) {
        despachar({ tipo: 'ENTREGAR_SIGUIENTE', isbn, vence: calcularVencimiento() });
      }
      return persona;
    },
    [estado],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string): boolean => {
    const correctas = usuario.trim() === CREDENCIALES.usuario && clave === CREDENCIALES.clave;
    if (correctas) {
      despachar({ tipo: 'INICIAR_SESION' });
    }
    return correctas;
  }, []);

  const cerrarSesion = useCallback(() => {
    despachar({ tipo: 'CERRAR_SESION' });
  }, []);

  const agregarAviso = useCallback((mensaje: string) => {
    despachar({ tipo: 'AGREGAR_AVISO', aviso: { id: crearIdAviso(), mensaje } });
  }, []);

  const descartarAviso = useCallback((id: string) => {
    despachar({ tipo: 'DESCARTAR_AVISO', id });
  }, []);

  const valor = useMemo<ValorBiblioteca>(
    () => ({
      estado,
      verLibro,
      reservar,
      devolver,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      agregarAviso,
      descartarAviso,
    }),
    [
      estado,
      verLibro,
      reservar,
      devolver,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      agregarAviso,
      descartarAviso,
    ],
  );

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>;
}

export function useBiblioteca(): ValorBiblioteca {
  const valor = useContext(BibliotecaContext);
  if (valor === null) {
    throw new Error('useBiblioteca tiene que usarse dentro de <BibliotecaProvider>.');
  }
  return valor;
}
