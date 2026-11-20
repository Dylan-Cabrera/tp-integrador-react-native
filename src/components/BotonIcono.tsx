import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colores, tamanios } from '@/constants/tema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  /** Obligatorio: es lo único que lee el lector de pantalla. */
  etiqueta: string;
  onPress: () => void;
  color?: string;
};

export function BotonIcono({ icono, etiqueta, onPress, color = colores.primario }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={tamanios.areaTactil / 4}
      onPress={onPress}
      style={({ pressed }) => [estilos.base, pressed && estilos.presionado]}>
      <Ionicons name={icono} size={tamanios.icono} color={color} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: 'center',
    height: tamanios.areaTactil,
    justifyContent: 'center',
    width: tamanios.areaTactil,
  },
  presionado: {
    opacity: 0.6,
  },
});
