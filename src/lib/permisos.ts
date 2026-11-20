import type { PermissionResponse } from 'expo';

import type { EstadoPermiso } from '@/types';

/** Traduce la respuesta del sistema a los cuatro estados que maneja la app. */
export function estadoDePermiso(respuesta: PermissionResponse | null): EstadoPermiso {
  if (respuesta === null) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  // `status` solo dice "denied"; `canAskAgain` es lo que distingue si el diálogo
  // del sistema todavía puede aparecer o si hay que mandar a la persona a Ajustes.
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}
