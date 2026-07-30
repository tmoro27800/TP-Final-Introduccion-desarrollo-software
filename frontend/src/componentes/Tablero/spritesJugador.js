// Registro de todos los sprites del personaje (assets/SpriteCuboMapa/). Son
// DOS carpetas que se combinan al dibujar al jugador (ver Jugador.jsx): el
// cubo va de fondo y el efecto se pinta encima/adentro suyo.
//
//   - Efectos/  el estado (fantasma/fuerza/invulnerabilidad, o "base" sin
//     nada activo) — es lo único que se venía dibujando hasta ahora.
//   - Cubo/     el cuerpo del personaje en sí. No tiene variantes por
//     habilidad (la habilidad solo cambia el efecto, no la forma del cubo).
//
//   SPRITES_JUGADOR.base.quieto[frame]        (efecto)
//   SPRITES_JUGADOR.fantasma.arriba[frame]    (efecto)
//   SPRITES_JUGADOR.fuerza.viento.derecha[frame]  (efecto)
//   SPRITES_JUGADOR.error[frame]               (efecto, compartido)
//   SPRITES_CUBO.quieto / .arriba[frame] / .error[frame]  (cuerpo)
//
// ~150 archivos con nombres consistentes, así que en vez de un import por
// archivo se usa import.meta.glob (Vite).
const modulos = import.meta.glob("../../assets/SpriteCuboMapa/Efectos/**/*.png", {
  eager: true,
  import: "default",
});

const modulosCubo = import.meta.glob("../../assets/SpriteCuboMapa/Cubo/*.png", {
  eager: true,
  import: "default",
});

const HABILIDADES = ["Fantasma", "Fuerza", "Invulnerabilidad"];
const DIRECCIONES = { Arriba: "arriba", Abajo: "abajo", Izquierda: "izquierda", Derecha: "derecha" };

function grupoVacio() {
  return {
    quieto: [],
    arriba: [],
    abajo: [],
    izquierda: [],
    derecha: [],
    particulas: [],
    estela: null,
    viento: { arriba: [], abajo: [], izquierda: [], derecha: [] },
  };
}

const base = grupoVacio();
const fantasma = grupoVacio();
const fuerza = grupoVacio();
const invulnerabilidad = grupoVacio();
const error = [];

const GRUPOS_POR_CARPETA = { Fantasma: fantasma, Fuerza: fuerza, Invulnerabilidad: invulnerabilidad };

function insertarEnFrame(lista, indice, url) {
  lista[Number(indice)] = url;
}

for (const [ruta, url] of Object.entries(modulos)) {
  const partes = ruta.split("/");
  const archivo = partes[partes.length - 1].replace(".png", "");
  const indiceEfectos = partes.indexOf("Efectos");

  // ¿Efectos/<Habilidad>/archivo, o Efectos/archivo (base)?
  const posibleHabilidad = partes[indiceEfectos + 1];
  const esHabilidad = HABILIDADES.includes(posibleHabilidad);
  const grupo = esHabilidad ? GRUPOS_POR_CARPETA[posibleHabilidad] : base;

  let m;
  if ((m = archivo.match(/^Error(\d+)$/))) {
    insertarEnFrame(error, m[1], url);
  } else if ((m = archivo.match(/^Quieto(\d+)$/))) {
    insertarEnFrame(grupo.quieto, m[1], url);
  } else if ((m = archivo.match(/^Desplazamiento(Arriba|Abajo|Izquierda|Derecha)(\d+)$/))) {
    insertarEnFrame(grupo[DIRECCIONES[m[1]]], m[2], url);
  } else if ((m = archivo.match(/^Particulas(\d+)$/))) {
    insertarEnFrame(grupo.particulas, m[1], url);
  } else if ((m = archivo.match(/^Viento(Arriba|Abajo|Izquierda|Derecha)(\d+)$/))) {
    insertarEnFrame(grupo.viento[DIRECCIONES[m[1]]], m[2], url);
  } else if (archivo === "ImagenResidual") {
    grupo.estela = url;
  }
}

export const SPRITES_JUGADOR = { base, fantasma, fuerza, invulnerabilidad, error };

// Cubo/ es plano (sin subcarpetas por habilidad) y trae un caso especial:
// el frame 2 de caminar es un único dibujo (Desplazamiento2.png, sin
// dirección) compartido por las 4 direcciones, en vez de 4 archivos como
// las demás — así vino de assets. Quieto tampoco tiene variantes (Quieto.png
// a secas): el cuerpo del cubo no "respira" en reposo, solo el efecto de
// arriba lo hace.
const cubo = { quieto: null, arriba: [], abajo: [], izquierda: [], derecha: [], error: [] };
let frameGiroCompartido = null;

for (const [ruta, url] of Object.entries(modulosCubo)) {
  const archivo = ruta.split("/").pop().replace(".png", "");

  let m;
  if (archivo === "Quieto") {
    cubo.quieto = url;
  } else if (archivo === "Desplazamiento2") {
    frameGiroCompartido = url;
  } else if ((m = archivo.match(/^Error(\d+)$/))) {
    insertarEnFrame(cubo.error, m[1], url);
  } else if ((m = archivo.match(/^Desplazamiento(Arriba|Abajo|Izquierda|Derecha)(\d+)$/))) {
    insertarEnFrame(cubo[DIRECCIONES[m[1]]], m[2], url);
  }
}

for (const direccion of ["arriba", "abajo", "izquierda", "derecha"]) {
  cubo[direccion][2] = frameGiroCompartido;
}

export const SPRITES_CUBO = cubo;

// Cantidad de frames de cada animación, para que el hook no tenga que
// adivinar (las 4 variantes son consistentes entre sí, así que alcanza con
// mirar "base").
export const FRAMES = {
  caminar: base.arriba.length,
  quieto: base.quieto.length,
  particulas: base.particulas.length,
  viento: base.viento.arriba.length,
  error: error.length,
};
