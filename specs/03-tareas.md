# Tareas — Biblioteca IPF

Cada tarea es **un commit**. Antes de cada commit: verificar los criterios citados en Expo Go, `npx expo lint`
y `npx tsc --noEmit`. Marcar `[x]` al terminar.

Leyenda: **Req** = requisitos de la [especificación](01-especificacion.md) · **Verificar** = cómo se comprueba.

---

## Fase 0 · Base del proyecto

- [x] **T01 · Crear el proyecto**
  `npx create-expo-app@latest` en una carpeta nueva (la plantilla se queja si la carpeta tiene archivos), mover
  `specs/` adentro y borrar las pantallas y componentes de ejemplo. La plantilla ya trae `src/app`, `src/components`,
  `src/constants` y `src/hooks` (desde SDK 55).
  `git init`, `.gitignore` (node_modules, .expo, `android/` e `ios/` si se hace prebuild).
  **Req:** RNF-01 · **Verificar:** la app abre en Expo Go. Anotar en el README el número de la última versión del SDK que instaló.
  _Commit:_ `Crea el proyecto con Expo Router y TypeScript`

- [x] **T02 · Configurar app.json y dependencias**
  `scheme`, `typedRoutes`, `npx expo install expo-camera expo-notifications`, plugins con textos de propósito,
  `microphonePermission: false`, `recordAudioAndroid: false`, `blockedPermissions`.
  **Req:** RNF-02 · **Verificar:** `npx expo config` muestra la configuración esperada.
  _Commit:_ `Configura scheme, plugins de cámara y notificaciones y permisos bloqueados`

- [x] **T03 · Estructura de carpetas, tema y constantes**
  Crear `src/{components,hooks,lib,data,types,context,estructuras,constants}`, `tema.ts`, `biblioteca.ts`, `permisos.ts`.
  **Req:** Constitución III, VIII · _Commit:_ `Agrega estructura de carpetas, tema y constantes`

## Fase 1 · Datos y estructuras

- [x] **T04 · Tipos, API y libros**
  Copiar `types/index.ts` y `lib/api.ts` tal cual. `data/libros.ts` con ≥ 15 libros, **2 reales con ISBN real**,
  varios con `ejemplares: 0`; `data/esperasIniciales.ts` con 1–2 personas en al menos 2 de ellos. Agregar tipos propios.
  **Req:** RD-01..04 · _Commit:_ `Agrega catálogo de libros, tipos y API simulada`

- [x] **T05 · Clases Pila y Cola**
  `#items`, `tamanio`, `aArray()`, `clonar()`. Cola sin `shift()`; desencolar vacía devuelve `undefined`.
  **Req:** RNF-04 · _Commit:_ `Implementa Pila y Cola con campos privados`

- [x] **T06 · Utilidades** `lib/isbn.ts` (`esIsbnValido`), `lib/fechas.ts` (vencimiento a 7 días, formato).
  **Req:** RF-04, RF-05 · _Commit:_ `Agrega validación de ISBN y utilidades de fechas`

- [x] **T07 · Reducer y Context**
  `lib/bibliotecaReducer.ts` puro (tabla del plan §6) y `context/BibliotecaContext.tsx` con `useReducer`,
  funciones con `useCallback`, `value` con `useMemo`, hook `useBiblioteca()` que falla con mensaje claro fuera del Provider.
  **Req:** RNF-05, Constitución VI · _Commit:_ `Crea el Context de la biblioteca con reducer inmutable`

## Fase 2 · Navegación

- [x] **T08 · Árbol de rutas y layouts**
  Layout raíz (Provider + `NavegacionRaiz` + `anchor`), Tabs con íconos, Stack de Catálogo, todas las rutas
  como pantallas mínimas, `presentation: 'modal'` donde corresponde.
  **Req:** RF-10, RNF-03 · **Verificar:** se puede llegar a cada URL de la tabla A1.
  _Commit:_ `Arma el árbol de rutas con tabs, stacks y modales`

- [x] **T09 · Redirect y 404**
  `reserva.tsx` con `<Redirect href="/reservas" />`; `+not-found.tsx` muestra la URL y link al Catálogo.
  **Req:** HU-11 · **Verificar:** `bibliotecaipf://reserva` y `bibliotecaipf://cualquiera`.
  _Commit:_ `Agrega redirección de /reserva y pantalla 404`

- [x] **T10 · Rutas protegidas y login**
  `Stack.Protected` para `login` y `mostrador`; login con credenciales fijas, mensaje si son incorrectas.
  Link "Personal" en el header del Catálogo.
  **Req:** HU-09, RF-08 · **Verificar:** CA-09.1..4 y `bibliotecaipf://mostrador` sin sesión.
  _Commit:_ `Protege login y mostrador con Stack.Protected`

## Fase 3 · Funciones de la app

- [x] **T11 · Componentes de estado y botones**
  `EstadoCargando`, `EstadoError` (con acción), `EstadoVacio`, `Boton`, `BotonIcono` (rol, label, 44×44).
  **Req:** Constitución VII, VIII · _Commit:_ `Agrega componentes de estado y botones accesibles`

- [x] **T12 · Catálogo con useLibros**
  `useLibros()` con limpieza y `reintentar`; `FlatList` con `keyExtractor` por ISBN, `ListEmptyComponent`,
  accesos a Buscar y Escanear.
  **Req:** HU-01, RF-01 · **Verificar:** forzar errores (1 de 5) y tocar "Reintentar".
  _Commit:_ `Muestra el catálogo con estados de carga, error y vacío`

- [x] **T13 · Detalle y vistos recientemente**
  Validación de ISBN, título en el header, disponibles calculados, personas en espera, `VER_LIBRO` al abrir,
  `ListaRecientes` en el Catálogo.
  **Req:** HU-02, RF-02, RF-04 · **Verificar:** `/libro/123`, `/libro/abc`, abrir el mismo libro dos veces.
  _Commit:_ `Agrega detalle validado y vistos recientemente con Pila`

- [x] **T14 · Buscador en la URL**
  `useBusqueda(q)` con descarte de respuestas viejas; `setParams` al escribir.
  **Req:** HU-03, RF-03 · **Verificar:** escribir rápido "bor" → "borges"; `bibliotecaipf://buscar?q=borges` y atrás.
  _Commit:_ `Implementa buscador en la URL sin condición de carrera`

- [x] **T15 · Reservar con Cola**
  Modal de confirmación, regla de negocio del plan §6, sin duplicados, navegación sin volver a la confirmación.
  **Req:** HU-05, RF-05 · **Verificar:** libro con y sin ejemplares; reservar dos veces; atrás desde `/reservas`.
  _Commit:_ `Permite reservar con préstamo o lista de espera`

- [x] **T16 · Mis reservas y devolver**
  Secciones de préstamos, esperas (posición) y avisos, cada una con su vacío; "Devolver".
  **Req:** HU-06, HU-08 · _Commit:_ `Muestra mis préstamos, reservas en espera y avisos`

## Fase 4 · Permisos

- [x] **T17 · Hook usePermiso y pantalla previa**
  Cuatro estados, `AppState`, `abrirAjustes`; `/permisos/[recurso]` con beneficio y un único botón.
  **Req:** CA-04.1, CA-04.2, CA-04.6 · _Commit:_ `Agrega usePermiso y pantalla previa de permisos`

- [x] **T18 · Escáner**
  `CameraView` EAN-13, cerrojo con `useRef`, `router.replace` al detalle, aviso único, `IngresoIsbn` siempre visible.
  **Req:** HU-04, RF-06, RF-09 · **Verificar:** recorrido D1 (permitir, denegar dos veces, Ajustes) con los 2 libros reales.
  _Commit:_ `Implementa escáner de código de barras con navegación única`

- [x] **T19 · Recordatorio de devolución**
  `lib/notificaciones.ts`, canal Android antes de pedir, programar a 15 s, guardar id, cancelar al apagar/devolver.
  **Req:** HU-07, RF-07 · **Verificar:** recibir la notificación; devolver antes de 15 s y que no llegue; denegar.
  _Commit:_ `Agrega recordatorio de devolución con notificaciones locales`

- [x] **T20 · Mostrador**
  Lista de libros con espera, "Entregar al siguiente", notificación o aviso según el permiso actual, "Cerrar sesión".
  **Req:** HU-10, RF-08 · **Verificar:** encolarte en un libro, entregar hasta que seas el frente, con y sin permiso.
  _Commit:_ `Implementa el mostrador con entrega en orden de reserva`

## Fase 5 · Cierre

- [x] **T21 · Pasada de calidad**
  Sin `any`, sin `console.log`, sin estilos en línea, sin código comentado ni archivos sin usar; lint y tsc limpios;
  revisar cada pantalla contra la constitución.
  _Commit:_ `Limpia código y corrige advertencias de lint y TypeScript`

- [x] **T22 · README**
  Cómo ejecutar, versión del SDK, árbol de `src/app` con el navegador de cada `_layout`, bloque `plugins` comentado,
  tabla de permisos (recurso, módulo, cuándo se pide, alternativa), justificación de `blockedPermissions`,
  deep links de prueba, salida de lint y tsc.
  **Req:** F2.3, F2.5 · _Commit:_ `Documenta ejecución, rutas y permisos en el README`

- [ ] **T23 · Capturas**
  Catálogo cargando/error/datos, buscador, detalle inexistente, reserva con y sin ejemplares, escáner en 4 estados,
  notificación recibida, mostrador antes y después, 404.
  **Req:** F2.4 · _Commit:_ `Agrega capturas de las pantallas y estados`

- [ ] **T24 · RESPUESTAS.md** (Partes B a E, escritas por vos citando archivos y líneas de tu código)
  _Commit:_ `Responde las preguntas de análisis de las partes B a E`

## Opcionales (después de T21)

- [ ] **T25 · Tests de Pila y Cola** con `jest-expo` (≥ 6 casos) — OPC-02
- [ ] **T26 · Debounce de 300 ms** en `useBusqueda` — OPC-03
- [ ] **T27 · Persistencia** con AsyncStorage sin pantalla vacía al iniciar — OPC-01
- [ ] **T28 · Modo oscuro** con `useColorScheme` — OPC-04
- [ ] **T29 · Development build** y captura del diálogo de cámara — OPC-05
