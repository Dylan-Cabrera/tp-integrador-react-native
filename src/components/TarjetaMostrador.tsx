import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espacios, radios, tamanios } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
  personas: string[];
  onEntregar: () => void;
};

export function TarjetaMostrador({ libro, personas, onEntregar }: Props) {
  const frente = personas[0];

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      {frente === undefined ? (
        <Text style={estilos.texto}>Nadie está esperando este libro.</Text>
      ) : (
        <>
          <Text style={estilos.texto}>
            Al frente: <Text style={estilos.destacado}>{frente}</Text>
          </Text>
          <Text style={estilos.texto}>
            {personas.length === 1 ? 'Espera 1 persona.' : `Esperan ${personas.length} personas.`}
          </Text>
        </>
      )}
      <Boton
        titulo="Entregar al siguiente"
        onPress={onEntregar}
        deshabilitado={frente === undefined}
        accessibilityHint={
          frente === undefined ? undefined : `Entrega ${libro.titulo} a ${frente}`
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: tamanios.bordeFino,
    gap: espacios.sm,
    marginBottom: espacios.md,
    marginHorizontal: espacios.lg,
    padding: espacios.lg,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.textoGrande,
    fontWeight: '600',
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: tamanios.texto,
  },
  destacado: {
    color: colores.texto,
    fontWeight: '700',
  },
});
