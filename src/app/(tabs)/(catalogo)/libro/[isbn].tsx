import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/Boton';
import { DatoLibro } from '@/components/DatoLibro';
import { LibroNoEncontrado } from '@/components/LibroNoEncontrado';
import { MensajeAviso } from '@/components/MensajeAviso';
import { USUARIO_ACTUAL } from '@/constants/biblioteca';
import { colores, espacios, tamanios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { ejemplaresDisponibles, personasEnEspera, preverReserva } from '@/lib/consultas';
import { buscarLibroPorIsbn } from '@/lib/isbn';

export default function PantallaDetalle() {
  const { isbn } = useLocalSearchParams<'/libro/[isbn]'>();
  const { estado, verLibro } = useBiblioteca();
  const libro = buscarLibroPorIsbn(isbn);

  useEffect(() => {
    if (libro !== undefined) {
      verLibro(libro.isbn);
    }
  }, [libro, verLibro]);

  if (libro === undefined) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <LibroNoEncontrado isbn={isbn} />
      </>
    );
  }

  const disponibles = ejemplaresDisponibles(estado, libro);
  const enEspera = personasEnEspera(estado, libro.isbn).length;
  const yaReservado = preverReserva(estado, libro, USUARIO_ACTUAL).tipo === 'duplicada';

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.autor}>{libro.autor}</Text>

      <DatoLibro etiqueta="Año" valor={String(libro.anio)} />
      <DatoLibro etiqueta="ISBN" valor={libro.isbn} />
      <DatoLibro etiqueta="Ejemplares disponibles" valor={String(disponibles)} />
      <DatoLibro etiqueta="Personas en lista de espera" valor={String(enEspera)} />

      {yaReservado ? (
        <>
          <MensajeAviso mensaje="Ya tenés este libro prestado o reservado." tipo="exito" />
          <Boton
            titulo="Ver mis reservas"
            variante="secundario"
            onPress={() => router.navigate('/reservas')}
          />
        </>
      ) : (
        <Boton
          titulo="Reservar"
          onPress={() =>
            router.push({ pathname: '/reservar/[isbn]', params: { isbn: libro.isbn } })
          }
        />
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: espacios.sm,
    padding: espacios.xl,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.titulo,
    fontWeight: '700',
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: tamanios.textoGrande,
    marginBottom: espacios.md,
  },
});
