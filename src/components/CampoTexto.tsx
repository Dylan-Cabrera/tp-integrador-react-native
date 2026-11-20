import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colores, espacios, radios, tamanios } from '@/constants/tema';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  etiqueta: string;
};

export function CampoTexto({ etiqueta, ...props }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.deshabilitado}
        style={estilos.campo}
        {...props}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espacios.xs,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: tamanios.textoChico,
    fontWeight: '600',
  },
  campo: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: tamanios.bordeFino,
    color: colores.texto,
    fontSize: tamanios.texto,
    minHeight: tamanios.areaTactil,
    paddingHorizontal: espacios.md,
  },
});
