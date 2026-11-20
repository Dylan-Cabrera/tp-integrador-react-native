import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { colores } from '@/constants/tema';

type PropsIcono = {
  focused: boolean;
  size: number;
};

function colorIcono(focused: boolean): string {
  return focused ? colores.primario : colores.textoSecundario;
}

function IconoCatalogo({ focused, size }: PropsIcono) {
  return <Ionicons name="library-outline" color={colorIcono(focused)} size={size} />;
}

function IconoReservas({ focused, size }: PropsIcono) {
  return <Ionicons name="bookmark-outline" color={colorIcono(focused)} size={size} />;
}

export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        headerTintColor: colores.primario,
      }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          headerShown: false,
          tabBarAccessibilityLabel: 'Catálogo',
          tabBarIcon: IconoCatalogo,
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarAccessibilityLabel: 'Mis reservas',
          tabBarIcon: IconoReservas,
        }}
      />
    </Tabs>
  );
}
