import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

export function NavegacionRaiz() {
  const { estado } = useBiblioteca();

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colores.primario,
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
        <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
        <Stack.Screen
          name="reservar/[isbn]"
          options={{ title: 'Confirmar reserva', presentation: 'modal' }}
        />
        <Stack.Screen name="permisos/[recurso]" options={{ title: 'Permiso', presentation: 'modal' }} />

        <Stack.Protected guard={!estado.sesion}>
          <Stack.Screen name="login" options={{ title: 'Personal', presentation: 'modal' }} />
        </Stack.Protected>

        <Stack.Protected guard={estado.sesion}>
          <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
        </Stack.Protected>

        <Stack.Screen name="reserva" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
      </Stack>
    </>
  );
}
