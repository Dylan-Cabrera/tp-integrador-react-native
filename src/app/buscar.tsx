import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/CampoTexto';
import { EstadoCargando } from '@/components/EstadoCargando';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FilaLibro } from '@/components/FilaLibro';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { useBusqueda } from '@/hooks/useBusqueda';
import { ejemplaresDisponibles, personasEnEspera } from '@/lib/consultas';

export default function PantallaBuscar() {
  const { q = '' } = useLocalSearchParams<'/buscar'>();
  const consulta = Array.isArray(q) ? (q[0] ?? '') : q;
  // El campo tiene su propio estado para que el cursor no salte;
  // la búsqueda se hace con el valor de la URL.
  const [texto, setTexto] = useState(consulta);
  const { resultados, cargando, error } = useBusqueda(consulta);
  const { estado } = useBiblioteca();

  function cambiarTexto(nuevo: string) {
    setTexto(nuevo);
    router.setParams({ q: nuevo });
  }

  function renderVacio() {
    if (consulta.trim() === '') {
      return <EstadoVacio mensaje="Escribí un título o un autor para buscar." icono="search-outline" />;
    }
    if (cargando) {
      return <EstadoCargando mensaje="Buscando…" />;
    }
    if (error !== null) {
      return (
        <EstadoError mensaje={error} textoAccion="Borrar búsqueda" onAccion={() => cambiarTexto('')} />
      );
    }
    return <EstadoVacio mensaje={`No hay libros que coincidan con «${consulta.trim()}».`} />;
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.campo}>
        <CampoTexto
          etiqueta="Título o autor"
          value={texto}
          onChangeText={cambiarTexto}
          placeholder="Por ejemplo: Borges"
          autoFocus={consulta === ''}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={cargando ? [] : resultados}
        keyExtractor={(libro) => libro.isbn}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <FilaLibro
            libro={item}
            disponibles={ejemplaresDisponibles(estado, item)}
            enEspera={personasEnEspera(estado, item.isbn).length}
          />
        )}
        ListEmptyComponent={renderVacio()}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: colores.fondo,
    flex: 1,
  },
  campo: {
    padding: espacios.lg,
  },
});
