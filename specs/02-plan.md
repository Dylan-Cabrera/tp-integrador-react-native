# Plan técnico — Biblioteca IPF

Cómo se implementa la [especificación](01-especificacion.md) respetando la [constitución](00-constitucion.md).
Las APIs de este plan se confirmaron en docs.expo.dev el 20/11/2026, cuando la última versión era el **SDK 58**
(React Native 0.88). Si al crear el proyecto `create-expo-app@latest` instala una versión más nueva, revisar
las notas marcadas con **(SDK 58)**.

## 1. Stack

| Pieza | Elección |
|---|---|
| Base | **Última versión del SDK de Expo** (hoy SDK 58) con `npx create-expo-app@latest` (TypeScript + Expo Router). La plantilla ya trae `src/app` (desde SDK 55). Anotar el número en el README. |
| Navegación | Expo Router: Stack raíz + Tabs + Stack por tab, rutas tipadas (`experiments.typedRoutes`). |
| Estado global | Un Context (`BibliotecaContext`) con `useReducer` y reducer puro en `src/lib`. |
| Módulos nativos | `expo-camera`, `expo-notifications` (instalados con `npx expo install`). |
| Íconos | `@expo/vector-icons` (Ionicons). |
| Calidad | `npx expo lint`, `npx tsc --noEmit`. |

## 2. Árbol de rutas

```
src/app/
├── _layout.tsx                  Stack raíz · Provider · Stack.Protected · anchor "(tabs)"
├── (tabs)/
│   ├── _layout.tsx              Tabs: "Catálogo" y "Mis reservas" (Ionicons)
│   ├── (catalogo)/
│   │   ├── _layout.tsx          Stack propio de la tab Catálogo (link "Personal" en el header)
│   │   ├── index.tsx            /                 Catálogo
│   │   └── libro/
│   │       └── [isbn].tsx       /libro/[isbn]     Detalle
│   └── reservas.tsx             /reservas         Mis reservas
├── buscar.tsx                   /buscar?q=        Stack raíz
├── escanear.tsx                 /escanear         Stack raíz
├── reservar/
│   └── [isbn].tsx               /reservar/[isbn]  Stack raíz · presentation: "modal"
├── permisos/
│   └── [recurso].tsx            /permisos/camara | /permisos/notificaciones · modal
├── login.tsx                    /login            modal · Protected guard={!sesion}
├── mostrador.tsx                /mostrador        Protected guard={sesion}
├── reserva.tsx                  /reserva          <Redirect href="/reservas" />
└── +not-found.tsx               404 con la URL inexistente
```

### Layout raíz
```tsx
// src/app/_layout.tsx
export const unstable_settings = { anchor: '(tabs)' }; // (SDK 58) `initialRouteName` está deprecado: se usa `anchor`

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <NavegacionRaiz />   {/* src/components: lee `sesion` del Context */}
    </BibliotecaProvider>
  );
}
```
`NavegacionRaiz` (en `src/components/NavegacionRaiz.tsx`) arma el `<Stack>` con:
- `(tabs)` sin header, `buscar`, `escanear`;
- `reservar/[isbn]` y `permisos/[recurso]` con `presentation: 'modal'`;
- `<Stack.Protected guard={!sesion}>` → `login` (modal);
- `<Stack.Protected guard={sesion}>` → `mostrador`.

Así, al iniciar sesión el login deja de existir (se cierra solo) y al cerrarla el mostrador sale del historial.
(SDK 58) `Stack.Protected` también acepta `redirectTo` (por ejemplo, `redirectTo="/login"`). No hace falta usarlo.

Nota: según la documentación, `unstable_settings` no funciona con rutas asíncronas en desarrollo. Hay que probar
el deep link a `/buscar` sin activar `asyncRoutes`.

### Tabs
Se usan las **tabs de JavaScript**, porque aceptan íconos de `@expo/vector-icons` en `tabBarIcon`
(`({ color, size }) => <Ionicons name="book-outline" color={color} size={size} />`).
`book-outline` y `bookmark-outline` llevan `accessibilityLabel` en cada tab.

```tsx
import { Tabs } from 'expo-router/js-tabs'; // (SDK 58) desde SDK 56 las tabs JS vienen dentro de Expo Router
```
La guía de Tabs también muestra `import { Tabs } from 'expo-router'`. Se elige `expo-router/js-tabs` porque es
la ruta explícita que la documentación usa con `Tabs.Protected`. La elección se justifica en el README.
Se descartan las **native tabs** (`expo-router/native-tabs` en SDK 58; `unstable-native-tabs` en SDK 54–57):
usan SF Symbols y Material Symbols, no `@expo/vector-icons`, que es lo que pide el enunciado.

## 3. Estructura de carpetas

```
src/
├── app/            solo rutas (ver arriba)
├── components/     NavegacionRaiz, FilaLibro, ListaRecientes, EstadoCargando, EstadoError,
│                   EstadoVacio, Boton, BotonIcono, TarjetaPrestamo, TarjetaEspera,
│                   PantallaPermiso, IngresoIsbn, LibroNoEncontrado
├── constants/      tema.ts (colores, espacios, tamaños), biblioteca.ts (constantes de negocio),
│                   permisos.ts (textos de beneficio por recurso)
├── context/        BibliotecaContext.tsx (Provider + useBiblioteca)
├── data/           libros.ts (≥ 15), esperasIniciales.ts
├── estructuras/    Pila.ts, Cola.ts
├── hooks/          useLibros.ts, useBusqueda.ts, usePermiso.ts, useLibro.ts
├── lib/            api.ts (dado), isbn.ts, fechas.ts, bibliotecaReducer.ts, notificaciones.ts
└── types/          index.ts (Libro, dado) + tipos propios
```

Dirección de importaciones (nunca hacia arriba):
```
app → components → hooks → context → lib → estructuras / data / types / constants
```

## 4. Modelo de datos

```ts
// src/types/index.ts (Libro se copia tal cual del enunciado)
export type Prestamo = {
  isbn: string;
  persona: string;
  vence: string;                 // ISO
  idNotificacion: string | null;
};

export type Aviso = { id: string; mensaje: string };

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
export type RecursoPermiso = 'camara' | 'notificaciones';
```

### Estado del Context
```ts
type EstadoBiblioteca = {
  prestamos: Prestamo[];                  // de todas las personas
  esperas: Record<string, Cola<string>>;  // isbn → personas en espera
  devueltos: Record<string, number>;      // ejemplares que volvieron al estante por el mostrador
  recientes: Pila<string>;                // ISBN
  sesion: boolean;
  avisos: Aviso[];
};
```

### Datos derivados (se calculan, no se guardan)
| Dato | Cálculo |
|---|---|
| Ejemplares disponibles | `libro.ejemplares + devueltos[isbn] − prestamos.filter(isbn).length` |
| Personas en espera | `esperas[isbn]?.tamanio ?? 0` |
| Mi posición | `esperas[isbn].aArray().indexOf(USUARIO_ACTUAL) + 1` |
| Mis préstamos | `prestamos.filter(p => p.persona === USUARIO_ACTUAL)` |
| Recientes visibles | `recientes.aArray()` invertido, primeros 3, mapeados a `Libro` |

### Constantes (`src/constants/biblioteca.ts`)
`USUARIO_ACTUAL`, `CREDENCIALES` (usuario y clave fijos), `DIAS_PRESTAMO = 7`,
`SEGUNDOS_RECORDATORIO = 15`, `CANAL_PRESTAMOS = 'prestamos'`, `CANTIDAD_RECIENTES = 3`, `LARGO_ISBN = 13`.

## 5. Estructuras

```ts
// src/estructuras/Pila.ts
export class Pila<T> {
  #items: T[];
  constructor(items: T[] = []) { this.#items = [...items]; }
  apilar(x: T): void
  desapilar(): T | undefined
  tope(): T | undefined
  get tamanio(): number
  aArray(): T[]          // copia, de base a tope
  clonar(): Pila<T>
}

// src/estructuras/Cola.ts — sin shift(): índice de inicio
export class Cola<T> {
  #items: T[]; #inicio = 0;
  encolar(x: T): void
  desencolar(): T | undefined   // undefined si está vacía
  frente(): T | undefined
  get tamanio(): number
  aArray(): T[]
  clonar(): Cola<T>
}
```

**Regla de inmutabilidad (B3):** el reducer nunca muta la instancia guardada en el estado:
`const nueva = estado.esperas[isbn].clonar(); nueva.encolar(persona); return { ...estado, esperas: { ...estado.esperas, [isbn]: nueva } };`

## 6. Context y reducer

`src/lib/bibliotecaReducer.ts` — función pura, sin efectos:

| Acción | Efecto en el estado |
|---|---|
| `VER_LIBRO(isbn)` | Apila en `recientes` si el tope es distinto. |
| `PRESTAR(isbn, persona, vence)` | Agrega préstamo. |
| `ENCOLAR(isbn, persona)` | Clona la Cola y encola. |
| `DEVOLVER(isbn, persona)` | Quita el préstamo. |
| `ENTREGAR_SIGUIENTE(isbn, vence)` | Clona la Cola, desencola, `devueltos[isbn] + 1`, crea préstamo para quien estaba al frente. |
| `GUARDAR_ID_NOTIFICACION(isbn, id \| null)` | Actualiza el préstamo. |
| `AGREGAR_AVISO` / `DESCARTAR_AVISO` | Lista de avisos. |
| `INICIAR_SESION` / `CERRAR_SESION` | `sesion`. |

`src/context/BibliotecaContext.tsx` expone el estado y funciones de alto nivel (`useCallback`) que combinan
reducer + efectos secundarios (programar/cancelar notificaciones). El `value` se memoriza con `useMemo`.

Regla de negocio de reserva (`reservar(isbn)`):
1. Si la persona ya tiene préstamo o está en la Cola → error "Ya reservaste este libro".
2. Si `disponibles > 0` **y** la Cola está vacía → `PRESTAR` con vence = hoy + 7 días.
3. Si no → `ENCOLAR` y devolver la posición.

## 7. Hooks

### `useLibros()` → `{ libros, cargando, error, reintentar }`
- `intento` (número) en el estado; `reintentar = () => setIntento(n => n + 1)`.
- Efecto con dependencia `[intento]`: función async interna, bandera `cancelado` en la limpieza.
- El error se traduce a un mensaje en español; nunca se muestra `error.message`.

### `useBusqueda(q)` → `{ resultados, cargando, error }`
- Efecto con dependencia `[q]` y bandera `cancelado`: si llega la respuesta de una búsqueda vieja, se descarta.
- Opcional (OPC-03): `setTimeout` de 300 ms con `clearTimeout` en la limpieza.

### `usePermiso(recurso)` → `{ estado, pedir, abrirAjustes }`
- Cámara: `useCameraPermissions()` (exigido por el enunciado).
- Notificaciones: `Notifications.getPermissionsAsync()` / `requestPermissionsAsync()`.
- Ambos se llaman siempre (sin hooks condicionales); se devuelve el del `recurso` pedido.
- Mapeo: `null → cargando`, `granted → concedido`, `!granted && canAskAgain → preguntable`, resto → `bloqueado`.
- Se vuelve a consultar con un listener de `AppState` (`'active'`) para enterarse al volver de Ajustes
  (limpieza: `subscription.remove()`), y con `useFocusEffect` en `/reservas`.
- `abrirAjustes = () => Linking.openSettings()`.

## 8. Pantallas clave

### `/escanear`
- Sin permiso concedido → `router.push('/permisos/camara')` o muestra `PantallaPermiso`; siempre visible `IngresoIsbn`.
- `<CameraView barcodeScannerSettings={{ barcodeTypes: ['ean13'] }} onBarcodeScanned={...} />`.
- **Navegación única:** `useRef<boolean>(false)` como cerrojo (un `useState` no frena los llamados que ya están
  en la cola del mismo ciclo). Si existe → `router.replace('/libro/' + isbn)`.
- **Aviso único:** `useRef<string | null>` con el último ISBN desconocido; mensaje en pantalla (no `Alert` repetido).

### `/permisos/[recurso]`
- Valida `recurso` (`camara` | `notificaciones`); si no, mensaje + salida.
- Texto del beneficio desde `src/constants/permisos.ts`.
- `preguntable` → "Continuar" (pide y vuelve); `bloqueado` → "Abrir Ajustes"; `concedido` → vuelve.

### `/reservar/[isbn]` (modal)
- Muestra préstamo o lista de espera con posición. Al confirmar: `router.dismissAll()` + `router.replace('/reservas')`
  (o la combinación que deje "atrás" sin volver a la confirmación). Hay que probar con el botón atrás de Android
  (pregunta C1 del TP).

### `/reservas`
- `useFocusEffect` + `usePermiso('notificaciones')` para reflejar el permiso real.
- Interruptor "Recordarme":
  - ON → si no `concedido`, `router.push('/permisos/notificaciones')`; si `concedido`, `programarRecordatorio()`.
  - OFF → `cancelarRecordatorio(id)`.

### `/mostrador`
- `FlatList` de libros con Cola no vacía; botón deshabilitado si está vacía.
- Si el desencolado es `USUARIO_ACTUAL`: consulta el permiso **en ese momento** (`getPermissionsAsync`):
  concedido → notificación inmediata; no → `AGREGAR_AVISO`.

## 9. Notificaciones (`src/lib/notificaciones.ts`)

```ts
// Una vez, a nivel de módulo (importado desde el layout raíz). (SDK 58) shouldShowAlert está deprecado.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Android: el canal se crea ANTES de pedir el permiso
// (en Android 13+ el diálogo no aparece hasta que exista al menos un canal).
asegurarCanal(): Promise<void>
//   → Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
//       name: 'Préstamos', importance: Notifications.AndroidImportance.DEFAULT })

programarRecordatorio(libro): Promise<string>  // devuelve el id
//   → Notifications.scheduleNotificationAsync({
//       content: { title, body },
//       trigger: {
//         type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
//         seconds: SEGUNDOS_RECORDATORIO,
//         channelId: CANAL_PRESTAMOS,
//       },
//     })

cancelarRecordatorio(id): Promise<void>        // → Notifications.cancelScheduledNotificationAsync(id)
notificarDisponible(libro): Promise<void>      // → scheduleNotificationAsync({ content, trigger: null }) (inmediata)
```
- Permisos: `getPermissionsAsync()` y `requestPermissionsAsync()` devuelven `status`, `granted`, `canAskAgain`.
  `expo-notifications` **no** trae un hook de permisos, por eso lo cubre `usePermiso`.
- Expo Go: las notificaciones **locales** funcionan. Las push remotas no están disponibles en Android desde el SDK 53,
  pero esta app no las usa.

## 10. `app.json`

```jsonc
{
  "expo": {
    "scheme": "bibliotecaipf",
    "experiments": { "typedRoutes": true },
    "plugins": [
      "expo-router",
      ["expo-camera", {
        "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrirlo sin escribir el ISBN.",
        "microphonePermission": false,
        "recordAudioAndroid": false
      }],
      "expo-notifications"
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```
Confirmado en la documentación del SDK 58:
- `expo-camera`: `cameraPermission` y `microphonePermission` son solo de iOS. `recordAudioAndroid` es solo de Android
  y vale `true` por defecto, por eso hay que ponerlo en `false` explícitamente. El escaneo de códigos viene
  habilitado (`barcodeScannerEnabled: true` por defecto).
- `android.blockedPermissions` usa el nombre completo del permiso y lo quita del `AndroidManifest.xml` final con
  `tools:node="remove"`. **No tiene efecto en Expo Go**: solo se nota en un build (pregunta D3c).
- Origen de la lista, revisado en `node_modules` del SDK 58:
  - `@expo/config-plugins` (`withAndroidBaseMods.js`) agrega por defecto `SYSTEM_ALERT_WINDOW`,
    `READ_EXTERNAL_STORAGE` y `WRITE_EXTERNAL_STORAGE`, marcados como opcionales. La app no los usa.
  - `RECORD_AUDIO` ya no lo agrega `expo-camera` (`recordAudioAndroid: false`). Se bloquea por si otra dependencia lo agrega.
  - Se mantienen `INTERNET` y `VIBRATE`, que no son peligrosos y los usa Expo/notificaciones; `CAMERA` (expo-camera);
    `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED` (expo-notifications).

### Cámara (`/escanear`)
```tsx
const [permiso, pedirPermiso] = useCameraPermissions(); // permiso: PermissionResponse | null (null = cargando)

<CameraView
  style={estilos.camara}
  barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
  onBarcodeScanned={alLeerCodigo}  // (resultado: BarcodeScanningResult) => void
/>
```

## 11. Tema (`src/constants/tema.ts`)

`colores` (claro/oscuro si se hace OPC-04), `espacios` (xs…xl), `tamanios` (texto, ícono, `areaTactil: 44`),
`radios`. Ningún archivo escribe un color o número de estilo literal.

## 12. Trazabilidad

| Requisito | Archivos principales |
|---|---|
| RF-01 | `hooks/useLibros.ts`, `app/(tabs)/(catalogo)/index.tsx` |
| RF-02 | `estructuras/Pila.ts`, `lib/bibliotecaReducer.ts`, `components/ListaRecientes.tsx` |
| RF-03 | `hooks/useBusqueda.ts`, `app/buscar.tsx` |
| RF-04 | `lib/isbn.ts`, `app/(tabs)/(catalogo)/libro/[isbn].tsx` |
| RF-05 | `estructuras/Cola.ts`, `context/BibliotecaContext.tsx`, `app/reservar/[isbn].tsx` |
| RF-06 | `hooks/usePermiso.ts`, `app/escanear.tsx`, `app/permisos/[recurso].tsx` |
| RF-07 | `lib/notificaciones.ts`, `app/(tabs)/reservas.tsx` |
| RF-08 | `components/NavegacionRaiz.tsx`, `app/login.tsx`, `app/mostrador.tsx` |
| RF-09 | `components/IngresoIsbn.tsx`, avisos del Context |
| RF-10 | `app/reserva.tsx`, `app/+not-found.tsx` |
