import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { LibroNoEncontrado } from '@/components/LibroNoEncontrado';
import { DIAS_PRESTAMO, USUARIO_ACTUAL } from '@/constants/biblioteca';
import { colores, espacios, tamanios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { preverReserva, type PrevisionReserva } from '@/lib/consultas';
import { calcularVencimiento, formatearFecha } from '@/lib/fechas';
import { buscarLibroPorIsbn } from '@/lib/isbn';

function textoPrevision(prevision: PrevisionReserva): string {
  switch (prevision.tipo) {
    case 'prestamo':
      return `Hay ejemplares disponibles: te lo prestamos por ${DIAS_PRESTAMO} días. Lo tenés que devolver el ${formatearFecha(calcularVencimiento())}.`;
    case 'espera':
      return `Ahora no hay un ejemplar para vos. Vas a entrar a la lista de espera en la posición ${prevision.posicion}.`;
    case 'duplicada':
      return 'Ya tenés este libro prestado o estás en su lista de espera. No hace falta reservarlo otra vez.';
  }
}

function irAMisReservas() {
  // Cierra el modal y todo lo apilado sobre las pestañas, así "atrás" no vuelve a la confirmación.
  router.dismissAll();
  router.navigate('/reservas');
}

export default function PantallaReservar() {
  const { isbn } = useLocalSearchParams<'/reservar/[isbn]'>();
  const { estado, reservar } = useBiblioteca();
  const libro = buscarLibroPorIsbn(isbn);

  if (libro === undefined) {
    return <LibroNoEncontrado isbn={isbn} />;
  }

  const prevision = preverReserva(estado, libro, USUARIO_ACTUAL);

  function confirmar() {
    if (libro !== undefined) {
      reservar(libro);
      irAMisReservas();
    }
  }

  return (
    <View style={estilos.contenedor}>
      <Ionicons
        name={prevision.tipo === 'prestamo' ? 'book-outline' : 'time-outline'}
        size={tamanios.icono * 2}
        color={colores.primario}
        style={estilos.icono}
      />
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.texto}>{textoPrevision(prevision)}</Text>

      {prevision.tipo === 'duplicada' ? (
        <Boton titulo="Ver mis reservas" onPress={irAMisReservas} />
      ) : (
        <Boton
          titulo={prevision.tipo === 'prestamo' ? 'Confirmar préstamo' : 'Anotarme en la lista'}
          onPress={confirmar}
        />
      )}
      <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'stretch',
    flex: 1,
    gap: espacios.lg,
    justifyContent: 'center',
    padding: espacios.xl,
  },
  icono: {
    alignSelf: 'center',
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.titulo,
    fontWeight: '700',
    textAlign: 'center',
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: tamanios.textoGrande,
    textAlign: 'center',
  },
});
