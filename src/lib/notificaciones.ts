import { AndroidImportance, setNotificationChannelAsync } from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS } from '@/constants/biblioteca';

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
