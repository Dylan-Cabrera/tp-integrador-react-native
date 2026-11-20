import { useEffect, useState } from 'react';

import { buscarLibros } from '@/lib/api';
import type { Libro } from '@/types';

type Respuesta = {
  consulta: string;
  resultados: Libro[];
};

type ErrorBusqueda = {
  consulta: string;
  mensaje: string;
};

type ResultadoBusqueda = {
  resultados: Libro[];
  cargando: boolean;
  error: string | null;
};

const MENSAJE_ERROR = 'No pudimos completar la búsqueda. Intentá de nuevo en un momento.';

/**
 * Busca libros por título o autor. Solo muestra la respuesta de la última consulta:
 * si llega tarde la respuesta de una búsqueda anterior, la limpieza del efecto ya la descartó.
 */
export function useBusqueda(q: string): ResultadoBusqueda {
  const consulta = q.trim();
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [error, setError] = useState<ErrorBusqueda | null>(null);

  useEffect(() => {
    if (consulta === '') {
      return;
    }
    let cancelado = false;

    buscarLibros(consulta)
      .then((resultados) => {
        if (!cancelado) {
          setRespuesta({ consulta, resultados });
        }
      })
      .catch(() => {
        if (!cancelado) {
          setError({ consulta, mensaje: MENSAJE_ERROR });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [consulta]);

  if (consulta === '') {
    return { resultados: [], cargando: false, error: null };
  }
  if (error?.consulta === consulta) {
    return { resultados: [], cargando: false, error: error.mensaje };
  }
  if (respuesta?.consulta === consulta) {
    return { resultados: respuesta.resultados, cargando: false, error: null };
  }
  return { resultados: [], cargando: true, error: null };
}
