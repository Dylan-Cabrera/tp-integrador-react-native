import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { MensajeAviso } from '@/components/MensajeAviso';
import { espacios } from '@/constants/tema';
import { buscarLibroPorIsbn, normalizarIsbn, tieneFormatoIsbn } from '@/lib/isbn';
import type { Libro } from '@/types';

type Props = {
  onLibroEncontrado: (libro: Libro) => void;
};

/** Alternativa a la cámara: siempre se puede escribir el ISBN a mano. */
export function IngresoIsbn({ onLibroEncontrado }: Props) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    const isbn = normalizarIsbn(texto);
    if (!tieneFormatoIsbn(isbn)) {
      setError('El ISBN tiene que tener 13 números. Lo encontrás arriba del código de barras.');
      return;
    }
    const libro = buscarLibroPorIsbn(isbn);
    if (libro === undefined) {
      setError(`No hay ningún libro con el ISBN ${isbn} en el catálogo.`);
      return;
    }
    setError(null);
    onLibroEncontrado(libro);
  }

  return (
    <View style={estilos.contenedor}>
      <CampoTexto
        etiqueta="Escribí el ISBN"
        value={texto}
        onChangeText={setTexto}
        placeholder="9789500420211"
        keyboardType="number-pad"
        maxLength={17}
        returnKeyType="go"
        onSubmitEditing={abrir}
      />
      {error !== null && <MensajeAviso mensaje={error} tipo="error" />}
      <Boton titulo="Abrir libro" onPress={abrir} deshabilitado={texto.trim() === ''} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espacios.md,
  },
});
