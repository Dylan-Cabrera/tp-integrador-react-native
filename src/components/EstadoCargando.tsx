import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  mensaje?: string;
};

export function EstadoCargando({ mensaje = 'Cargando…' }: Props) {
  return (
    <View style={estilos.contenedor} accessibilityRole="progressbar" accessibilityLabel={mensaje}>
      <ActivityIndicator size="large" color={colores.primario} />
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
  },
});
