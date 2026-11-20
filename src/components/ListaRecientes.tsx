import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacios, radios, tamanios } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  /** Del más reciente al más antiguo. */
  libros: Libro[];
};

export function ListaRecientes({ libros }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Vistos recientemente</Text>
      {libros.length === 0 ? (
        <Text style={estilos.vacio}>Todavía no abriste ningún libro.</Text>
      ) : (
        <View style={estilos.lista}>
          {libros.map((libro) => (
            <Link
              key={libro.isbn}
              href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }}
              asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${libro.titulo}`}
                style={({ pressed }) => [estilos.chip, pressed && estilos.chipPresionado]}>
                <Text style={estilos.textoChip} numberOfLines={1}>
                  {libro.titulo}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espacios.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.texto,
    fontWeight: '700',
  },
  vacio: {
    color: colores.textoSecundario,
    fontSize: tamanios.textoChico,
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.sm,
  },
  chip: {
    backgroundColor: colores.primarioSuave,
    borderRadius: radios.lg,
    justifyContent: 'center',
    maxWidth: '100%',
    minHeight: tamanios.areaTactil,
    paddingHorizontal: espacios.md,
  },
  chipPresionado: {
    opacity: 0.7,
  },
  textoChip: {
    color: colores.primario,
    fontSize: tamanios.textoChico,
    fontWeight: '600',
  },
});
