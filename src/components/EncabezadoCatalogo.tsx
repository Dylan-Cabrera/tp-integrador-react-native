import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ListaRecientes } from '@/components/ListaRecientes';
import { espacios } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  recientes: Libro[];
};

export function EncabezadoCatalogo({ recientes }: Props) {
  return (
    <View style={estilos.contenedor}>
      <ListaRecientes libros={recientes} />
      <View style={estilos.accesos}>
        <View style={estilos.acceso}>
          <Boton titulo="Buscar" variante="secundario" onPress={() => router.push('/buscar')} />
        </View>
        <View style={estilos.acceso}>
          <Boton titulo="Escanear" variante="secundario" onPress={() => router.push('/escanear')} />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espacios.lg,
    padding: espacios.lg,
  },
  accesos: {
    flexDirection: 'row',
    gap: espacios.md,
  },
  acceso: {
    flex: 1,
  },
});
