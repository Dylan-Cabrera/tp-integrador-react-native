import { Link, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, fuentes, tamanios } from '@/constants/tema';

export default function PantallaNoEncontrada() {
  const ruta = usePathname();

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>No encontramos esta página</Text>
      <Text style={estilos.ruta} selectable>
        {ruta}
      </Text>
      <Link href="/" replace accessibilityRole="button" style={estilos.enlace}>
        <Text style={estilos.textoEnlace}>Ir al Catálogo</Text>
      </Link>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.lg,
    justifyContent: 'center',
    padding: espacios.xl,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.titulo,
    fontWeight: '700',
    textAlign: 'center',
  },
  ruta: {
    color: colores.textoSecundario,
    fontFamily: fuentes.mono,
    fontSize: tamanios.texto,
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
