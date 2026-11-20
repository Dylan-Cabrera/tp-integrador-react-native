import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';

type Props = {
  isbn: string;
};

export function LibroNoEncontrado({ isbn }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name="help-circle-outline" size={tamanios.icono * 2} color={colores.aviso} />
      <Text style={estilos.titulo}>No encontramos ese libro</Text>
      <Text style={estilos.texto}>
        «{isbn}» no corresponde a ningún libro del catálogo. El ISBN tiene que tener 13 números.
      </Text>
      <Link href="/" dismissTo accessibilityRole="button" style={estilos.enlace}>
        <Text style={estilos.textoEnlace}>Volver al Catálogo</Text>
      </Link>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.md,
    justifyContent: 'center',
    padding: espacios.xl,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.titulo,
    fontWeight: '700',
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: tamanios.texto,
    textAlign: 'center',
  },
  enlace: {
    minHeight: tamanios.areaTactil,
    paddingVertical: espacios.md,
  },
  textoEnlace: {
    color: colores.primario,
    fontSize: tamanios.textoGrande,
    fontWeight: '600',
  },
});
