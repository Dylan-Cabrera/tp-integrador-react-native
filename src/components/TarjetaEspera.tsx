import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, radios, tamanios } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
  posicion: number;
  total: number;
};

export function TarjetaEspera({ libro, posicion, total }: Props) {
  const texto =
    posicion === 1 ? 'Sos la próxima persona en recibirlo.' : `Posición ${posicion} de ${total}.`;

  return (
    <View style={estilos.tarjeta} accessible accessibilityLabel={`${libro.titulo}. ${texto}`}>
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: tamanios.bordeFino,
    gap: espacios.xs,
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
