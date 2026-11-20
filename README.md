# Biblioteca IPF

App de la biblioteca del Instituto Politécnico Formosa. Con ella los alumnos consultan el catálogo, reservan libros
y reciben un recordatorio antes de devolverlos. El personal entrega los libros respetando el orden de las reservas.

Es el Trabajo Práctico N° 4 del Taller Complementario React Native II. Se desarrolló con
**Spec-Driven Development**: la especificación, el plan técnico y las tareas están en [`specs/`](specs/README.md).

## Versión

| Pieza | Versión |
|---|---|
| Expo SDK | **58** (`expo ~58.0.26`, la última disponible al crear el proyecto) |
| React Native | 0.88.1 |
| React | 19.3.0 |
| Expo Router | ~58.0.32 |
| TypeScript | ~6.0.3 |

## Cómo ejecutarla

```bash
npm install
npx expo start
```

Escaneá el QR con **Expo Go** (Android) o con la cámara (iOS). El teléfono y la computadora tienen que estar en la misma red.

**Credenciales del personal** (fijas, modo demostración): usuario `biblioteca`, clave `ipf2026`
(ver [`src/constants/biblioteca.ts`](src/constants/biblioteca.ts)).

## Rutas y navegadores

```
src/app/
├── _layout.tsx                  Stack raíz · BibliotecaProvider · Stack.Protected · anchor "(tabs)"
├── (tabs)/
│   ├── _layout.tsx              Tabs (expo-router/js-tabs): "Catálogo" y "Mis reservas"
│   ├── (catalogo)/
│   │   ├── _layout.tsx          Stack propio de la tab Catálogo (link "Personal" en el header)
│   │   ├── index.tsx            /                  Catálogo
│   │   └── libro/[isbn].tsx     /libro/[isbn]      Detalle del libro
│   └── reservas.tsx             /reservas          Mis reservas
├── buscar.tsx                   /buscar?q=         Stack raíz
├── escanear.tsx                 /escanear          Stack raíz
├── reservar/[isbn].tsx          /reservar/[isbn]   Stack raíz · modal
├── permisos/[recurso].tsx       /permisos/camara · /permisos/notificaciones · modal
├── login.tsx                    /login             modal · solo sin sesión (Stack.Protected)
├── mostrador.tsx                /mostrador         solo con sesión (Stack.Protected)
├── reserva.tsx                  /reserva           <Redirect href="/reservas" />
└── +not-found.tsx               404 con la URL inexistente
```

| Layout | Navegador | Qué decide |
|---|---|---|
| `src/app/_layout.tsx` | Stack raíz (en `src/components/NavegacionRaiz.tsx`) | Modales, rutas protegidas por sesión y `anchor: '(tabs)'`, para que un deep link a `/buscar` deje las pestañas debajo. |
| `src/app/(tabs)/_layout.tsx` | Tabs de JavaScript | Dos pestañas con íconos de `@expo/vector-icons` (Ionicons). |
| `src/app/(tabs)/(catalogo)/_layout.tsx` | Stack | El detalle se abre dentro de la pestaña Catálogo, con las pestañas visibles. |

> **Import de Tabs:** en el SDK 58, `import { Tabs } from 'expo-router'` está deprecado. Se usa
> `import { Tabs } from 'expo-router/js-tabs'`. Las *native tabs* (`expo-router/native-tabs`) se descartaron
> porque usan SF Symbols y Material Symbols en lugar de `@expo/vector-icons`.

## Estructura

```
src/
├── app/          solo rutas
├── components/   un componente por archivo
├── constants/    tema.ts (colores, espacios, tamaños), biblioteca.ts, permisos.ts
├── context/      BibliotecaContext.tsx (provider en el layout raíz)
├── data/         libros.ts (16 libros), esperasIniciales.ts
├── estructuras/  Pila.ts, Cola.ts (#items, tamanio, aArray, clonar)
├── hooks/        useLibros, useBusqueda, usePermiso
├── lib/          api.ts (dado), reducer, consultas derivadas, ISBN, fechas, notificaciones, permisos
└── types/        index.ts
```

## Configuración de `app.json`

```jsonc
{
  "expo": {
    // Esquema de los deep links: bibliotecaipf://...
    "scheme": "bibliotecaipf",
    "android": {
      // Permisos que se quitan del AndroidManifest final (no tiene efecto en Expo Go).
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      // Rutas basadas en archivos.
      "expo-router",
      // Pantalla de carga.
      ["expo-splash-screen", { "backgroundColor": "#208AEF", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],
      ["expo-camera", {
        // Texto del diálogo de iOS: "Usamos tu [dato] para [beneficio concreto]".
        "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.",
        // La app no graba video: no se pide micrófono en iOS...
        "microphonePermission": false,
        // ...ni RECORD_AUDIO en Android (por defecto expo-camera lo agrega).
        "recordAudioAndroid": false
      }],
      // Notificaciones locales: agrega POST_NOTIFICATIONS en Android 13+.
      "expo-notifications"
    ],
    // Rutas tipadas: router.push y Link solo aceptan URLs que existen.
    "experiments": { "typedRoutes": true }
  }
}
```

### Permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se niega |
|---|---|---|---|
| Cámara | `expo-camera` (`useCameraPermissions` dentro de `usePermiso`) | Al entrar a **Escanear**, después de la pantalla previa `/permisos/camara` | Escribir el ISBN a mano (siempre visible en `/escanear`) |
| Notificaciones | `expo-notifications` | Solo al activar **"Recordarme"** en un préstamo, después de `/permisos/notificaciones` | Los avisos aparecen dentro de la app, en **Mis reservas** |

### Por qué se bloquea cada permiso

| Permiso | Quién lo agrega | Por qué se bloquea |
|---|---|---|
| `RECORD_AUDIO` | `expo-camera` si `recordAudioAndroid` es `true` | La app solo lee códigos de barras, no graba video con audio. Ya está desactivado en el plugin; se bloquea además por si otra dependencia lo agrega. |
| `SYSTEM_ALERT_WINDOW` | Plantilla base de Expo (`@expo/config-plugins`, marcado como opcional) | La app no dibuja sobre otras apps. |
| `READ_EXTERNAL_STORAGE` | Plantilla base de Expo (opcional) | La app no lee archivos del teléfono. |
| `WRITE_EXTERNAL_STORAGE` | Plantilla base de Expo (opcional) | La app no guarda archivos. |

Se mantienen `CAMERA` (escáner), `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED` (expo-notifications),
`INTERNET` y `VIBRATE`. Estos dos últimos son permisos normales: no muestran diálogo.

## Deep links de prueba

En Expo Go el esquema `bibliotecaipf://` se reemplaza por `exp://IP:8081/--/`. Por ejemplo:

```bash
npx uri-scheme open "exp://192.168.0.10:8081/--/buscar?q=borges" --android
```

| Link | Qué se espera |
|---|---|
| `bibliotecaipf://libro/9789500420211` | Detalle de *Ficciones* dentro de la pestaña Catálogo |
| `bibliotecaipf://libro/123` | "No encontramos ese libro" con link al Catálogo |
| `bibliotecaipf://buscar?q=borges` | Buscador con "borges" y las pestañas debajo en la pila |
| `bibliotecaipf://mostrador` | Sin sesión: no se muestra el mostrador |
| `bibliotecaipf://reserva` | Redirige a Mis reservas |
| `bibliotecaipf://escanear` | Pantalla previa o, si la cámara está bloqueada, "Abrir Ajustes" + ISBN a mano |
| `bibliotecaipf://cualquier-cosa` | Pantalla 404 con la URL |

## Datos de prueba

- **16 libros** en [`src/data/libros.ts`](src/data/libros.ts). Los dos primeros (*Clean Code* y
  *Cien años de soledad*) son los que se usan para probar el escáner: **reemplazalos por dos libros que tengas a mano**,
  con el ISBN-13 de su contratapa.
- Sin ejemplares: *El Aleph*, *Sobre héroes y tumbas*, *The Pragmatic Programmer* y *Fundamentos de bases de datos*.
  Los tres primeros tienen lista de espera inicial ([`src/data/esperasIniciales.ts`](src/data/esperasIniciales.ts)).
- El recordatorio de devolución llega a los **15 segundos** (modo demostración).

## Calidad

```
$ npx expo lint
(sin errores ni advertencias)

$ npx tsc --noEmit
(sin errores)

$ npx expo-doctor
20/20 checks passed. No issues detected!
```

## Decisiones técnicas

- **Estado global:** un solo Context con `useReducer`. El reducer es una función pura y clona la `Pila` o la `Cola`
  antes de modificarlas, así React recibe una referencia nueva y vuelve a renderizar.
- **Datos derivados:** los ejemplares disponibles no se guardan, se calculan:
  `ejemplares + devueltos en el mostrador − préstamos activos` ([`src/lib/consultas.ts`](src/lib/consultas.ts)).
- **Orden de las reservas:** si un libro tiene gente esperando, quien reserva entra a la lista aunque haya
  ejemplares en el estante.
- **React Compiler desactivado:** la plantilla lo traía activado. Se quitó para que la memorización (`useMemo`,
  `useCallback`) y los renders sean explícitos, que es lo que analiza el TP.
