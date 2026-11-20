import { Redirect } from 'expo-router';

/** URL de la versión anterior de la app: se conserva para no romper links viejos. */
export default function RedireccionReserva() {
  return <Redirect href="/reservas" />;
}
