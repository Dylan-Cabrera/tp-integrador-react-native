import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoCatalogo } from '@/components/EncabezadoCatalogo';
import { EstadoCargando } from '@/components/EstadoCargando';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FilaLibro } from '@/components/FilaLibro';
import { CANTIDAD_RECIENTES } from '@/constants/biblioteca';
import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { useLibros } from '@/hooks/useLibros';
import { ejemplaresDisponibles, personasEnEspera } from '@/lib/consultas';
import { buscarLibroPorIsbn } from '@/lib/isbn';
import type { Libro } from '@/types';

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { estado } = useBiblioteca();

  const recientes = estado.recientes
    .aArray()
    .reverse()
    .slice(0, CANTIDAD_RECIENTES)
    .map(buscarLibroPorIsbn)
    .filter((libro): libro is Libro => libro !== undefined);

  function renderVacio() {
    if (cargando) {
      return <EstadoCargando mensaje="Cargando el catálogo…" />;
    }
    if (error !== null) {
      return <EstadoError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />;
    }
    return <EstadoVacio mensaje="El catálogo está vacío por ahora." icono="library-outline" />;
  }

  return (
    <FlatList
      style={estilos.lista}
      data={cargando || error !== null ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => (
        <FilaLibro
          libro={item}
          disponibles={ejemplaresDisponibles(estado, item)}
          enEspera={personasEnEspera(estado, item.isbn).length}
        />
      )}
      ListHeaderComponent={<EncabezadoCatalogo recientes={recientes} />}
      ListEmptyComponent={renderVacio()}
    />
  );
}

const estilos = StyleSheet.create({
  lista: {
    backgroundColor: colores.fondo,
  },
});
