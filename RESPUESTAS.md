# Respuestas — TP 4 · Biblioteca IPF

Las referencias son a archivos del repositorio con el formato `archivo:línea`.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

**a) Render por render** (`src/hooks/useLibros.ts`)

Caso exitoso:

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | Montaje del Catálogo. Después del commit corre el efecto (`useLibros.ts:22`) y llama a `obtenerLibros()`. |
| 2 | 16 libros | `false` | `null` | A los ~800 ms llega la respuesta: `setLibros(datos)` (l. 29) y, en el `finally`, `setCargando(false)` (l. 37). Las dos llamadas ocurren en el mismo tick después del `await`, así que React las agrupa en **un solo** render. |

Son 2 renders. En desarrollo pueden verse más si el Modo Estricto vuelve a ejecutar los renders.

Cuando falla y la persona toca "Reintentar":

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | Montaje. |
| 2 | `[]` | `false` | mensaje | `obtenerLibros()` lanza: `setError` (l. 33) y `setCargando(false)` (l. 37), agrupados. Se ve `EstadoError` con "Reintentar" (`index.tsx:31-32`). |
| 3 | `[]` | `true` | `null` | `reintentar()` (l. 51-55): `setCargando(true)`, `setError(null)` y `setIntento(n + 1)`, agrupados en un render. Como cambió `intento`, corre la limpieza del efecto anterior y después el efecto nuevo. |
| 4 | 16 libros | `false` | `null` | Llega la respuesta del segundo pedido. |

**b) ¿Se desmonta el Catálogo?**

En los dos casos no lo hace:

- **Al cambiar a "Mis reservas":** en pestañas mantienen las pantallas que ya se visitaron. EL catalogo queda sin visualizar.
- **Al abrir un detalle:** se apila sobre el Catálogo dentro del Stack de la pestaña (`(catalogo)/_layout.tsx`), el catalogo sigue debajo.

Para comprobarlo puse un `console.log('limpieza useLibros')` de prueba en el `return` de `useLibros.ts:46`. En esos dos casos no se imprime. Sí se imprime si:

- Al tocar "Reintentar": cambia `intento` y React limpia el efecto para carga el nuevo.
- Al recargar la app o con Fast Refresh, que desmonta todo.

En uso real, la limpieza sirve para que una respuesta vieja no pise el estado. Por ejemplo: la persona toca "Reintentar" mientras un pedido sigue en vuelo, o la pantalla se desmonta antes de que llegue la respuesta.

**c) ¿Por qué no `async` directo en `useEffect`?**

Una función `async` devuelve una `Promise`. `useEffect` espera que el callback devuelva nada o una función de limpieza. Si devuelve una promesa, React mueestra una advertencia y no limpia. Lo resolví declarando una función `async cargar()` en el efecto y llamándola sin `await` (`useLibros.ts:25-42`). El efecto sigue siendo síncrono y devuelve la limpieza que pone `cancelado = true` (.

**d) ¿Cómo implementé `reintentar`?**

Con el contador `intento` en el estado (`useLibros.ts`) que está en el array de dependencias del efecto. `reintentar` va sumando un contador, al cambiar el efecto se vuelve a ejecutar.

Usé un contador y no otro valor por estas razones:

- **No `cargando` ni `error`:** los modifica el propio efecto. Si fueran dependencias, el efecto se volvería a disparar a sí mismo cada vez que termina un pedido.
- **Un contador solo cambia cuando la persona pide reintentar.**, Al usar el contador incremental permite que `reintentar` tenga dependencias vacías en `useCallback` y no cambie de identidad.

`reintentar` también pone `cargando: true` y `error: null` en el mismo render, para que el indicador de carga aparezca al instante.

### B2. La condición de carrera del buscador

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
|---|---|---|---|
| t = 0 ms | Escribe "bor" → `buscarLibros("bor")` (1.400 ms) | "Buscando…" | "Buscando…" |
| t = 200 ms | Escribe "borges" → `buscarLibros("borges")` (300 ms) | Sigue "Buscando…" (la URL ya dice `q=borges`) | Corre la limpieza del efecto de "bor" (`cancelado = true`) y arranca el pedido nuevo. Sigue "Buscando…". |
| t = 500 ms | Llega la respuesta de "borges" | Resultados de "borges" | Resultados de "borges" |
| t = 1.400 ms | Llega la respuesta de "bor" | **Se reemplazan por los de "bor"** aunque el campo dice "borges" | Se descarta: su `cancelado` es `true`. Siguen los resultados de "borges". |

**a) Qué hace la limpieza.** Cada ejecución del efecto de `useBusqueda` (`src/hooks/useBusqueda.ts:33-54`) crea su propia variable `cancelado`. La limpieza (l. 51-53) la pone en `true`, y los `.then` / `.catch` solo actualizan el estado si sigue en `false` (l. 41, 46).

La limpieza se ejecuta en dos momentos:

- Cuando `consulta` cambia: después del commit del render con la consulta nueva y antes de correr el efecto nuevo.
- Cuando se desmonta la pantalla.

Como segunda protección, el hook solo muestra una respuesta si su `consulta` coincide con la actual (l. 59-64).

**b) La propuesta `if (texto === q)`.** No funciona. El `.then()` es una clausura creada en el render en que se hizo el pedido, así que el `q` que "ve" es el `q` **de ese render**, no el actual. Como `texto` y `q` salen del mismo render, la comparación siempre es verdadera y la respuesta vieja se muestra igual. Para que funcionara habría que comparar contra un valor que siempre tenga el último dato, por ejemplo un `useRef` que se actualiza en cada render. La limpieza del efecto resuelve lo mismo sin esa ref.

**c) URL y botón atrás.** `router.setParams({ q })` (`buscar.tsx:26`) reemplaza el parámetro de la pantalla actual. La URL pasa a `/buscar?q=b`, `/buscar?q=bo`, … pero no se apila nada, y un solo "atrás" vuelve al Catálogo. Con `router.push` cada letra apilaría una pantalla nueva de búsqueda. Para salir habría que tocar "atrás" una vez por letra, y cada pantalla nueva montaría el campo de nuevo, perdiendo el foco y el teclado.

### B3. Mutar o reemplazar

**a)** Muestra **0**. `encolar` modifica el objeto que está guardado en el estado, pero no se llama a ningún `setState`. React no se entera del cambio y no vuelve a renderizar. Por dentro la cola tiene 3 elementos, pero la pantalla sigue mostrando el valor del último render.

**b)** Escribir en el `TextInput` controlado llama a `setState`, y ese render lee `espera.tamanio` del mismo objeto mutado, que ya vale 3. El número "salta" porque el cambio estaba hecho y faltaba un render que lo mostrara.

Un error que aparece "a veces" es peor que uno que aparece siempre:

- Depende de que otro estado, sin relación, provoque un render.
- Al probar puede parecer que funciona.
- Es difícil de reproducir, y se termina buscando la causa en el lugar equivocado (el `TextInput`).

**c) Cómo lo resolví.** El estado vive en un `useReducer` (`BibliotecaContext.tsx:42`). El reducer **nunca muta**: clona la `Cola` o la `Pila` antes de modificarlas y devuelve un estado nuevo.

```ts
// src/lib/bibliotecaReducer.ts:78-82
case 'ENCOLAR': {
  const cola = estado.esperas[accion.isbn]?.clonar() ?? new Cola<string>();
  cola.encolar(accion.persona);
  return { ...estado, esperas: { ...estado.esperas, [accion.isbn]: cola } };
}
```

`clonar()` está en `Cola.ts` y `Pila.ts`.

| Alternativa | Ventaja | Costo |
|---|---|---|
| **Clonar + `useReducer`** (la mía) | Referencias nuevas en cada cambio: React re-renderiza siempre que corresponde, `useMemo` y las dependencias funcionan, y el reducer es puro y fácil de probar. | Copia O(n) por operación. Con listas de 1 a 5 personas no importa. |
| Contador de versión | No copia nada; un `setVersion(v + 1)` fuerza el render. | El objeto sigue siendo el mismo: cualquier `useMemo`/`useEffect` que dependa de la cola no se entera. El Modo Estricto puede ejecutar dos veces el código que muta (doble `encolar`). Es fácil olvidarse de subir la versión. |
| Arrays en el estado (`[...cola, x]`) | Lo más natural para React. | Se pierde la encapsulación de la clase (`#items`): cualquiera puede hacer `shift()` o desordenar la lista. |

---

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en mi app | Por qué ahí y no en otro lugar |
|---|---|---|
| Texto del buscador | **URL** (`q`) + copia en **estado local** del campo (`buscar.tsx:16-20`) | La URL hace que la búsqueda se pueda compartir, que funcione como deep link (`/buscar?q=borges`) y que se mantenga al volver. La copia local existe solo para que el cursor del `TextInput` no salte. No va al Context porque solo le importa a esa pantalla. |
| Préstamos y reservas | **Context** (`estado.prestamos`, `bibliotecaReducer.ts:8`) | Los usan el detalle, el Catálogo (disponibles), "Mis reservas" y el mostrador, que están en navegadores distintos. |
| Listas de espera | **Context** (`estado.esperas`, una `Cola` por ISBN, l. 10) | Las escribe la reserva y las lee y modifica el mostrador. Es estado compartido. |
| Vistos recientemente | **Context** (`estado.recientes`, una `Pila`, l. 14) | Lo escribe el detalle y lo lee el Catálogo. Si fuera estado local del detalle se perdería al salir. |
| Sesión del personal | **Context** (`estado.sesion`, l. 15) | La necesita el layout raíz para `Stack.Protected` (`NavegacionRaiz.tsx:39-45`), que está por encima de todas las pantallas. |
| Ejemplares disponibles | **Se calcula** (`consultas.ts:9-13`) | Sale de `ejemplares + devueltos − préstamos`. Guardarlo sería tener el mismo dato en dos lugares (ver E4 d). |
| Estado del permiso de cámara | **Sistema operativo**; la app lee una copia con `usePermiso` (`usePermiso.ts:26`) | La persona puede cambiarlo en Ajustes en cualquier momento. Por eso se vuelve a consultar al enfocar la pantalla y al volver a primer plano, y no se guarda en el Context. |
| Identificador de la notificación programada | **Context**, dentro de cada préstamo (`Prestamo.idNotificacion`, `types/index.ts:15`) | Pertenece al préstamo: se necesita para cancelarla al devolver, y el interruptor "Recordarme" se deriva de él (`TarjetaPrestamo.tsx:24`). |

**Re-renders del Context.** Cuando cambia el `value` (`BibliotecaContext.tsx:151-178`), se vuelven a renderizar **todos los componentes que llaman a `useBiblioteca()`**. Hoy son el Catálogo, el detalle, buscar, reservar, "Mis reservas", el mostrador, el login, `NavegacionRaiz` y `EnlacePersonal`.

¿El Catálogo se re-renderiza al activar un recordatorio en otra pestaña? **Sí.** Sigue montado y consume el Context entero (`index.tsx:18`). Activar el recordatorio despacha `GUARDAR_ID_NOTIFICACION`, que crea un `estado` nuevo, y con él un `value` nuevo. El Catálogo no usa solo "recientes": también usa `prestamos` para calcular los disponibles. Pero ese cambio en particular no altera nada de lo que muestra.

Cómo se podría evitar:

- Separar el Context en varios, por ejemplo uno de estado y otro de acciones, o uno solo para "recientes".
- Usar selectores, por ejemplo con `use-context-selector`.
- Envolver `FilaLibro` en `React.memo` para que, aunque el Catálogo se renderice, las filas no lo hagan.

**¿Vale la pena acá?** No. Son 16 filas simples y el re-render ocurre en una pantalla que no se está viendo. Dividir el Context agregaría código y más lugares donde equivocarse a cambio de una mejora que no se nota. Lo reconsideraría si el catálogo tuviera cientos de libros o si el Profiler de React DevTools mostrara renders lentos.

---

## Parte C · Navegación y rutas

### C1. La pila en mi app

Notación: Stack raíz = `[ … ]`, Stack de la tab Catálogo = `{ … }`.

| # | Acción | Pilas resultantes |
|---|---|---|
| 1 | Abre la app | Raíz `[(tabs)]` · tab activa Catálogo · Catálogo `{index}` |
| 2 | Toca un libro | Raíz `[(tabs)]` · Catálogo `{index, libro/X}` |
| 3 | Toca "Reservar" | Raíz `[(tabs), reservar/X (modal)]` · Catálogo `{index, libro/X}` |
| 4 | Toca "Confirmar" | Raíz `[(tabs)]` · **tab activa Mis reservas** · Catálogo `{index, libro/X}` (no se tocó) |
| 5 | Atrás (Android) | Raíz `[(tabs)]` · vuelve a la tab Catálogo, que muestra su tope: `{index, libro/X}` → se ve el **detalle** |
| 6 | Toca la tab "Catálogo" | Raíz `[(tabs)]` · Catálogo `{index}` → se ve la **lista** |

**a)** En el paso 4 usé `router.dismissAll()` seguido de `router.navigate('/reservas')` (`reservar/[isbn].tsx:25-29`):

- `dismissAll` cierra el modal y todo lo apilado sobre las pestañas en el Stack raíz.
- `navigate` cambia a la pestaña "Mis reservas" sin apilar.

Las otras opciones:

- **`push('/reservas')`:** dejaría el modal de confirmación debajo, y "atrás" volvería a la confirmación, que podría volver a confirmarse.
- **`replace('/reservas')`:** cambia el modal por la ruta de reservas. Según cómo se resuelva la ruta anidada, puede quedar un `(tabs)` repetido en la raíz o una transición rara de modal.
- **`dismissTo('/reservas')`:** busca `/reservas` en la pila para volver hasta ahí. Como nunca estuvo apilada, se comporta como un `push` después de cerrar.

Elegí `dismissAll` + `navigate` porque deja la pila raíz limpia y garantiza que "atrás" no vuelva a la confirmación (requisito A3.5).

**b)** En el paso 6 se ve la **lista del Catálogo**. Tocar la pestaña que ya está activa hace `popToTop` de su Stack. En el paso 5, en cambio, se ve el detalle, porque cada pestaña conserva su propio Stack. Me parece correcto: es el comportamiento estándar de las apps móviles. La pestaña recuerda dónde quedó y, si querés volver al inicio, la tocás de nuevo.

### C2. El escáner que dispara de más

**a)** `onBarcodeScanned` se llama muchas veces por segundo mientras el código está frente a la cámara. Si cada llamada hiciera `router.push`, cada una encolaría una acción `PUSH` en la cola de acciones de navegación (TP 2). Se procesan en orden, así que se apilarían 5, 10 o más detalles iguales, y la persona tendría que tocar "atrás" esa cantidad de veces.

**b)** Usé **`useRef`** (`escanear.tsx:28`, 48-55). Un `useState` puesto en `true` no alcanza por tres razones:

- `setState` **programa** un render. El valor nuevo se ve recién en el próximo render.
- Las llamadas a `onBarcodeScanned` que llegan antes de ese render leen la clausura vieja, donde sigue en `false`.
- Si el callback está memorizado con `[]`, vería el `false` del primer render para siempre.

Una ref se modifica al instante y todas las llamadas leen el mismo objeto: la segunda ya encuentra `navegando.current === true` y sale.

**c)** Uso `router.replace` (`escanear.tsx:18-21`) para que el escáner desaparezca del historial: "atrás" desde el detalle vuelve al Catálogo. Con `push`, "atrás" volvería al escáner con la cámara prendida. Además, como esa pantalla seguiría montada, `navegando.current` seguiría en `true` y el escáner quedaría "muerto": muestra la cámara pero no reacciona a ningún código.

**d)** Si el ISBN no está en el catálogo, muestra el aviso "El código … no es de ningún libro del catálogo. Probá con otro." y sigue escaneando (`escanear.tsx:58-61`). Para que no aparezca diez veces seguidas, guardo el último ISBN desconocido en otra ref (`ultimoDesconocido`, l. 29): el aviso solo se actualiza si el código leído es distinto del anterior.

### C3. Deep links y rutas protegidas

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte de mi código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9789500420211` | El detalle de *Ficciones*, dentro de la pestaña Catálogo | Raíz `[(tabs)]`, Catálogo `{libro/…}`. El Stack de la tab no tiene `anchor`, así que el `index` no queda debajo: al tocar la pestaña Catálogo se va a la lista. | Árbol de carpetas `(tabs)/(catalogo)/libro/[isbn].tsx` y `libro/[isbn].tsx:16-18` |
| `bibliotecaipf://libro/123` | "No encontramos ese libro" con el link "Volver al Catálogo" | Igual que la anterior | `buscarLibroPorIsbn` valida el formato y la existencia (`isbn.ts:17-21`) → `LibroNoEncontrado` (`libro/[isbn].tsx:26-32`) |
| `bibliotecaipf://buscar?q=borges` | El buscador con "borges" y sus resultados | Raíz `[(tabs), buscar]`: "atrás" vuelve al Catálogo | `unstable_settings.anchor = '(tabs)'` en `_layout.tsx:8-10` y `useLocalSearchParams` en `buscar.tsx:16` |
| `bibliotecaipf://mostrador` (sin sesión) | No ve el mostrador: Expo Router no permite entrar a la pantalla protegida y lleva al anchor (Catálogo) | Raíz `[(tabs)]` | `<Stack.Protected guard={estado.sesion}>` en `NavegacionRaiz.tsx:43-45` |
| `bibliotecaipf://reserva` | "Mis reservas" | Raíz `[(tabs)]` con la pestaña Mis reservas. `/reserva` no queda en la pila porque `<Redirect>` reemplaza. | `reserva.tsx:5` |
| `bibliotecaipf://escanear` (cámara bloqueada) | El panel "Abrir Ajustes" y, debajo, el campo para escribir el ISBN | Raíz `[(tabs), escanear]` | `usePermiso('camara')` → `estadoDePermiso` (`permisos.ts:15`) → `escanear.tsx:97-105` y `111` |

**¿Por qué `/libro/123` llega al detalle?** Expo Router decide la pantalla **solo por la forma de la URL**. `/libro/123` coincide con el segmento dinámico `[isbn]`, y el router no sabe nada de libros ni de ISBN. La responsabilidad de responder bien es de la **pantalla**: tiene que validar el parámetro (13 dígitos) y comprobar que el libro exista. Si no, debe mostrar un mensaje con una salida. Eso lo hacen `isbn.ts:17-21` y `LibroNoEncontrado.tsx`.

### C4. Foco, montaje y primer plano

**a) Qué evento detecta cada uno:**

- **`useEffect(…, [])`:** el montaje del componente (una sola vez) y, en la limpieza, el desmontaje.
- **`useFocusEffect`:** que la pantalla gana el foco **de navegación**, por ejemplo al cambiar de pestaña o al volver con "atrás".
- **`AppState`:** que **la app entera** pasa a primer plano (`active`) o a segundo plano (`background`).

**b) Qué detecta cada caso:**

- **Sale a Ajustes y vuelve:** solo `AppState`. La navegación no cambió, así que no hay evento de foco, y la pantalla ya estaba montada.
- **Va a Catálogo y vuelve a "Mis reservas":** solo `useFocusEffect`. La app nunca salió de primer plano y la pestaña ya estaba montada.

**c)** Uso los tres en `usePermiso.ts` y en las pantallas que lo usan:

- **`useEffect` con `[recurso]`:** la lectura inicial del permiso de notificaciones (`usePermiso.ts:50-63`).
- **`AppState`:** vuelve a consultar al volver de Ajustes (`usePermiso.ts:65-72`).
- **`useFocusEffect`:** vuelve a consultar al volver a la pestaña o pantalla (`reservas.tsx:30-34`, `escanear.tsx:33-37`).

Con uno solo quedaría un estado viejo. Por ejemplo, si solo usara `useFocusEffect`: la persona ve "Las notificaciones están desactivadas", va a Ajustes, las habilita y vuelve. "Mis reservas" seguiría mostrando el aviso, porque no hubo cambio de foco de navegación, hasta que salga de la pestaña y vuelva.

---

## Parte D · Permisos en mi app

### D1. Recorrido completo de la cámara (Android 14, app recién instalada)

| # | Acción | Qué muestra mi app | `status` | `canAskAgain` |
|---|---|---|---|---|
| 1 | Toca "Escanear" por primera vez | Abre `/escanear` (spinner "Preparando la cámara…"). Al resolverse como `preguntable`, apila automáticamente la pantalla previa `/permisos/camara` con el beneficio y el botón "Continuar". | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | Se cierra la pantalla previa y vuelve a `/escanear`, que muestra el panel con "Continuar" y el campo para el ISBN a mano. | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | Al entrar de nuevo vuelve a mostrar la pantalla previa con "Continuar". | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | Android no va a volver a mostrar el diálogo. `/escanear` muestra el panel con **"Abrir Ajustes"** y el campo del ISBN. | `denied` | **`false`** |
| 5 | Toca "Escanear" otra vez | Directamente "Abrir Ajustes" + ISBN a mano. No muestra la pantalla previa porque ya no se puede preguntar. | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita → vuelve | Al volver a primer plano, `usePermiso` vuelve a consultar y aparece la **cámara**. | `granted` | `true` |

**a) iOS.** El resultado cambia en el **paso 2**. En iOS el diálogo del sistema aparece **una sola vez**: después del primer "No permitir", `canAskAgain` ya es `false`. Al volver de la pantalla previa, mi app muestra directamente "Abrir Ajustes" + ISBN a mano. Los pasos 3 a 5 muestran lo mismo, y el 6 es igual que en Android.

**b) La línea que decide.**

```ts
// src/lib/permisos.ts:15
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

Uso `canAskAgain`. `status` no alcanza porque, después de una negativa, vale `denied` tanto cuando el sistema todavía puede preguntar (paso 2 en Android) como cuando ya no (paso 4). Solo `canAskAgain` distingue entre "Continuar" (el diálogo puede aparecer) y "Abrir Ajustes" (tocar "Continuar" no haría nada).

**c)** Se entera el listener de `AppState` de `usePermiso.ts:65-72`: cuando la app vuelve a `active`, llama a `refrescar()`. Si no existiera, la pantalla seguiría mostrando "Abrir Ajustes" aunque el permiso ya esté concedido. La persona tendría que salir de `/escanear` y entrar de nuevo, y pensaría que la app no funciona.

### D2. Notificaciones y consistencia

**a)** `devolver` cancela la notificación con el id guardado en el préstamo (`BibliotecaContext.tsx:66-76`). Si no la cancelara, a los 15 segundos llegaría "Acordate de devolver «…»" de un libro que ya devolvió: el sistema operativo y el estado de la app quedarían inconsistentes, y la persona dejaría de confiar en los recordatorios.

**b) Dónde guardo el id y qué pasa si la app se cierra.** El id se guarda en el Context, dentro del préstamo (`Prestamo.idNotificacion`), con `GUARDAR_ID_NOTIFICACION` (`BibliotecaContext.tsx:86-87`).

Si la app se cierra antes de que llegue:

- **La notificación** está programada en el **sistema operativo**, así que llega igual.
- **El identificador** se **pierde**, porque el Context vive en memoria, y con él también el préstamo.

El problema: llega un recordatorio de un préstamo que la app ya no muestra, y no hay forma de cancelarlo porque no se sabe su id.

Cómo lo resolvería:

1. Persistir préstamos e ids con AsyncStorage (desafío A6).
2. Al iniciar, reconciliar: comparar `getAllScheduledNotificationsAsync()` con los préstamos guardados y cancelar las que no tengan préstamo. Para eso conviene guardar el ISBN en `content.data` de la notificación.

**c) ¿Por qué el canal se crea antes de pedir el permiso?** En Android 13 o superior, el diálogo de permiso de notificaciones **no aparece hasta que la app tenga al menos un canal**. Si se pide antes, la respuesta es una negativa sin que la persona haya visto nada. Por eso `pedir()` llama a `asegurarCanal()` antes de `requestPermissionsAsync()` (`usePermiso.ts:44-45`; comentario en `notificaciones.ts:28-31`).

En Android 12 no existe el permiso `POST_NOTIFICATIONS`: las notificaciones están permitidas por defecto y `requestPermissionsAsync()` devuelve concedido sin mostrar diálogo. El canal sigue siendo obligatorio desde Android 8 para que la notificación se muestre, pero ya no influye en el permiso.

**d) Si el permiso está denegado y me entregan un libro desde el mostrador.**

```ts
// src/context/BibliotecaContext.tsx:112-125
if (persona === USUARIO_ACTUAL) {
  // Se consulta el permiso ahora: pudo cambiar en Ajustes desde la última vez.
  if (await notificacionesPermitidas()) {
    await notificarDisponible(libro);
  } else {
    despachar({ tipo: 'AGREGAR_AVISO', aviso: { … } });
  }
}
```

Me entero por el aviso que aparece arriba de todo en "Mis reservas" (`reservas.tsx:87-93`).

El código **consulta el permiso en ese momento** con `getPermissionsAsync()` (`notificaciones.ts:44-47`), no usa un valor guardado. Importa porque la persona puede haber cambiado el permiso en Ajustes en cualquier momento:

- Si el valor guardado dijera "concedido" pero ya lo hubiera quitado, la notificación se perdería en silencio y nunca se enteraría de que su libro está listo.
- Si dijera "denegado" pero lo hubiera habilitado, recibiría un aviso dentro de la app en lugar de la notificación que espera.

### D3. Lo que mi app pide y lo que no

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
|---|---|---|---|
| Android | `CAMERA` | Leer el código de barras en `/escanear` | Plugin `expo-camera` |
| Android | `POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de "libro disponible" (Android 13+) | Plugin `expo-notifications` |
| Android | `RECEIVE_BOOT_COMPLETED` | Que las notificaciones programadas sobrevivan a un reinicio del teléfono | Plugin `expo-notifications` |
| Android | `INTERNET`, `VIBRATE` | Conexión con el servidor de desarrollo y vibración de las notificaciones. Son permisos normales y no muestran diálogo. | Plantilla base de Expo |
| iOS | `NSCameraUsageDescription` = "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN." | Escáner | Plugin `expo-camera` (opción `cameraPermission` en `app.json`) |
| iOS | *(ninguna clave)* para notificaciones locales | Recordatorio | No hace falta una clave en Info.plist; el permiso se pide en tiempo de ejecución con `requestPermissionsAsync` |
| Android (bloqueados) | `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | Ninguna: la app no graba, no se dibuja sobre otras apps y no lee ni escribe archivos | Se quitan con `android.blockedPermissions` |

**a) ¿Por qué no declara `RECORD_AUDIO`?** `expo-camera` lo agrega por defecto porque puede grabar video con sonido. Esta app solo lee códigos, así que lo desactivo en el plugin y además lo bloqueo por si otra dependencia lo agrega:

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.",
  "microphonePermission": false,
  "recordAudioAndroid": false
}]
```

```json
"android": {
  "blockedPermissions": ["android.permission.RECORD_AUDIO", "…"]
}
```

`microphonePermission: false` hace lo mismo en iOS: no agrega `NSMicrophoneUsageDescription`.

**b) "Elegir una foto de portada desde la galería".**

- **Paquete:** `expo-image-picker` con `launchImageLibraryAsync`.
- **Permiso:** en Android 13+ usa el Photo Picker del sistema y en iOS 14+ el `PHPicker`, y los dos **no requieren permiso**: la persona elige la foto y la app solo recibe esa imagen. En el plugin pondría `photosPermission` con un texto de propósito y `cameraPermission: false` / `microphonePermission: false` si no se saca la foto con la cámara.
- **¿Alcanza con OTA? No, hace falta una build nueva.** `expo-image-picker` tiene **código nativo** y además cambia el `AndroidManifest`/`Info.plist` mediante su plugin. Una actualización OTA (`eas update`) solo reemplaza el JavaScript y los assets: si el binario instalado no incluye el módulo nativo, la app falla al llamarlo.

**c) ¿Qué no pude verificar del todo en Expo Go?**

- **Texto de propósito:** Expo Go es una app ya compilada con su propio Info.plist y sus propios textos. El diálogo de cámara muestra el texto de Expo Go, no el mío.
- **`blockedPermissions` y `recordAudioAndroid`:** el manifest de Expo Go declara todos los permisos de todos sus módulos. Mi configuración solo se aplica al compilar mi app.
- **Canal de Android:** el canal "Préstamos" se crea, pero aparece dentro de los ajustes de notificaciones de *Expo Go* y mezclado con los suyos.
- **Esquema `bibliotecaipf://`:** en Expo Go no existe. Los deep links se prueban con `exp://IP:8081/--/…`.

Cómo los verificaría:

1. Una **development build** (`eas build --profile development` o `npx expo run:android`).
2. Revisar el manifest final con `npx expo prebuild` (en una copia, sin subir `android/`) o con `npx expo config --type introspect`.
3. En el teléfono, ver Ajustes → Apps → Biblioteca IPF → Permisos y el canal de notificaciones.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas**

| # | Línea(s) | Tipo | Problema y por qué sucede | Corrección |
|---|---|---|---|---|
| 1 | 18-20 | **Error de ejecución / rendimiento** | `useEffect` sin array de dependencias: corre después de **cada** render. `setLibros` con un array nuevo provoca otro render, que vuelve a pedir: bucle infinito de pedidos. | Array de dependencias (`[]` o un contador para reintentar), como en `useLibros.ts:22-49`. |
| 2 | 19 | **Error de ejecución** | Sin `.catch`: `obtenerLibros()` falla 1 de cada 5 veces. Eso produce un *unhandled promise rejection* y la persona no ve nada. | `try/catch` y estado `error` con "Reintentar". |
| 3 | 18-20 | **Mala práctica** | Sin limpieza: si la pantalla se desmonta antes de la respuesta, igual hace `setLibros`. | Bandera `cancelado` en la limpieza. |
| 4 | 33-36 | **Mala práctica (UX)** | No hay estados de carga, error ni vacío: mientras carga o si falla, se ve una pantalla en blanco. | `EstadoCargando`, `EstadoError` y `EstadoVacio`. |
| 5 | 13-16 | **Mala práctica (permisos)** | Pide cámara y notificaciones **al abrir el Catálogo**, sin contexto ni pantalla previa. La persona todavía no sabe para qué sirven y las rechaza; en Android, dos rechazos y quedan bloqueados para siempre. | Cámara recién en "Escanear" con `/permisos/camara`; notificaciones al activar "Recordarme". |
| 6 | 15 | **Error en Android 13+** | Pide notificaciones sin haber creado un canal: el diálogo no aparece. Además, la promesa no se espera ni se maneja. | `asegurarCanal()` antes de pedir. |
| 7 | 13-16 | **Advertencia** | `pedirPermiso` se usa dentro del efecto pero no está en el array de dependencias (`react-hooks/exhaustive-deps`). | Sacar el pedido del montaje (ver 5). |
| 8 | 22-30 | **Rendimiento / mala práctica** | `Fila` está declarado **dentro** del componente. En cada render es un tipo de componente nuevo, así que React desmonta y vuelve a montar todas las filas. | Componente a nivel de módulo en su propio archivo (`components/FilaLibro.tsx`). |
| 9 | 10, 22 | **Mala práctica (TypeScript)** | `any[]` y `libro: any` desactivan el chequeo de tipos. | `useState<Libro[]>` y `Props = { libro: Libro }`. |
| 10 | 33-36 | **Rendimiento** | `ScrollView` + `map` renderiza todos los elementos de una vez. | `FlatList`. |
| 11 | 35 | **Advertencia / error sutil** | `key={i}` usa el índice: si la lista cambia de orden o se filtra, React reutiliza filas equivocadas. | `keyExtractor={(l) => l.isbn}`. |
| 12 | 25 | **Mala práctica** | Estilo en línea con valores fijos (`16`, `'#333'`, `12`). | `StyleSheet.create` con valores de `constants/tema.ts`. |
| 13 | 24 | **Mala práctica** | Ruta armada concatenando strings: no se valida con rutas tipadas. | `href={{ pathname: '/libro/[isbn]', params: { isbn } }}`. |
| 14 | 24, 37-39 | **Accesibilidad** | `Pressable` sin `accessibilityRole="button"`. El botón de la cámara es solo un ícono, sin `accessibilityLabel` (un lector de pantalla dice "botón" y nada más) y de 28 px, menos que 44 × 44. | `Boton`/`BotonIcono` de la app, con rol, etiqueta y `minHeight: tamanios.areaTactil`. |
| 15 | 5-6 | **Acoplamiento** | El Catálogo importa cámara y notificaciones, que no son responsabilidad suya. | Que cada pantalla importe solo lo que usa. |

**b) El efecto sin array de dependencias durante el primer minuto.**

1. **t = 0:** primer render con `libros = []`. Después del commit corre el efecto y pide los libros.
2. **t ≈ 800 ms:** llega la respuesta. `setLibros(copia nueva)` provoca un render. Como no hay array de dependencias, el efecto corre otra vez y hace otro pedido.
3. Cada ~800 ms se repite: pedido → array nuevo → render → pedido. En un minuto son **unos 75 pedidos** y 75 renders de toda la lista.
4. Más o menos 1 de cada 5 pedidos falla: unas 15 promesas rechazadas sin manejar en un minuto. En desarrollo se acumulan advertencias; en producción, el pedido fallido simplemente no llama a `setLibros`.
5. Con una API real, esto gasta datos y batería y sobrecarga el servidor.

**¿Cambiaría algo si `obtenerLibros()` devolviera siempre el mismo array?** Sí:

1. El primer `setLibros` cambia de `[]` al array, así que hay render y el efecto pide otra vez.
2. El segundo `setLibros` recibe **la misma referencia** que ya tiene el estado. React compara con `Object.is`, ve que no cambió y **no vuelve a renderizar**.
3. Sin render no corre el efecto, y el bucle se corta después del segundo pedido.

El código sigue estando mal, pero el error queda escondido porque depende de un detalle de la API.

**c) Reescritura con los hooks, componentes y constantes de mi app.** Es la pantalla que entregué en `src/app/(tabs)/(catalogo)/index.tsx`:

```tsx
import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoCatalogo } from '@/components/EncabezadoCatalogo';
import { EstadoCargando } from '@/components/EstadoCargando';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FilaLibro } from '@/components/FilaLibro';
import { CANTIDAD_RECIENTES } from '@/constants/biblioteca';
import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { useLibros } from '@/hooks/useLibros';
import { ejemplaresDisponibles, personasEnEspera } from '@/lib/consultas';
import { buscarLibroPorIsbn } from '@/lib/isbn';
import type { Libro } from '@/types';

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { estado } = useBiblioteca();

  const recientes = estado.recientes
    .aArray()
    .reverse()
    .slice(0, CANTIDAD_RECIENTES)
    .map(buscarLibroPorIsbn)
    .filter((libro): libro is Libro => libro !== undefined);

  function renderVacio() {
    if (cargando) {
      return <EstadoCargando mensaje="Cargando el catálogo…" />;
    }
    if (error !== null) {
      return <EstadoError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />;
    }
    return <EstadoVacio mensaje="El catálogo está vacío por ahora." icono="library-outline" />;
  }

  return (
    <FlatList
      style={estilos.lista}
      data={cargando || error !== null ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => (
        <FilaLibro
          libro={item}
          disponibles={ejemplaresDisponibles(estado, item)}
          enEspera={personasEnEspera(estado, item.isbn).length}
        />
      )}
      ListHeaderComponent={<EncabezadoCatalogo recientes={recientes} />}
      ListEmptyComponent={renderVacio()}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { backgroundColor: colores.fondo },
});
```

Los accesos a "Buscar" y "Escanear" están en `EncabezadoCatalogo` como `Boton` accesibles. Los permisos ya no se piden acá: la cámara se pide en `/escanear` y las notificaciones en "Mis reservas".

**d) Rechazo en la tienda y desinstalación.**

- **Rechazo:** pedir cámara y notificaciones apenas se abre la app (problema 5). App Review de Apple (pauta 5.1.1) exige que los permisos se pidan cuando la función los necesita y con un propósito claro. Una app de catálogo que pide la cámara al iniciar, sin explicar por qué, es un motivo típico de rechazo.
- **Desinstalación:** el bucle infinito de pedidos (problema 1). La persona no lo ve directamente, pero nota que el teléfono se calienta, que se gasta la batería y los datos, y que la lista se traba porque se re-renderiza cada segundo. Sumado a dos diálogos de permisos al abrir la app sin saber para qué, la primera impresión es de una app invasiva y pesada.

### E2. Organización y acoplamiento

**a) Qué importa a qué** (salió de los `import '@/…'` de cada carpeta):

```
app         → components, constants, context, hooks, lib, types
components  → components, constants, context, hooks, lib, types
context     → constants, lib, types
hooks       → lib, types
lib         → constants, data, estructuras, lib, types
data        → types
constants   → types
estructuras → (nada)
types       → (nada)
```

No hay importaciones "hacia arriba": nada fuera de `src/app` importa de `src/app`, y `estructuras` y `types` no dependen de nadie. Un hook que importe algo de `src/app` sería un problema por tres razones:

- `src/app` son rutas. Cada archivo es una pantalla, y moverlo o renombrarlo cambia la URL: el hook se rompería por un cambio de navegación.
- Crearía dependencias circulares: la pantalla importa el hook y el hook importa la pantalla.
- El hook ya no se podría reutilizar ni probar sin la pantalla.

**b) Si el catálogo viniera de una API real.** Cambiaría `lib/api.ts`, y desaparecería `data/libros.ts`. Pero **no serían solo dos archivos**: `lib/isbn.ts` (`buscarLibroPorIsbn`) busca **de forma síncrona** en el array `LIBROS`. La usan el detalle, la reserva, el escáner, "Mis reservas", el mostrador y el Catálogo (para los recientes). Con una API real habría que guardar los libros cargados en el Context o en un hook con caché, y esas pantallas pasarían a tener estados de carga.

Lo que dice sobre mi diseño: el acceso a los datos está bien aislado para la **lista** (`useLibros` → `api.ts`), pero la búsqueda por ISBN quedó acoplada a que los datos son locales. Lo mejoraría con un hook `useLibro(isbn)` como única puerta de entrada.

**c) `<ConPermiso recurso="camara">…</ConPermiso>`.**

Qué ganaría:

- Sería declarativo: se envuelve la cámara y listo.
- Los cuatro estados quedarían en un solo lugar.
- Menos código repetido entre pantallas.

En parte ya lo tengo: `ContenidoPermiso.tsx` resuelve los cuatro estados para la pantalla previa.

Qué perdería:

- **La pantalla previa como ruta** (`/permisos/camara`), que es un modal con URL propia y se puede abrir desde cualquier lado.
- **Flexibilidad en `/escanear`:** ahí necesito mostrar el campo del ISBN **siempre**, con o sin permiso, y un aviso dentro de la misma pantalla. Un envoltorio que solo muestra `children` cuando hay permiso obliga a meter todo eso adentro del componente o a pasarle muchas props.

¿Serviría para notificaciones? **No.** Las notificaciones no se piden al abrir una pantalla: se piden cuando la persona activa un interruptor, y necesito el **resultado** para decidir si programo el recordatorio o muestro un aviso (`reservas.tsx:36-47`). Eso es una acción imperativa, no algo que se renderiza. Por eso `usePermiso` devuelve `pedir()` y `refrescar()` como funciones que retornan el estado. El hook sirve para los dos casos; el componente envoltorio, solo para la cámara.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja (archivo y línea) |
|---|---|---|
| `obtenerLibros()` falla | "No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo." con el botón "Reintentar" | `hooks/useLibros.ts:31-34` (captura) y `app/(tabs)/(catalogo)/index.tsx:31-32` (muestra) |
| Se abre `/libro/abc` | "No encontramos ese libro. «abc» no corresponde a ningún libro del catálogo…" con el link "Volver al Catálogo"; el header dice "Libro no encontrado" | `lib/isbn.ts:17-21`, `app/(tabs)/(catalogo)/libro/[isbn].tsx:26-32`, `components/LibroNoEncontrado.tsx` |
| Se escanea un ISBN que no está en el catálogo | "El código … no es de ningún libro del catálogo. Probá con otro." y la cámara sigue escaneando | `app/escanear.tsx:58-61` |
| La cámara está bloqueada | "La cámara está desactivada para esta app…" con "Abrir Ajustes" y el campo para escribir el ISBN | `lib/permisos.ts:15`, `app/escanear.tsx:97-105` y `111` |
| Las notificaciones están denegadas | En "Mis reservas": "Las notificaciones están desactivadas: tus avisos van a aparecer en esta pantalla." Los avisos (por ejemplo "¡«…» ya está disponible para vos!") aparecen ahí. | `app/(tabs)/reservas.tsx:84-86`, `app/permisos/[recurso].tsx:33-36`, `context/BibliotecaContext.tsx:114-124` |
| Se intenta reservar un libro ya reservado | En el detalle: "Ya tenés este libro prestado o reservado." y el botón "Ver mis reservas" en lugar de "Reservar". Si se entra igual a `/reservar/…` por URL: "Ya tenés este libro prestado o estás en su lista de espera…" | `lib/consultas.ts:55-60`, `libro/[isbn].tsx:50-58`, `reservar/[isbn].tsx:20-21` y `60-61` |
| "Entregar al siguiente" con la lista de espera vacía | La tarjeta dice "Nadie está esperando este libro." y el botón está deshabilitado. Si se llamara igual, no pasa nada: el contexto devuelve `undefined` y el reducer devuelve el mismo estado. | `components/TarjetaMostrador.tsx:19-20` y `34`, `context/BibliotecaContext.tsx:105-109`, `lib/bibliotecaReducer.ts:93-95` |
| Login con clave incorrecta | "El usuario o la clave no son correctos. Revisalos e intentá de nuevo." y se queda en el login | `app/login.tsx:19-21` |

Ninguna situación termina en "nada" ni en "la app se rompe".

### E4. Decisiones con argumentos

**a) Identificador: ISBN como parámetro de ruta y `key`.**

- **Es el dato que ya existe en el mundo real:** está impreso en la contratapa, es lo que lee el escáner y es lo que la persona escribe a mano. Un id numérico propio obligaría a mantener una tabla ISBN → id para que el escáner funcione.
- **Hace URLs significativas y estables:** `/libro/9789500420211` sirve como deep link aunque se reordene el catálogo. Un id autoincremental cambiaría si se recarga el catálogo en otro orden.
- **Dos ediciones del mismo título** tienen **ISBN distintos**, y está bien: para una biblioteca son libros distintos, con distinta cantidad de ejemplares y lista de espera.
- **`useLocalSearchParams` devuelve `string`** (o `string[]`). El ISBN se mantiene como string de 13 dígitos (`types/index.ts:2`) y no hay conversión con `Number()` que pueda romperse. Lo valido con una expresión regular (`isbn.ts:5`).
- **La debilidad son los libros sin ISBN** (anteriores a 1970 o donaciones). Para ellos asignaría un código interno con el mismo formato de 13 dígitos, por ejemplo con un prefijo reservado como hacen muchas bibliotecas. Así el resto de la app no cambia.

**b) Estructuras: clase `Pila` con `#items`.**

Lo que me dio la clase:

- **Encapsulación:** desde afuera solo se puede `apilar`, `desapilar`, ver el `tope` o pedir una copia (`aArray()` devuelve `[...this.#items]`). Nadie puede hacer `splice` ni meter un libro en el medio.
- **Nombres del dominio:** el reducer dice `recientes.apilar(isbn)`, no `[...arr, isbn]`. La regla "si ya está en el tope no se apila" es clara en `bibliotecaReducer.ts:59-65`.

Lo que me complicó al combinarla con React:

- **React detecta cambios por referencia, y la clase está pensada para mutarse.** Tuve que agregar `clonar()` y acordarme de clonar **siempre** antes de modificar (ver B3).
- **Una instancia de clase no se puede serializar directamente:** para persistirla con AsyncStorage habría que guardar `aArray()` y reconstruirla.
- **Las herramientas de depuración no muestran `#items`.**

Con un array y `[...pila, x]` / `slice` no habría tenido ninguno de esos problemas, pero perdería la garantía de que solo se usa como pila. En una app chica me quedo con la clase porque el TP pide practicar esas estructuras y porque el reducer centraliza los clonados en un solo archivo.

**c) Memorización.**

Dónde aporta:

- **El `value` del Context con `useMemo`** (`BibliotecaContext.tsx:151-178`). Si el Provider se re-renderizara por otra razón, sin `useMemo` el `value` sería un objeto nuevo y todos los consumidores se volverían a renderizar. Como el Provider está en la raíz y casi nunca se re-renderiza por otra cosa, el beneficio es chico pero el costo es casi nulo.
- **Las acciones que no dependen del estado con `useCallback`:** `verLibro`, `iniciarSesion`, `cerrarSesion`, `agregarAviso`, `descartarAviso`. Tienen dependencias vacías y conservan la identidad. Esto **sí importa** en `libro/[isbn].tsx:20-24`: `verLibro` está en el array de dependencias del efecto que apila en "Vistos recientemente". Si cambiara en cada render, el efecto se volvería a ejecutar. No apilaría dos veces porque el reducer revisa el tope, pero sería trabajo de más. También importa en `refrescar` de `usePermiso`, que está en las dependencias de `useFocusEffect` y del listener de `AppState`.

Dónde sería ruido:

- **Las acciones que dependen de `[estado]`** (`reservar`, `devolver`…): cambian cada vez que cambia el estado, así que `useCallback` casi no ahorra nada.
- **Calcular los 3 recientes en el Catálogo** (`index.tsx:20-25`): ponerlo en `useMemo` es ruido. Recorrer tres elementos es más barato que comparar las dependencias.
- **`ejemplaresDisponibles` por fila:** con 16 libros tampoco lo justifica.

Cómo lo comprobaría en lugar de suponerlo: con el **Profiler de React DevTools** (`j` en la terminal de `expo start` → React DevTools), grabando una interacción y mirando qué componentes se renderizan y cuánto tardan. O, más simple, con un `console.log` temporal en el cuerpo del componente, comparando con y sin `useMemo`.

**d) Datos duplicados.** **Los calculo.** `ejemplaresDisponibles` (`consultas.ts:9-13`) hace `ejemplares + devueltos − préstamos activos` en cada render.

El error que aparece cuando el mismo dato vive en dos lugares: si guardara "disponibles" en el estado, tendría que actualizarlo en **cada** acción que lo afecta (prestar, devolver, entregar desde el mostrador). Basta con olvidarse de uno, por ejemplo restar al prestar pero no sumar al devolver, para que la lista de préstamos diga una cosa y el contador otra. El detalle mostraría "0 disponibles" aunque nadie tenga el libro. Ese error además se acumula y no se corrige solo.

Al calcularlo, hay **una sola fuente de verdad** (`prestamos` + `devueltos`). El número disponible siempre coincide con los préstamos porque sale de ellos. El costo es recorrer el array de préstamos en cada render, que es insignificante.
