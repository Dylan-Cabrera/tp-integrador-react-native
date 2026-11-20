# Constitución del proyecto

Principios no negociables. Una tarea no está terminada si rompe alguno.

## I. La app nunca se bloquea
Ningún permiso denegado impide usar la app. Sin cámara se escribe el ISBN a mano; sin notificaciones los avisos
aparecen dentro de la app. Ninguna pantalla queda sin salida: todo error tiene una acción (reintentar, volver, ir al Catálogo).

## II. Mínimo privilegio
Solo `expo-camera` y `expo-notifications` como módulos nativos. Sin micrófono, sin ubicación, sin galería.
Los permisos se piden **en contexto** (cámara al escanear, notificaciones al activar "Recordarme"), siempre después
de una pantalla previa que explica el beneficio. Prohibido `expo-permissions`.

## III. Estructura
- `src/app` contiene **solo rutas**.
- `src/components` componentes · `src/hooks` hooks · `src/lib` lógica · `src/data` datos · `src/types` tipos ·
  `src/context` Context · `src/estructuras` Pila y Cola · `src/constants` constantes y tema.
- Las importaciones van "hacia abajo": nada fuera de `src/app` importa de `src/app`.
- Un componente por archivo, declarado a nivel de módulo, con un nombre que diga qué hace.

## IV. TypeScript estricto
Sin `any`. Props, parámetros de ruta y datos tipados. Rutas tipadas activas. `npx tsc --noEmit` sin errores.

## V. Efectos limpios
Todo efecto con temporizador, suscripción o pedido asíncrono tiene limpieza. Arrays de dependencias completos.
Nunca se pasa una función `async` directo a `useEffect`.

## VI. Estado inmutable
El estado de React nunca se muta. Pila y Cola se clonan antes de modificarse y se guarda la copia nueva.
Un dato vive en **un solo lugar**; lo derivable se calcula (por ejemplo, los ejemplares disponibles).

## VII. Pantallas completas
Toda pantalla que espera datos muestra **cargando**, **error con acción** y **vacío**.
Listas con `FlatList`, `keyExtractor` por ISBN (nunca el índice) y `ListEmptyComponent`.

## VIII. Estilos y accesibilidad
`StyleSheet.create` en todos los archivos; colores, tamaños y espaciados salen de `src/constants/tema.ts`. Sin estilos en línea.
Botones con `accessibilityRole="button"`; los que solo tienen ícono llevan `accessibilityLabel`. Áreas táctiles ≥ 44 × 44.

## IX. Mensajes humanos
En español claro, dirigidos a la persona usuaria. Nunca se muestra el texto crudo de un error técnico.

## X. Limpieza y Git
`npx expo lint` sin errores ni reglas desactivadas. Sin `console.log`, código comentado ni archivos sin usar.
Paquetes solo con `npx expo install`. Commits chicos (mínimo 15) con mensajes que digan qué cambió. `.gitignore` correcto.
