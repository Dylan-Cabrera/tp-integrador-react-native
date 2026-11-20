import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { EstadoVacio } from '@/components/EstadoVacio';
import { MensajeAviso } from '@/components/MensajeAviso';
import { TarjetaMostrador } from '@/components/TarjetaMostrador';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { personasEnEspera } from '@/lib/consultas';
import { buscarLibroPorIsbn } from '@/lib/isbn';
import type { Libro } from '@/types';

export default function PantallaMostrador() {
  const { estado, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [ultimaEntrega, setUltimaEntrega] = useState<string | null>(null);

  // Libros que tienen (o tuvieron) lista de espera.
  const libros = Object.keys(estado.esperas)
    .map(buscarLibroPorIsbn)
    .filter((libro): libro is Libro => libro !== undefined);

  async function entregar(libro: Libro) {
    const persona = await entregarAlSiguiente(libro.isbn);
    if (persona !== undefined) {
      setUltimaEntrega(`Entregaste «${libro.titulo}» a ${persona}.`);
    }
  }

  return (
    <FlatList
      style={estilos.lista}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => (
        <TarjetaMostrador
          libro={item}
          personas={personasEnEspera(estado, item.isbn)}
          onEntregar={() => entregar(item)}
        />
      )}
      ListHeaderComponent={
        ultimaEntrega === null ? undefined : (
          <View style={estilos.encabezado}>
            <MensajeAviso
              mensaje={ultimaEntrega}
              tipo="exito"
              onDescartar={() => setUltimaEntrega(null)}
            />
          </View>
        )
      }
      ListEmptyComponent={
        <EstadoVacio mensaje="No hay libros con lista de espera." icono="people-outline" />
      }
      ListFooterComponent={
        <View style={estilos.pie}>
          <Boton titulo="Cerrar sesión" variante="peligro" onPress={cerrarSesion} />
        </View>
      }
    />
  );
}

const estilos = StyleSheet.create({
  lista: {
    backgroundColor: colores.fondo,
  },
  encabezado: {
    padding: espacios.lg,
  },
  pie: {
    padding: espacios.lg,
  },
});
