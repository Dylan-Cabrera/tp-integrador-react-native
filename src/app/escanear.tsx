import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EstadoCargando } from '@/components/EstadoCargando';
import { IngresoIsbn } from '@/components/IngresoIsbn';
import { MensajeAviso } from '@/components/MensajeAviso';
import { PanelPermiso } from '@/components/PanelPermiso';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { colores, espacios, radios, tamanios } from '@/constants/tema';
import { usePermiso } from '@/hooks/usePermiso';
import { buscarLibroPorIsbn, normalizarIsbn } from '@/lib/isbn';
import type { Libro } from '@/types';

const TIPOS_CODIGO = { barcodeTypes: ['ean13' as const] };

function abrirLibro(libro: Libro) {
  // replace: "atrás" desde el detalle no vuelve a la cámara.
  router.replace({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } });
}

export default function PantallaEscanear() {
  const { estado, refrescar, abrirAjustes } = usePermiso('camara');
  const [aviso, setAviso] = useState<string | null>(null);
  // Refs y no estado: onBarcodeScanned se dispara muchas veces por segundo y un setState
  // no cambia el valor hasta el próximo render, así que no frenaría los llamados que ya están en camino.
  const navegando = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);
  const mostroPantallaPrevia = useRef(false);

  // Al volver de la pantalla previa o de Ajustes, el permiso pudo haber cambiado.
  useFocusEffect(
    useCallback(() => {
      refrescar();
    }, [refrescar]),
  );

  // Antes del diálogo del sistema se muestra la pantalla previa (una sola vez por visita).
  useEffect(() => {
    if (estado === 'preguntable' && !mostroPantallaPrevia.current) {
      mostroPantallaPrevia.current = true;
      router.push('/permisos/camara');
    }
  }, [estado]);

  const alLeerCodigo = useCallback((resultado: BarcodeScanningResult) => {
    if (navegando.current) {
      return;
    }
    const isbn = normalizarIsbn(resultado.data);
    const libro = buscarLibroPorIsbn(isbn);
    if (libro !== undefined) {
      navegando.current = true;
      abrirLibro(libro);
      return;
    }
    if (ultimoDesconocido.current !== isbn) {
      ultimoDesconocido.current = isbn;
      setAviso(`El código ${isbn} no es de ningún libro del catálogo. Probá con otro.`);
    }
  }, []);

  const abrirManual = useCallback((libro: Libro) => {
    navegando.current = true;
    abrirLibro(libro);
  }, []);

  const textos = TEXTOS_PERMISO.camara;

  return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      {estado === 'cargando' && <EstadoCargando mensaje="Preparando la cámara…" />}

      {estado === 'concedido' && (
        <View style={estilos.marcoCamara}>
          <CameraView
            style={estilos.camara}
            facing="back"
            barcodeScannerSettings={TIPOS_CODIGO}
            onBarcodeScanned={alLeerCodigo}
            accessibilityLabel="Cámara: apuntá al código de barras de la contratapa"
          />
        </View>
      )}

      {estado === 'preguntable' && (
        <PanelPermiso
          icono="camera-outline"
          titulo={textos.titulo}
          texto={textos.beneficio}
          textoBoton="Continuar"
          onPress={() => router.push('/permisos/camara')}
        />
      )}

      {estado === 'bloqueado' && (
        <PanelPermiso
          icono="camera-outline"
          titulo={textos.titulo}
          texto={textos.bloqueado}
          textoBoton="Abrir Ajustes"
          onPress={abrirAjustes}
        />
      )}

      {aviso !== null && (
        <MensajeAviso mensaje={aviso} tipo="error" onDescartar={() => setAviso(null)} />
      )}

      <IngresoIsbn onLibroEncontrado={abrirManual} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: espacios.lg,
    padding: espacios.lg,
  },
  marcoCamara: {
    backgroundColor: colores.camaraFondo,
    borderRadius: radios.lg,
    height: tamanios.alturaCamara,
    overflow: 'hidden',
  },
  camara: {
    flex: 1,
  },
});
