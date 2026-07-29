// Registro de todos los sprites del personaje (assets/SpriteCuboMapa/
// CuboPrincipal/Cubo/). Son ~150 archivos con nombres consistentes, así que
// en vez de escribir un import por archivo usamos import.meta.glob (Vite) y
// los organizamos acá una sola vez, en un objeto fácil de consultar:
//
//   SPRITES_JUGADOR.base.quieto[frame]
//   SPRITES_JUGADOR.fantasma.arriba[frame]
//   SPRITES_JUGADOR.fuerza.viento.derecha[frame]
//   SPRITES_JUGADOR.error[frame]  (compartido, no depende de la habilidad)
//
// Antes había dos carpetas (Cubo/ con un set viejo/incompleto, Efectos/ con
// el set completo que realmente usábamos para todo salvo Error0-3) — se
// unificaron en una sola Cubo/ (la que antes era Efectos/), así que ahora
// Error0-3 también sale de acá en vez del set viejo.
const modulos = import.meta.glob("../../assets/SpriteCuboMapa/CuboPrincipal/Cubo/**/*.png", {
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
  const indiceCubo = partes.indexOf("Cubo");

  // ¿Cubo/<Habilidad>/archivo, o Cubo/archivo (base)?
  const posibleHabilidad = partes[indiceCubo + 1];
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
