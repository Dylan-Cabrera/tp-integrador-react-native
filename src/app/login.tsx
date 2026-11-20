import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { MensajeAviso } from '@/components/MensajeAviso';
import { colores, espacios, tamanios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

export default function PantallaLogin() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  function ingresar() {
    // Si las credenciales son correctas, Stack.Protected quita esta pantalla y
    // NavegacionRaiz abre el mostrador.
    if (!iniciarSesion(usuario, clave)) {
      setError('El usuario o la clave no son correctos. Revisalos e intentá de nuevo.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={estilos.titulo}>Ingreso del personal</Text>
      <CampoTexto
        etiqueta="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
      />
      <CampoTexto
        etiqueta="Clave"
        value={clave}
        onChangeText={setClave}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={ingresar}
      />
      {error !== null && <MensajeAviso mensaje={error} tipo="error" />}
      <Boton
        titulo="Ingresar"
        onPress={ingresar}
        deshabilitado={usuario.trim() === '' || clave === ''}
      />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    gap: espacios.lg,
    padding: espacios.xl,
  },
  titulo: {
    color: colores.texto,
    fontSize: tamanios.titulo,
    fontWeight: '700',
  },
});
