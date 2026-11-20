import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  texto: string;
  textoBoton: string;
  onPress: () => void;
};

/** Explica para qué se usa un permiso y ofrece una única acción. */
export function PanelPermiso({ icono, titulo, texto, textoBoton, onPress }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={tamanios.icono * 2} color={colores.primario} />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
      <View style={estilos.boton}>
        <Boton titulo={textoBoton} onPress={onPress} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: espacios.lg,
    padding: espacios.xl,
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
  boton: {
    alignSelf: 'stretch',
  },
});
