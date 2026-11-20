import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '@/lib/api';
import type { Libro } from '@/types';

type ResultadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

const MENSAJE_ERROR = 'No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo.';

export function useLibros(): ResultadoLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este número vuelve a ejecutar el efecto: es lo que hace "Reintentar".
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (!cancelado) {
          setLibros(datos);
        }
      } catch {
        if (!cancelado) {
          setError(MENSAJE_ERROR);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar();

    // Si el Catálogo se desmonta (o se reintenta) antes de que llegue la respuesta,
    // la respuesta vieja ya no actualiza el estado.
    return () => {
      cancelado = true;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
