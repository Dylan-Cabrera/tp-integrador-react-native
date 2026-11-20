import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ContenidoPermiso } from '@/components/ContenidoPermiso';
import { EstadoError } from '@/components/EstadoError';
import { colores } from '@/constants/tema';
import type { RecursoPermiso } from '@/types';

function esRecurso(valor: string): valor is RecursoPermiso {
  return valor === 'camara' || valor === 'notificaciones';
}

function cerrar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export default function PantallaPermiso() {
  const { recurso } = useLocalSearchParams<'/permisos/[recurso]'>();

  if (!esRecurso(recurso)) {
    return (
      <View style={estilos.contenedor}>
        <EstadoError
          mensaje="Esta app solo usa la cámara y las notificaciones."
          textoAccion="Volver"
          onAccion={cerrar}
        />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <ContenidoPermiso recurso={recurso} onCerrar={cerrar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: colores.fondo,
    flex: 1,
    justifyContent: 'center',
  },
});
