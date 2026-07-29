// Mecánicas sin sprite todavía: se dibujan con una clase CSS propia (ver
// Tablero.css) en vez de <img>, para que cada una se distinga a simple
// vista de "desconocido" real (un valor de mapa que no maneja nada). Vacío
// por ahora — Puente (el último que quedaba) ya tiene sprite real (ver
// sprites.js: SPRITES_PUENTE). Vive en su propio archivo (no en
// Tablero.jsx) porque tanto CeldaTerreno.jsx como el glosario de mecánicas
// del menú (juego/Menu/mecanicasInfo.js) lo necesitan, y un componente no
// debería importar de otro componente solo para sacarle una constante.
export const CLASES_SIN_SPRITE = {};
