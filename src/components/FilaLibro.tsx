import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacios, tamanios } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
  disponibles: number;
  enEspera: number;
};

function textoDisponibilidad(disponibles: number, enEspera: number): string {
  if (disponibles > 0) {
    return disponibles === 1 ? '1 disponible' : `${disponibles} disponibles`;
  }
  if (enEspera > 0) {
    return `Sin ejemplares · ${enEspera} en espera`;
  }
  return 'Sin ejemplares';
}

export function FilaLibro({ libro, disponibles, enEspera }: Props) {
  const disponibilidad = textoDisponibilidad(disponibles, enEspera);

  return (
    <Link href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${libro.titulo}, de ${libro.autor}. ${disponibilidad}`}>
        {/* El estilo va en un View interno: con Link asChild, en web se pierde el style en forma de función. */}
        {({ pressed }) => (
          <View style={[estilos.fila, pressed && estilos.presionada]}>
            <View style={estilos.textos}>
              <Text style={estilos.titulo}>{libro.titulo}</Text>
              <Text style={estilos.autor}>{libro.autor}</Text>
              <Text style={disponibles > 0 ? estilos.disponible : estilos.agotado}>
                {disponibilidad}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={tamanios.icono} color={colores.textoSecundario} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderBottomColor: colores.borde,
    borderBottomWidth: tamanios.bordeFino,
    flexDirection: 'row',
    minHeight: tamanios.areaTactil,
    paddingHorizontal: espacios.lg,
    paddingVertical: espacios.md,
  },
  presionada: {
    backgroundColor: colores.primarioSuave,
  },
  textos: {
    flex: 1,
    gap: espacios.xs,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.textoGrande,
    fontWeight: '600',
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: tamanios.texto,
  },
  disponible: {
    color: colores.exito,
    fontSize: tamanios.textoChico,
    fontWeight: '600',
  },
  agotado: {
    color: colores.aviso,
    fontSize: tamanios.textoChico,
    fontWeight: '600',
  },
});
