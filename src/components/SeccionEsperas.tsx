import { StyleSheet, View } from 'react-native';

import { EstadoVacio } from '@/components/EstadoVacio';
import { TarjetaEspera } from '@/components/TarjetaEspera';
import { TituloSeccion } from '@/components/TituloSeccion';
import { espacios } from '@/constants/tema';
import type { Libro } from '@/types';

export type EsperaVisible = {
  libro: Libro;
  posicion: number;
  total: number;
};

type Props = {
  esperas: EsperaVisible[];
};

export function SeccionEsperas({ esperas }: Props) {
  return (
    <View style={estilos.contenedor}>
      <TituloSeccion texto="En lista de espera" />
      {esperas.length === 0 ? (
        <EstadoVacio mensaje="No estás esperando ningún libro." icono="time-outline" />
      ) : (
        <View style={estilos.lista}>
          {esperas.map((espera) => (
            <TarjetaEspera
              key={espera.libro.isbn}
              libro={espera.libro}
              posicion={espera.posicion}
              total={espera.total}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    paddingBottom: espacios.xl,
  },
  lista: {
    paddingHorizontal: espacios.lg,
  },
});
