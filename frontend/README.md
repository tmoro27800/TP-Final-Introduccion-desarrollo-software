# Frontend — Cube of Stars

React 18 + Vite. Sin Phaser ni `<canvas>` para el juego en sí — el tablero
se renderiza con CSS Grid (cada celda es un elemento del DOM), lo que
alcanza y sobra para un puzzle por casillas (sin física, sin rotaciones) y
es mucho más fácil de debuggear con las devtools del navegador que un canvas.
Los únicos `<canvas>` reales del proyecto son los fondos animados (ver
`componentes/Fondos/`), que sí usan WebGL vía Three.js.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # VITE_API_URL, default http://localhost:3000
npm run dev
```

Abre en `http://localhost:5173`. Necesita el backend corriendo (ver
`../backend/README.md`) para listar/jugar niveles y guardar puntajes.
Referencia de la API: [`../ENDPOINTS.MD`](../ENDPOINTS.MD).

Otros scripts (`package.json`):
- `npm run build` — build de producción a `dist/` (Vite).
- `npm run preview` — sirve ese build ya generado, para probarlo local antes de deployar.

## Stack

- **React 18** + **React Router 7** (todo client-side, sin SSR).
- **Vite** como bundler/dev server.
- **Axios** para hablar con el backend (`servicios/api.js`).
- **Three.js** + **postprocessing** solo para los fondos animados (shader de
  nieve pixelada, ver `componentes/Fondos/`) — el resto del juego no toca
  WebGL para nada.
- Sin librería de estado global (Redux/Zustand/etc.) — el estado del juego
  vive en un solo `useState` dentro de `EnEjecucion.js`, y lo demás son
  `useState`/`useContext` locales de cada pantalla. Para el alcance de este
  proyecto (una partida a la vez, sin usuarios/sesión) alcanza.

## Estructura

```
src/
  main.jsx                 # entry point: monta <App/> en #root, con StrictMode
  App.jsx                  # <ConfiguracionProvider><MusicaProvider><BrowserRouter>
                            #   + <AppFondo/> + <Routes> (ver tabla de rutas abajo)
  App.css                  # variables globales (--font-pixel, --font-pixel-secundario,
                            #   paleta de color), #root { text-align: center }

  juego/                   # pantallas del juego + toda la lógica de negocio
    Juego/
      tiposCelda.js         # constantes de cada valor de celda del mapa (0=piso, 1=pared, ...)
      motorJuego.js         # MOTOR PURO: sin React ni DOM. Recibe un estado + una
                            #   dirección, devuelve el estado siguiente. Ver más abajo.
      PrepararNivel.js      # separa el mapa crudo del backend en terreno (fijo) +
                            #   posiciones iniciales de entidades (jugador/cajas/llaves/pickups)
      EnEjecucion.js        # useJuego(): único puente entre el motor puro y React.
                            #   useState + listener de teclado + traduce teclas a
                            #   llamadas al motor.
      Juego.jsx             # wrapper de datos: pide el nivel al backend (GET
                            #   /api/niveles/:id), maneja loading/error, y renderiza
                            #   <Nivel/> ya con los datos listos.
    Nivel/
      Nivel.jsx             # la partida en curso: usa useJuego(), arma el HUD
                            #   (movimientos/tiempo/muertes/llaves), botón "Consejos",
                            #   toasts por evento, pantalla de victoria + guardado de
                            #   puntaje (POST /api/puntajes)
    Consejos/
      useConsejos.js        # consejos progresivos por nivel: pide todos juntos
                            #   (GET /api/consejos?nivel=) y los revela de a uno en
                            #   memoria del lado del cliente, sin ida y vuelta al
                            #   backend por cada uno
    Menu/
      Menu.jsx              # menú principal + modales "Cómo jugar" y "Configuración"
      mecanicasInfo.js      # resuelve el SPRITE de cada mecánica (el texto sale del
                            #   backend, ver servicios/obstaculoServicio.js) para el
                            #   glosario del modal "Cómo jugar > Mecánicas"
    SeleccionModo/          # elegir Normal / Difícil
    SeleccionNivel/         # grilla de niveles de la dificultad elegida
    Puntaje/                # tabla de puntajes (filtro por dificultad + nivel)
    Configuracion/
      ConfiguracionContext.jsx   # controles (WASD reasignable), audio (música/efectos
                                #   on-off), idioma — todo en memoria, sin persistencia
                                #   entre sesiones (no hay login, así que no hay
                                #   "cuenta" donde guardarlo)
      configuracionDefault.js
    Musica/                 # sistema de audio — ver sección propia más abajo
      MusicaContext.jsx
      useEfectosSonido.js
      useSonidosDeJuego.js

  componentes/              # piezas de UI reutilizables entre pantallas
    Tablero/                 # TODO el renderizado del tablero de juego
      Tablero.jsx             # arma la grilla CSS y calcula el estado visual de cada
                              #   celda dinámica (láser on/off, puerta abierta/cerrada,
                              #   puente activo/alerta/colapsado, botón presionado)
      CeldaTerreno.jsx        # una celda individual — vive en su propio componente
                              #   (no una función suelta en el .map) porque varias
                              #   mecánicas se animan con hooks propios, y un hook no
                              #   puede llamarse condicionalmente ni dentro de un callback
      Jugador.jsx             # sprite del personaje + estela + partículas + viento
      Pickup.jsx              # ícono animado de un pickup de habilidad en el mapa
      EfectoCajaDestruida.jsx / EfectoPowerUp.jsx   # overlays transitorios (se agregan
                              #   y se sacan solos) para caja rota / power-up agarrado
      sprites.js              # registro de sprites de terreno/pickups (imports directos)
      spritesJugador.js       # registro de sprites del personaje — usa import.meta.glob
                              #   (Vite) para no escribir ~150 imports a mano
      celdaVisual.js          # mapa de "clase CSS de respaldo" para mecánicas sin
                              #   sprite todavía (hoy vacío: ya todas tienen sprite real)
      useAnimacionJugador.js / useEfectoPowerUp.js / useEfectosDestruccion.js /
      usePuertaAnimada.js     # hooks de animación específicos de cada efecto
    useCicloDeFrames.js       # dos hooks compartidos de animación por frames:
                              #   useCicloDeFrames (loop infinito) y useCicloUnaVez
                              #   (una pasada, se clava en el último frame)
    useEstadoBoton.js         # hover/active compartido por todos los botones-sprite
    Boton/, BotonNivel/, BotonPixelar/, BotonVuelta/   # variantes de botón
    FilaControl/              # fila para reasignar una tecla (modal Configuración)
    FilaPuntaje/              # fila de la tabla de puntajes
    Fondos/                   # fondos animados con Three.js (shader de nieve pixelada);
                              #   AppFondo.jsx elige cuál según la ruta actual
    PantallaCarga/            # spinner/mensaje de carga reutilizable
    Ventana/                  # modal genérico (overlay + click afuera para cerrar)

  errores/
    NoEncontrada.jsx          # 404

  servicios/                  # una función por endpoint, todas devuelven response.data
    api.js                     # instancia de axios (baseURL = VITE_API_URL) +
                              #   interceptor que normaliza errores del backend
    nivelServicio.js / puntajeServicio.js / dificultadServicio.js / consejoServicio.js /
    obstaculoServicio.js

  assets/
    SpriteCuboMapa/            # sprites del personaje y del terreno/mapa
    SpriteMenuPrincipal/ SpriteSeleccionModo/   # sprites de botones del menú
    Logo/                      # logo, favicon
    Audios/
      Musicas/                 # 5 pistas (2 sin asignar todavía, ver Musica/MusicaContext.jsx)
      Sonidos/                 # efectos cortos (.ogg)
      SacadoDe.txt              # de dónde sale cada sonido/música y a qué acción
                              #   corresponde — es la referencia que se usó para
                              #   cablear useEfectosSonido.js/MusicaContext.jsx
```

## Rutas (`App.jsx`)

| Ruta | Pantalla | Qué muestra |
|---|---|---|
| `/` | `Menu` | Menú principal, más los modales "Cómo jugar" y "Configuración" |
| `/seleccion-modo` | `SeleccionModo` | Elegir Normal / Difícil |
| `/seleccion-nivel/:modoId` | `SeleccionNivel` | Niveles disponibles de esa dificultad |
| `/juego` y `/juego/:levelId` | `Juego` → `Nivel` | La partida en sí |
| `/puntajes` | `Puntaje` | Tabla de puntajes, con filtro de dificultad + nivel |
| `*` (cualquier otra) | `NoEncontrada` | 404 |

## El motor de juego (`juego/Juego/`)

La parte más importante de todo el frontend, y la que vale la pena entender
antes de tocar cualquier mecánica:

- **`motorJuego.js` es 100% puro**: recibe `estado` + `direccion`, devuelve
  el `estado` siguiente (o el **mismo objeto** si el movimiento no tuvo
  ningún efecto — esa igualdad de referencia es justamente cómo el resto
  del código sabe si "pasó algo" o no). No importa nada de React, no toca
  el DOM, no sabe que existe un teclado. Eso lo hace trivial de testear
  (entrada/salida, sin mocks de nada) — hoy no hay tests escritos, pero es
  la primera pieza candidata para agregarlos.
- **No hay reloj real.** Es un juego por turnos: cada tecla es un turno.
  Mecánicas que en cualquier otro engine usarían un timer (el láser que
  cicla encendido/apagado, el puente que colapsa a los N pasos) acá se
  miden en **cantidad de movimientos** (`estado.movimientos`), no en
  segundos reales.
- **`EnEjecucion.js` (`useJuego`) es el único lugar con `useState`/efectos
  de React** para el estado del juego. Traduce `keydown` → dirección →
  `calcularSiguienteEstado()` → nuevo estado, y arma dos señales derivadas
  para el resto de la UI:
  - `ultimoIntento` — un objeto nuevo por cada tecla presionada (con o sin
    efecto), con banderas como `exitoso`, `movioPosicion`, `murio`,
    `chocoPared`, `atravesoPared`. Lo consume `useAnimacionJugador.js`
    (elegir sprite/animación) y `useSonidosDeJuego.js` (elegir efecto de sonido).
  - `ultimoEvento` — lo emite el motor mismo (`{ tipo, id, ... }`) para
    cosas puntuales que no son "un movimiento" (agarrar una llave, romper
    una caja, morir). Lo consumen los toasts de `Nivel.jsx`,
    `useEfectosDestruccion.js`/`useEfectoPowerUp.js` (overlays visuales) y
    `useSonidosDeJuego.js`.
- **`PrepararNivel.js`** separa el mapa crudo (una sola matriz de números
  que manda el backend) en `terreno` (piso/pared/meta/lava/vacío/
  teletransportador/pinchos/láser/botón/puerta/puente/placa — no cambia en
  toda la partida) y las posiciones iniciales de lo que sí se mueve o se
  consume (jugador, cajas, llaves, pickups).

### Mecánicas implementadas (`tiposCelda.js`)

| Valor | Mecánica | Valor | Mecánica |
|---|---|---|---|
| 0 | Piso | 10 | Pickup: Invulnerabilidad |
| 1 | Pared | 11 | Botón |
| 2 | Jugador (posición inicial) | 12 | Puerta (se abre con botón/placa) |
| 3 | Meta | 13 | Lava |
| 4 | Caja | 14 | Puente temporal |
| 5 | Pickup: Modo fantasma | 15 | Vacío |
| 6 | Pinchos | 16 | Llave |
| 7 | Teletransportador | 17 | Placa de presión |
| 9 | Rayo láser | 18 | Pickup: Modo fuerza |
| — | (8 reservado, descartado) | 19 | Puerta con llave |

Para agregar una mecánica nueva: sumar su valor acá, escribir un resolver
en `motorJuego.js`, agregar el sprite en `sprites.js` y una rama en
`CeldaTerreno.jsx`. El resto del motor no se toca.

## Sistema de audio (`juego/Musica/`)

Dos sistemas separados, con responsabilidades distintas:

- **`MusicaContext.jsx`** — música de fondo, en loop. Un solo `<audio>`
  global que nunca se desmonta al navegar entre pantallas (a diferencia de
  los componentes de cada ruta). Cada pantalla pide una pista al montar:
  `reproducir("menu")` (Menu/SeleccionModo/SeleccionNivel/Puntaje/
  NoEncontrada) o `reproducir(nivel.dificultad)` (Nivel.jsx, que ya viene
  como `"normal"`/`"dificil"`). Pedir la misma pista que ya está sonando no
  la reinicia. Respeta el toggle "Música" de Configuración y reintenta el
  autoplay en el primer click/tecla si el navegador lo bloqueó al arrancar.
- **`useEfectosSonido.js`** — efectos puntuales (un solo golpe de sonido,
  no loop). Cada llamado crea un `<audio>` nuevo y lo deja sonar solo, así
  varios pueden superponerse sin cortarse (ej. moverse Y agarrar una llave
  en el mismo paso). Respeta el toggle "Efectos" de Configuración.
- **`useSonidosDeJuego.js`** — el traductor: mira `ultimoIntento`/
  `ultimoEvento`/algunos booleanos del motor y decide qué efecto puntual
  llamar (mover, chocar contra una pared, morir, agarrar una llave, la
  última llave, un pickup, romper una caja, atravesar una pared con
  fantasma, cruzar un láser apagado/morir por uno encendido, abrir una
  puerta, llegar a la meta). El mapeo acción → archivo está en
  `assets/Audios/SacadoDe.txt`.

## Glosario de mecánicas — texto desde el backend

El modal "Cómo jugar > Mecánicas" de `Menu.jsx` ya no tiene el texto
hardcodeado: al montar, pide `GET /api/obstaculos` (ver
`servicios/obstaculoServicio.js`) y arma la lista con `nombre`/`descripcion`
que vienen de la base (tabla `obstaculos`, ver `db/README.md`). El **sprite**
de cada mecánica sigue resolviéndose 100% en el frontend (`mecanicasInfo.js:
resolverVisual()`), porque apunta a assets empaquetados que la base no
puede referenciar — para eso, `mecanicasInfo.js` exporta un mapa
`NOMBRE_A_VALOR` que traduce el slug que manda el backend (`"lava"`) al
valor numérico de celda (`tiposCelda.js: LAVA`) que `resolverVisual()`
necesita. Mismo criterio se usó para `SeleccionModo.jsx`: la descripción de
cada dificultad ("Ritmo pausado...") ahora sale de `dificultad.descripcion`
(`GET /api/dificultades`) en vez de estar escrita dos veces.

## Consejos progresivos (`juego/Consejos/useConsejos.js`)

Los niveles 1 a 6 tienen entre 2 y 5 consejos cargados en la tabla
`consejos` (ver `db/README.md`). El resto de los 36 niveles aún no tiene
consejos precargados. Donde existen, están ordenados del más vago al más
específico.
El botón "💡 Consejos" del HUD (`Nivel.jsx`) pide **todos** los del nivel
actual en una sola llamada (`GET /api/consejos?nivel=<id>`, ver
`servicios/consejoServicio.js`) recién la primera vez que se abre el modal
— no antes, para no gastar un fetch en niveles donde el jugador nunca los
pide. A partir de ahí, `useConsejos.js` los va revelando de a uno **en
memoria del lado del cliente** (un botón "Ver siguiente consejo" avanza un
índice local) — no hay una vuelta al backend por cada consejo revelado, ni
un contador de "visto" server-side (por eso la tabla tiene `creado_en` en
vez de un contador: ver `backend/README.md`).

## Cosas para tener en cuenta / pendientes

- **`servicios/puntajeServicio.js`** todavía exporta funciones para
  `/api/scores` (`getAllScores`, `getGlobalRanking`, etc.). Ese alias
  **ya no existe en el backend**. Ninguna pantalla las llama hoy; devolverían
  404 si se usaran. Ver [`../ENDPOINTS.MD`](../ENDPOINTS.MD).
- **`dificultadServicio.js`** ya tiene `getDificultades()` en uso
  (`SeleccionModo.jsx`), pero `createDificultad`/`updateDificultad`/
  `deleteDificultad` siguen sin ninguna pantalla que los llame — el
  backend los soporta, falta la UI de administración (trabajo pendiente
  compartido con el backend, ver [`../ENDPOINTS.MD`](../ENDPOINTS.MD)). Mismo caso para crear/editar/
  borrar consejos u obstáculos: se leen (`consejoServicio.js`/
  `obstaculoServicio.js`), pero no se escriben desde ninguna pantalla.
- **`componentes/Boton/Boton.jsx`** no se usa en ningún lado (no hay que
  confundirlo con `BotonNivel`/`BotonPixelar`/`BotonVuelta`, que sí están
  activos) y además importa un `Button.css` que no existe en esa carpeta
  — al no estar importado desde ningún lado activo, Vite nunca intenta
  resolverlo y no rompe el build, pero es candidato a borrarse.
- **`src/game/SelectionLevel/NivelesDetalle.mock.json`** es un mock del
  prototipo original, ya no se usa (el nivel se pide de verdad al backend)
  — también candidato a borrarse.
- El bundle de producción tira un warning de chunk grande (+1.8MB de JS,
  aparte de los assets de audio/imagen) — no está resuelto todavía con
  `manualChunks`/`dynamic import()`.
- No hay tests (ni unitarios ni de integración) — `motorJuego.js`, al ser
  puro, es el candidato más barato para empezar.
