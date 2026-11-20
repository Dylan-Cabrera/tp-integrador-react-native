import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  mensaje: string;
  textoAccion: string;
  onAccion: () => void;
};

export function EstadoError({ mensaje, textoAccion, onAccion }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name="cloud-offline-outline" size={tamanios.icono * 2} color={colores.error} />
      <Text style={estilos.texto} accessibilityRole="alert">
        {mensaje}
      </Text>
      <Boton titulo={textoAccion} onPress={onAccion} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: espacios.lg,
    justifyContent: 'center',
    padding: espacios.xl,
  },
  texto: {
    color: colores.texto,
    fontSize: tamanios.texto,
    textAlign: 'center',
  },
});
