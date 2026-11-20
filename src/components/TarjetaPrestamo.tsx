import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espacios, radios, tamanios } from '@/constants/tema';
import { formatearFecha } from '@/lib/fechas';
import type { Libro, Prestamo } from '@/types';

type Props = {
  libro: Libro;
  prestamo: Prestamo;
  onDevolver: () => void;
};

export function TarjetaPrestamo({ libro, prestamo, onDevolver }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.texto}>Devolución: {formatearFecha(prestamo.vence)}</Text>
      <Boton
        titulo="Devolver"
        variante="secundario"
        onPress={onDevolver}
        accessibilityHint={`Devuelve ${libro.titulo} a la biblioteca`}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: tamanios.bordeFino,
    gap: espacios.sm,
    marginHorizontal: espacios.lg,
    marginBottom: espacios.md,
    padding: espacios.lg,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.textoGrande,
    fontWeight: '600',
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: tamanios.texto,
  },
});
