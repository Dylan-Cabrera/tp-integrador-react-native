import { Stack } from 'expo-router';

import { EnlacePersonal } from '@/components/EnlacePersonal';
import { colores } from '@/constants/tema';

export default function LayoutCatalogo() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colores.primario,
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen name="index" options={{ title: 'Catálogo', headerRight: EnlacePersonal }} />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
    </Stack>
  );
}
