import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  mensaje: string;
  icono?: ComponentProps<typeof Ionicons>['name'];
};

export function EstadoVacio({ mensaje, icono = 'file-tray-outline' }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={tamanios.icono * 2} color={colores.textoSecundario} />
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: espacios.md,
    justifyContent: 'center',
    padding: espacios.xl,
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: tamanios.texto,
    textAlign: 'center',
  },
});
