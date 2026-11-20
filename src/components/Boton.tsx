import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espacios, radios, tamanios } from '@/constants/tema';

type VarianteBoton = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBoton;
  deshabilitado?: boolean;
  accessibilityHint?: string;
};

export function Boton({
  titulo,
  onPress,
  variante = 'primario',
  deshabilitado = false,
  accessibilityHint,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      accessibilityHint={accessibilityHint}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        deshabilitado && estilos.deshabilitado,
        pressed && estilos.presionado,
      ]}>
      <Text style={[estilos.texto, variante === 'secundario' && estilos.textoSecundario]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radios.md,
    justifyContent: 'center',
    minHeight: tamanios.areaTactil,
    minWidth: tamanios.areaTactil,
    paddingHorizontal: espacios.lg,
    paddingVertical: espacios.sm,
  },
  primario: {
    backgroundColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.superficie,
    borderColor: colores.primario,
    borderWidth: tamanios.bordeFino,
  },
  peligro: {
    backgroundColor: colores.error,
  },
  deshabilitado: {
    backgroundColor: colores.deshabilitado,
    borderColor: colores.deshabilitado,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    color: colores.sobrePrimario,
    fontSize: tamanios.texto,
    fontWeight: '600',
  },
  textoSecundario: {
    color: colores.primario,
  },
});
