import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

export function EnlacePersonal() {
  const { estado } = useBiblioteca();

  return (
    <Link
      href={estado.sesion ? '/mostrador' : '/login'}
      accessibilityRole="button"
      accessibilityLabel="Acceso para el personal de biblioteca"
      style={estilos.enlace}>
      <Text style={estilos.texto}>Personal</Text>
    </Link>
  );
}

const estilos = StyleSheet.create({
  enlace: {
    minHeight: tamanios.areaTactil,
    paddingHorizontal: espacios.sm,
    paddingVertical: espacios.md,
  },
  texto: {
    color: colores.primario,
    fontSize: tamanios.texto,
    fontWeight: '600',
  },
});
