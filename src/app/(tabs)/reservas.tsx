import { FlatList, StyleSheet, View } from 'react-native';

import { EstadoVacio } from '@/components/EstadoVacio';
import { MensajeAviso } from '@/components/MensajeAviso';
import { SeccionEsperas, type EsperaVisible } from '@/components/SeccionEsperas';
import { TarjetaPrestamo } from '@/components/TarjetaPrestamo';
import { TituloSeccion } from '@/components/TituloSeccion';
import { USUARIO_ACTUAL } from '@/constants/biblioteca';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { esperasDe, personasEnEspera, posicionEnEspera, prestamosDe } from '@/lib/consultas';
import { buscarLibroPorIsbn } from '@/lib/isbn';
import type { Libro, Prestamo } from '@/types';

type PrestamoVisible = {
  libro: Libro;
  prestamo: Prestamo;
};

export default function PantallaReservas() {
  const { estado, devolver, descartarAviso } = useBiblioteca();

  const prestamos: PrestamoVisible[] = prestamosDe(estado, USUARIO_ACTUAL).flatMap((prestamo) => {
    const libro = buscarLibroPorIsbn(prestamo.isbn);
    return libro === undefined ? [] : [{ libro, prestamo }];
  });

  const esperas: EsperaVisible[] = esperasDe(estado, USUARIO_ACTUAL).flatMap((isbn) => {
    const libro = buscarLibroPorIsbn(isbn);
    return libro === undefined
      ? []
      : [
          {
            libro,
            posicion: posicionEnEspera(estado, isbn, USUARIO_ACTUAL),
            total: personasEnEspera(estado, isbn).length,
          },
        ];
  });

  return (
    <FlatList
      style={estilos.lista}
      data={prestamos}
      keyExtractor={(item) => item.libro.isbn}
      renderItem={({ item }) => (
        <TarjetaPrestamo
          libro={item.libro}
          prestamo={item.prestamo}
          onDevolver={() => devolver(item.libro.isbn)}
        />
      )}
      ListHeaderComponent={
        <View>
          {estado.avisos.length > 0 && (
            <View style={estilos.avisos}>
              {estado.avisos.map((aviso) => (
                <MensajeAviso
                  key={aviso.id}
                  mensaje={aviso.mensaje}
                  onDescartar={() => descartarAviso(aviso.id)}
                />
              ))}
            </View>
          )}
          <TituloSeccion texto="Mis préstamos" />
        </View>
      }
      ListEmptyComponent={
        <EstadoVacio mensaje="No tenés libros prestados." icono="book-outline" />
      }
      ListFooterComponent={<SeccionEsperas esperas={esperas} />}
    />
  );
}

const estilos = StyleSheet.create({
  lista: {
    backgroundColor: colores.fondo,
  },
  avisos: {
    gap: espacios.sm,
    paddingHorizontal: espacios.lg,
    paddingTop: espacios.lg,
  },
});
