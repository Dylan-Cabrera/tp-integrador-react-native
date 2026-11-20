import { StyleSheet, Text } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  texto: string;
};

export function TituloSeccion({ texto }: Props) {
  return (
    <Text style={estilos.titulo} accessibilityRole="header">
      {texto}
    </Text>
  );
}

const estilos = StyleSheet.create({
  titulo: {
    color: colores.texto,
    fontSize: tamanios.textoGrande,
    fontWeight: '700',
    paddingHorizontal: espacios.lg,
    paddingVertical: espacios.md,
  },
});
