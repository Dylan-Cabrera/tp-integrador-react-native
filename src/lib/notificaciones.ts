import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '@/constants/biblioteca';
import { formatearFecha } from '@/lib/fechas';
import type { Libro, Prestamo } from '@/types';

/** Muestra las notificaciones también cuando la app está abierta. Se llama una vez al iniciar. */
export function configurarNotificaciones(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * En Android 8+ toda notificación necesita un canal, y en Android 13+ el diálogo
 * de permiso no aparece hasta que exista al menos uno. Por eso se crea antes de pedir.
 */
export async function asegurarCanal(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: 'Préstamos',
    description: 'Recordatorios de devolución y avisos de libros disponibles.',
    importance: AndroidImportance.DEFAULT,
  });
}

/** Consulta el permiso en este momento (no usa un valor guardado que podría estar viejo). */
export async function notificacionesPermitidas(): Promise<boolean> {
  const { granted } = await getPermissionsAsync();
  return granted;
}

/**
 * Programa el recordatorio de devolución. En modo demostración llega a los
 * SEGUNDOS_RECORDATORIO segundos en lugar de un día antes del vencimiento.
 * Devuelve el identificador para poder cancelarlo.
 */
export async function programarRecordatorio(libro: Libro, prestamo: Prestamo): Promise<string> {
  await asegurarCanal();
  return scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolución',
      body: `Acordate de devolver «${libro.titulo}» antes del ${formatearFecha(prestamo.vence)}.`,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarRecordatorio(id: string): Promise<void> {
  await cancelScheduledNotificationAsync(id);
}

/** Notificación inmediata: el libro que esperaba la persona ya está disponible. */
export async function notificarDisponible(libro: Libro): Promise<void> {
  await asegurarCanal();
  await scheduleNotificationAsync({
    content: {
      title: '¡Tu libro está listo!',
      body: `Ya podés retirar «${libro.titulo}» en la biblioteca.`,
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_PRESTAMOS } : null,
  });
}
