// Registro de todos los sprites del personaje (assets/SpriteCuboMapa/
// CuboPrincipal/). Son ~150 archivos con nombres consistentes, así que en
// vez de escribir un import por archivo usamos import.meta.glob (Vite) y
// los organizamos acá una sola vez, en un objeto fácil de consultar:
//
//   SPRITES_JUGADOR.base.quieto[frame]
//   SPRITES_JUGADOR.fantasma.arriba[frame]
//   SPRITES_JUGADOR.fuerza.viento.derecha[frame]
//   SPRITES_JUGADOR.error[frame]  (compartido, no depende de la habilidad)
//
// "base" sale de Efectos/ (la raíz, sin sub-carpeta de habilidad) — es el
// set completo (4 frames por dirección + viento), a diferencia de Cubo/
// que quedó más simple/viejo. Cubo/ solo se usa para Error0-3, que no
// existe en ningún otro lado.
const modulos = import.meta.glob("../../assets/SpriteCuboMapa/CuboPrincipal/**/*.png", {
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
  const carpetaCubo = partes.includes("Cubo");
  const indiceEfectos = partes.indexOf("Efectos");

  if (carpetaCubo) {
    // Cubo/: solo nos interesa Error0-3 (Quieto/Desplazamiento de acá quedan
    // sin usar a propósito, ver nota arriba).
    const matchError = archivo.match(/^Error(\d+)$/);
    if (matchError) insertarEnFrame(error, matchError[1], url);
    continue;
  }

  if (indiceEfectos === -1) continue; // CuboPrincipalSprites.png (hoja sin cortar) u otros sueltos

  // ¿Efectos/<Habilidad>/archivo, o Efectos/archivo (base)?
  const posibleHabilidad = partes[indiceEfectos + 1];
  const esHabilidad = HABILIDADES.includes(posibleHabilidad);
  const grupo = esHabilidad ? GRUPOS_POR_CARPETA[posibleHabilidad] : base;

  let m;
  if ((m = archivo.match(/^Quieto(\d+)$/))) {
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
  // "Desplazamiento2.png" suelto (sin dirección) no aparece bajo Efectos/,
  // solo en Cubo/ — ya está cubierto por el "continue" de arriba.
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
