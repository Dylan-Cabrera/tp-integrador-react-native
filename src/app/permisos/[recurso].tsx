import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ContenidoPermiso } from '@/components/ContenidoPermiso';
import { EstadoError } from '@/components/EstadoError';
import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import type { EstadoPermiso, RecursoPermiso } from '@/types';

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
  // `isbn` llega cuando se viene del interruptor "Recordarme" de un préstamo.
  const { recurso, isbn } = useLocalSearchParams<{ recurso: string; isbn?: string }>();
  const { activarRecordatorio, agregarAviso } = useBiblioteca();

  async function alResolver(resultado: EstadoPermiso) {
    if (isbn === undefined) {
      return;
    }
    if (resultado === 'concedido') {
      await activarRecordatorio(isbn);
    } else {
      agregarAviso(
        'Sin permiso de notificaciones no podemos recordarte la devolución. Revisá la fecha en esta pantalla.',
      );
    }
  }

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
      <ContenidoPermiso recurso={recurso} onCerrar={cerrar} onResultado={alResolver} />
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
