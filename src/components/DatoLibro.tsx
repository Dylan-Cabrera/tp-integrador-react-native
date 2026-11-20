import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  etiqueta: string;
  valor: string;
};

export function DatoLibro({ etiqueta, valor }: Props) {
  return (
    <View style={estilos.fila} accessible accessibilityLabel={`${etiqueta}: ${valor}`}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    borderBottomColor: colores.borde,
    borderBottomWidth: tamanios.bordeFino,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espacios.md,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: tamanios.texto,
  },
  valor: {
    color: colores.texto,
    fontSize: tamanios.texto,
    fontWeight: '600',
  },
});
