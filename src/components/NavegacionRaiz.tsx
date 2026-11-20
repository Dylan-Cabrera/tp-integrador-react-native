import { router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

export function NavegacionRaiz() {
  const { estado } = useBiblioteca();
  const habiaSesion = useRef(estado.sesion);

  // Al iniciar sesión, el login desaparece (Stack.Protected) y se abre el mostrador.
  // Se hace acá porque este componente sigue montado cuando el login ya no existe.
  useEffect(() => {
    if (estado.sesion && !habiaSesion.current) {
      router.push('/mostrador');
    }
    habiaSesion.current = estado.sesion;
  }, [estado.sesion]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colores.primario,
          contentStyle: estilos.contenido,
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

const estilos = StyleSheet.create({
  contenido: {
    backgroundColor: colores.fondo,
  },
});
