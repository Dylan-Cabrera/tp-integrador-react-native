import { StyleSheet, Text, View } from 'react-native';

export default function Inicio() {
  return (
    <View style={estilos.contenedor}>
      <Text>Biblioteca IPF</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
