import { useCameraPermissions } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import type { PermissionResponse } from 'expo';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { asegurarCanal } from '@/lib/notificaciones';
import { estadoDePermiso } from '@/lib/permisos';
import type { EstadoPermiso, RecursoPermiso } from '@/types';

type ResultadoPermiso = {
  estado: EstadoPermiso;
  /** Muestra el diálogo del sistema (si todavía se puede) y devuelve el estado resultante. */
  pedir: () => Promise<EstadoPermiso>;
  /** Vuelve a consultar el permiso sin preguntar nada. */
  refrescar: () => Promise<EstadoPermiso>;
  abrirAjustes: () => void;
};

/**
 * Estado de un permiso en cuatro valores: cargando → concedido | preguntable | bloqueado.
 * Se vuelve a consultar cuando la app vuelve a primer plano (por ejemplo, al volver de Ajustes).
 */
export function usePermiso(recurso: RecursoPermiso): ResultadoPermiso {
  // Los hooks se llaman siempre, sin condiciones; se usa el del recurso pedido.
  const [permisoCamara, pedirCamara, consultarCamara] = useCameraPermissions();
  const [permisoNotificaciones, setPermisoNotificaciones] = useState<PermissionResponse | null>(
    null,
  );

  const refrescar = useCallback(async (): Promise<EstadoPermiso> => {
    if (recurso === 'camara') {
      return estadoDePermiso(await consultarCamara());
    }
    const respuesta = await Notifications.getPermissionsAsync();
    setPermisoNotificaciones(respuesta);
    return estadoDePermiso(respuesta);
  }, [recurso, consultarCamara]);

  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    if (recurso === 'camara') {
      return estadoDePermiso(await pedirCamara());
    }
    await asegurarCanal();
    const respuesta = await Notifications.requestPermissionsAsync();
    setPermisoNotificaciones(respuesta);
    return estadoDePermiso(respuesta);
  }, [recurso, pedirCamara]);

  useEffect(() => {
    if (recurso !== 'notificaciones') {
      return;
    }
    let cancelado = false;
    Notifications.getPermissionsAsync().then((respuesta) => {
      if (!cancelado) {
        setPermisoNotificaciones(respuesta);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [recurso]);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        refrescar();
      }
    });
    return () => suscripcion.remove();
  }, [refrescar]);

  const abrirAjustes = useCallback(() => {
    Linking.openSettings();
  }, []);

  const respuesta = recurso === 'camara' ? permisoCamara : permisoNotificaciones;

  return { estado: estadoDePermiso(respuesta), pedir, refrescar, abrirAjustes };
}
