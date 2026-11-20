# Especificación funcional — Biblioteca IPF

## 1. Contexto y objetivo

La biblioteca del Instituto necesita una app para que los alumnos **consulten el catálogo**, **reserven libros**
y reciban un **recordatorio** antes de devolverlos, y para que el personal **entregue los libros respetando el orden
de las reservas**. La app usa la cámara (código de barras) y notificaciones locales, y **no pide ningún otro permiso**.

### Actores
| Actor | Qué hace |
|---|---|
| **Alumno/a** (usuaria de la app) | Consulta, busca, escanea, reserva, devuelve y activa recordatorios. |
| **Personal de biblioteca** | Inicia sesión con credenciales fijas y entrega libros desde el mostrador. |
| **Sistema operativo** | Muestra los diálogos de permisos y entrega notificaciones locales. |

### Glosario
| Término | Definición |
|---|---|
| **Préstamo** | Libro que una persona tiene en su poder; vence a los 7 días. |
| **Reserva en espera** | Lugar en la lista de espera (Cola) de un libro sin ejemplares. |
| **Ejemplares disponibles** | `ejemplares iniciales − préstamos activos + ejemplares que volvieron al estante`. Se **calcula**, no se guarda. |
| **Vistos recientemente** | Pila de ISBN de los detalles abiertos; se muestran los 3 del tope. |
| **Estado de permiso** | `cargando` → `concedido` / `preguntable` / `bloqueado`. |

### Fuera de alcance
Backend real, cuentas de alumnos, varios usuarios en el mismo dispositivo, ubicación, galería, micrófono.

---

## 2. Historias de usuario y criterios de aceptación

Formato: **Dado** (contexto) · **Cuando** (acción) · **Entonces** (resultado observable).

### HU-01 · Consultar el catálogo — `/`
> Como alumno/a quiero ver todos los libros para saber cuáles están disponibles.

- **CA-01.1** Dado que abro la app, cuando la API todavía no respondió, entonces veo un indicador de carga.
- **CA-01.2** Dado que la API responde, entonces veo la lista de libros con título, autor y disponibilidad.
- **CA-01.3** Dado que la API falla, entonces veo un mensaje en español y un botón **"Reintentar"** que vuelve a pedir los datos.
- **CA-01.4** Dado que la API devuelve una lista vacía, entonces veo un mensaje de catálogo vacío.
- **CA-01.5** Arriba de la lista veo **"Vistos recientemente"** (hasta 3, del más reciente al más antiguo) y accesos a **"Buscar"** y **"Escanear"**.
- **CA-01.6** En el header hay un link **"Personal"** (lleva a `/login` sin sesión o a `/mostrador` con sesión).
- **CA-01.7** Si salgo del Catálogo antes de que llegue la respuesta, la respuesta no actualiza estado (sin efectos colgados).

### HU-02 · Ver el detalle de un libro — `/libro/[isbn]`
> Como alumno/a quiero ver los datos de un libro para decidir si lo reservo.

- **CA-02.1** Dado un ISBN de 13 dígitos que existe, veo título, autor, año, ejemplares disponibles, cantidad de personas en espera y botón **"Reservar"**. El título del header es el del libro.
- **CA-02.2** Dado un ISBN que no tiene 13 dígitos o no existe, veo un mensaje claro y un link al Catálogo.
- **CA-02.3** Al abrir un detalle válido, su ISBN se apila en "Vistos recientemente". Si ya estaba en el tope, **no** se apila de nuevo.
- **CA-02.4** La pantalla está dentro del Stack de la tab Catálogo (las pestañas siguen visibles).

### HU-03 · Buscar libros — `/buscar?q=`
> Como alumno/a quiero buscar por título o autor para encontrar un libro rápido.

- **CA-03.1** El texto buscado vive en la URL (`q`). Si abro `/buscar?q=borges`, el campo aparece con "borges" y se ve el resultado.
- **CA-03.2** Escribir actualiza `q` con `router.setParams` (no se apilan pantallas: "atrás" sale del buscador).
- **CA-03.3** Solo se muestran los resultados de la **última** búsqueda, aunque las respuestas lleguen desordenadas.
- **CA-03.4** Hay estados de cargando, sin resultados y error.
- **CA-03.5** Un deep link a `/buscar` deja las pestañas debajo en la pila (al ir atrás se ve el Catálogo).

### HU-04 · Escanear un libro — `/permisos/camara` → `/escanear`
> Como alumno/a quiero escanear el código de barras para abrir el libro sin escribir el ISBN.

- **CA-04.1** Si el permiso no fue concedido, antes del diálogo del sistema veo `/permisos/camara`: el beneficio en una frase y un único botón **"Continuar"** (o **"Abrir Ajustes"** si está bloqueado).
- **CA-04.2** La pantalla maneja los cuatro estados: `cargando`, `concedido`, `preguntable`, `bloqueado` (hook `usePermiso`).
- **CA-04.3** Al leer un EAN-13 que existe, navega **una sola vez** al detalle, aunque el código siga frente a la cámara.
- **CA-04.4** Si el ISBN leído no está en el catálogo, avisa **una vez** (no diez seguidas) y deja seguir escaneando.
- **CA-04.5** Siempre puedo escribir el ISBN a mano, con o sin permiso.
- **CA-04.6** Si vuelvo de Ajustes con el permiso habilitado, la pantalla se actualiza sola.

### HU-05 · Reservar un libro — `/reservar/[isbn]` (modal)
> Como alumno/a quiero reservar un libro para llevármelo o quedar en la lista de espera.

- **CA-05.1** Si hay ejemplares disponibles **y nadie esperando**, la confirmación dice que es un préstamo por 7 días; al confirmar se crea con fecha de devolución = hoy + 7 días.
- **CA-05.2** Si no hay ejemplares (o ya hay gente esperando), la confirmación dice que entro a la lista de espera y en qué posición; al confirmar se me **encola** en la Cola del libro.
- **CA-05.3** No puedo reservar dos veces el mismo libro (ni con préstamo activo ni estando en espera): veo un mensaje.
- **CA-05.4** Al confirmar, la app va a `/reservas` y "atrás" **no** vuelve a la confirmación.
- **CA-05.5** Si el ISBN del modal no es válido, veo un mensaje y una salida.

### HU-06 · Ver mis reservas — `/reservas`
> Como alumno/a quiero ver mis préstamos y reservas en espera.

- **CA-06.1** Veo mis préstamos con fecha de devolución, interruptor **"Recordarme"** y botón **"Devolver"**.
- **CA-06.2** Veo mis reservas en espera con mi posición actual.
- **CA-06.3** Veo los avisos dentro de la app (por ejemplo, "Tu libro ya está disponible" cuando no hay permiso de notificaciones).
- **CA-06.4** Cada sección tiene su estado vacío.

### HU-07 · Recordatorio de devolución
> Como alumno/a quiero un recordatorio para no olvidarme de devolver.

- **CA-07.1** El permiso de notificaciones se pide **únicamente** al activar "Recordarme", pasando antes por `/permisos/notificaciones`.
- **CA-07.2** En Android, el canal `"prestamos"` se crea **antes** de pedir el permiso.
- **CA-07.3** Con permiso concedido se programa una notificación local a los **15 segundos** (modo demostración) y se guarda su identificador en el préstamo.
- **CA-07.4** Al desactivar el interruptor o devolver el libro, la notificación programada se cancela.
- **CA-07.5** Si el permiso se deniega, el interruptor queda apagado y veo un aviso dentro de la app; la app sigue funcionando.
- **CA-07.6** La pestaña refleja el estado real del permiso al volver de Ajustes y al volver a la pestaña.

### HU-08 · Devolver un libro
- **CA-08.1** Al tocar "Devolver" el préstamo desaparece, su recordatorio se cancela y el ejemplar vuelve al estante (+1 disponible).

### HU-09 · Ingresar como personal — `/login` (modal)
> Como personal quiero ingresar para usar el mostrador.

- **CA-09.1** `/login` solo existe **sin sesión**; `/mostrador` solo existe **con sesión** (`Stack.Protected` en el layout raíz).
- **CA-09.2** Usuario y clave correctos (fijos en el código) inician sesión; el login se cierra solo y se ve el mostrador.
- **CA-09.3** Credenciales incorrectas muestran un mensaje y no inician sesión.
- **CA-09.4** Un deep link a `/mostrador` sin sesión no muestra el mostrador.

### HU-10 · Entregar al siguiente — `/mostrador`
> Como personal quiero entregar libros respetando el orden de las reservas.

- **CA-10.1** Veo los libros con lista de espera: quién está al frente y cuántos esperan.
- **CA-10.2** "Entregar al siguiente" **desencola** a la persona del frente y le crea un préstamo (simula que se devolvió un ejemplar).
- **CA-10.3** Si esa persona es la usuaria de la app: recibe una notificación si el permiso está concedido **en ese momento**, o un aviso en `/reservas` si no.
- **CA-10.4** Con la lista vacía el botón no se puede usar (no rompe).
- **CA-10.5** "Cerrar sesión" termina la sesión y el mostrador desaparece del historial.

### HU-11 · Rutas especiales
- **CA-11.1** `/reserva` (URL vieja) redirige a `/reservas` con `<Redirect>`.
- **CA-11.2** Cualquier otra URL muestra una pantalla 404 con la URL inexistente y un link al Catálogo (`+not-found.tsx`).

---

## 3. Requisitos funcionales

| ID | Requisito | HU |
|---|---|---|
| RF-01 | `useLibros()` en `src/hooks/useLibros.ts` usa `obtenerLibros()` y devuelve `{ libros, cargando, error, reintentar }`, con limpieza del efecto. | 01 |
| RF-02 | Pila de recientes: `push` al abrir un detalle válido, sin duplicar el tope; el Catálogo muestra los 3 del tope. | 01, 02 |
| RF-03 | Buscador: lee `q` con `useLocalSearchParams`, escribe con `router.setParams`, llama `buscarLibros(q)` y descarta respuestas viejas. | 03 |
| RF-04 | Detalle valida 13 dígitos y existencia del ISBN. | 02 |
| RF-05 | Cada libro tiene su lista de espera con la clase `Cola` (sin `shift()`). Reservar = préstamo de 7 días o encolar mostrando posición. Sin reservas duplicadas. | 05 |
| RF-06 | Escáner con pantalla previa, cuatro estados (`usePermiso`), navegación única, aviso único de ISBN desconocido e ingreso manual. | 04 |
| RF-07 | Recordatorio: permiso pedido solo al activar, canal Android `"prestamos"` previo, notificación a 15 s, id guardado, cancelación al desactivar/devolver. | 07, 08 |
| RF-08 | `/login` y `/mostrador` protegidos con `Stack.Protected` en el layout raíz. Entregar desencola y notifica o avisa. | 09, 10 |
| RF-09 | Ningún permiso denegado bloquea la app (alternativas manuales e in-app). | 04, 07 |
| RF-10 | Rutas exactas de la tabla A1, `<Redirect>` en `/reserva` y 404. | 11 |

## 4. Requisitos de datos

- **RD-01** `src/data/libros.ts` exporta `LIBROS` con **al menos 15** libros.
- **RD-02** Incluye **dos libros físicos reales** con su ISBN-13 real para probar el escáner.
- **RD-03** Algunos libros con `ejemplares: 0`; al menos **dos** de ellos con lista de espera inicial de 1 o 2 personas.
- **RD-04** `src/types/index.ts` y `src/lib/api.ts` se copian **tal cual** del enunciado.

## 5. Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-01 | Proyecto creado con `npx create-expo-app@latest` sobre la **última versión del SDK de Expo**, TypeScript, Expo Router. Número de versión anotado en el README. |
| RNF-02 | `app.json`: `"scheme": "bibliotecaipf"`, plugins de cada módulo con texto "Usamos tu [dato] para [beneficio concreto]", `microphonePermission: false`, `recordAudioAndroid: false`, `blockedPermissions` justificados. |
| RNF-03 | Tabs con íconos de `@expo/vector-icons`; `anchor` hacia `(tabs)`. |
| RNF-04 | `Pila` y `Cola` en `src/estructuras/` con campos privados (`#items`), getter `tamanio` y método `aArray()`. |
| RNF-05 | Préstamos, listas de espera, recientes y sesión en un Context con provider en el layout raíz. |
| RNF-06 | Probado en Expo Go en un teléfono real. |
| RNF-07 | Todas las buenas prácticas de la [constitución](00-constitucion.md). |

## 6. Casos borde

| Situación | Comportamiento esperado |
|---|---|
| `obtenerLibros()` falla | Mensaje + "Reintentar". |
| `/libro/abc` o `/libro/123` | "No encontramos ese libro" + link al Catálogo. |
| Respuestas del buscador desordenadas | Solo la última búsqueda se ve. |
| Código frente a la cámara varios segundos | Una sola navegación. |
| ISBN escaneado inexistente | Un aviso, se sigue escaneando. |
| Cámara bloqueada | "Abrir Ajustes" + ingreso manual. |
| Notificaciones denegadas | Interruptor apagado + aviso in-app. |
| Devolver antes de los 15 s | Notificación cancelada, no llega. |
| Reservar un libro ya reservado | Mensaje, no se duplica. |
| Hay ejemplares pero gente esperando | Entra a la lista de espera (se respeta el orden). |
| Entregar con lista vacía | Botón deshabilitado. |
| Login incorrecto | Mensaje, sin sesión. |
| `/mostrador` sin sesión | No se muestra el mostrador. |
| URL inexistente | 404 con la URL. |

## 7. Desafíos opcionales (extra)

| ID | Desafío |
|---|---|
| OPC-01 | Persistencia con `@react-native-async-storage/async-storage` (préstamos, recientes, ids de notificación) sin mostrar la app "vacía" al iniciar. |
| OPC-02 | Tests de `Pila` y `Cola` con `jest-expo` (≥ 6 casos, incluido desencolar una cola vacía). |
| OPC-03 | Debounce de 300 ms en el buscador con limpieza del temporizador. |
| OPC-04 | Modo oscuro con `useColorScheme` y los colores de `tema.ts`. |
| OPC-05 | Development build con captura del diálogo de cámara mostrando el texto de propósito. |
