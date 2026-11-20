import { StyleSheet, Text, View } from 'react-native';

import { BotonIcono } from '@/components/BotonIcono';
import { colores, espacios, radios, tamanios } from '@/constants/tema';

type TipoAviso = 'info' | 'exito' | 'error';

type Props = {
  mensaje: string;
  tipo?: TipoAviso;
  onDescartar?: () => void;
};

export function MensajeAviso({ mensaje, tipo = 'info', onDescartar }: Props) {
  return (
    <View style={[estilos.contenedor, estilos[tipo]]} accessibilityRole="alert">
      <Text style={estilos.texto}>{mensaje}</Text>
      {onDescartar !== undefined && (
        <BotonIcono
          icono="close"
          etiqueta="Descartar aviso"
          onPress={onDescartar}
          color={colores.textoSecundario}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    borderRadius: radios.md,
    flexDirection: 'row',
    gap: espacios.sm,
    paddingLeft: espacios.md,
    paddingVertical: espacios.xs,
  },
  info: {
    backgroundColor: colores.avisoSuave,
  },
  exito: {
    backgroundColor: colores.exitoSuave,
  },
  error: {
    backgroundColor: colores.errorSuave,
  },
  texto: {
    color: colores.texto,
    flex: 1,
    fontSize: tamanios.texto,
    paddingVertical: espacios.sm,
  },
});
