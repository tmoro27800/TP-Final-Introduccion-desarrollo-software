import { PARED, META, LAVA, VACIO, TELETRANSPORTADOR } from "./tiposCelda.js";

// Motor puro del juego: no importa nada de React, no toca el DOM. Recibe un
// estado y una dirección, devuelve el estado siguiente (o el mismo objeto
// si el movimiento no tuvo ningún efecto).
//
// Diseño: "terreno" (piso/pared/meta/lava/vacío/teletransportador) es fijo
// durante toda la partida. Lo que se mueve o se consume (jugador, cajas,
// llaves, pickups de habilidad) vive en el resto del estado. `estado.inicial`
// guarda una foto de los valores de arranque para poder reiniciar el nivel
// (por muerte o por la tecla R) sin tener que volver a pedirle el nivel al
// backend.
//
// Para agregar una mecánica nueva a futuro: sumar su valor a tiposCelda.js,
// escribir un resolver acá (una función que recibe el estado y la celda
// destino y devuelve el estado siguiente) y agregar una rama en
// `resolverAterrizaje`. El resto del motor no se toca.

export function crearEstadoInicial(nivelPreparado) {
  const portales = buscarValorEnGrilla(nivelPreparado.terreno, TELETRANSPORTADOR);

  const inicial = {
    jugador: nivelPreparado.jugadorInicial,
    cajas: nivelPreparado.cajasIniciales,
    llaves: nivelPreparado.llavesIniciales,
    pickups: nivelPreparado.pickupsIniciales,
  };

  return {
    terreno: nivelPreparado.terreno,
    portales,
    inicial,

    jugador: inicial.jugador,
    cajas: inicial.cajas,
    llaves: inicial.llaves,
    pickups: inicial.pickups,
    habilidadActiva: null,

    totalLlaves: inicial.llaves.length,
    movimientos: 0,
    muertes: 0,
    estado: "jugando", // "jugando" | "ganado"
    ultimoEvento: null, // { tipo, id } — para que la UI muestre un toast puntual
  };
}

// Reinicio manual (tecla R) o llamado internamente por una muerte.
export function reiniciarNivel(estado, { porMuerte = null } = {}) {
  return {
    ...estado,
    jugador: estado.inicial.jugador,
    cajas: estado.inicial.cajas,
    llaves: estado.inicial.llaves,
    pickups: estado.inicial.pickups,
    habilidadActiva: null,
    estado: "jugando",
    // pisar lava/vacío cuenta como una acción con efecto, igual que un
    // paso o un empuje; el reinicio manual (R) no es una acción del motor.
    movimientos: porMuerte ? estado.movimientos + 1 : estado.movimientos,
    muertes: porMuerte ? estado.muertes + 1 : estado.muertes,
    ultimoEvento: { tipo: porMuerte ? `muerte-${porMuerte}` : "reinicio-manual", id: Date.now() },
  };
}

// "Repetir nivel" desde la pantalla de victoria: a diferencia de la tecla R
// (que conserva movimientos/muertes porque reinicia a mitad de una partida
// en curso), esto es un intento nuevo de verdad — arranca todo en cero.
export function reiniciarNivelCompleto(estado) {
  return {
    ...reiniciarNivel(estado),
    movimientos: 0,
    muertes: 0,
  };
}

export function calcularSiguienteEstado(estado, direccion) {
  if (estado.estado !== "jugando") return estado;

  const destino = sumar(estado.jugador, direccion);
  if (!dentroDeLimites(estado.terreno, destino)) return estado;

  const esPared = estado.terreno[destino.fila][destino.columna] === PARED;
  if (esPared) return atravesarPared(estado, destino, direccion);

  return resolverAterrizaje(estado, destino, direccion);
}

// Pared: bloqueada, salvo con Fantasma activo, que permite pasar UNA pared
// si la celda de más allá es transitable. Reutiliza resolverAterrizaje para
// esa celda de más allá, así cajas/lava/vacío/teletransportador/meta/llaves/
// pickups se comportan exactamente igual atravesando una pared que en un
// paso normal (el boceto en Python duplica esta lógica y por eso le faltan
// casos, ej. no maneja aterrizar en la meta atravesando una pared).
function atravesarPared(estado, posPared, direccion) {
  if (estado.habilidadActiva !== "fantasma") return estado;

  const destino2 = sumar(posPared, direccion);
  if (!dentroDeLimites(estado.terreno, destino2)) return estado;
  if (estado.terreno[destino2.fila][destino2.columna] === PARED) return estado; // pared reforzada: bloqueado

  const estadoSinFantasma = { ...estado, habilidadActiva: null };
  return resolverAterrizaje(estadoSinFantasma, destino2, direccion);
}

// "Qué pasa cuando el jugador llega a esta celda" — cubre caja, llave,
// pickup de habilidad, lava, vacío, teletransportador, meta y piso. Se usa
// tanto para un paso normal como para la celda de destino del salto fantasma.
function resolverAterrizaje(estado, pos, direccion) {
  if (hayCajaEn(estado, pos)) {
    if (estado.habilidadActiva === "fuerza") return destruirCaja(estado, pos);
    return empujarCaja(estado, pos, direccion);
  }

  const indiceLlave = indexDe(estado.llaves, pos);
  if (indiceLlave !== -1) return recogerLlave(estado, pos);

  const pickup = buscarPickup(estado.pickups, pos);
  if (pickup) return recogerPickup(estado, pos, pickup);

  const valor = estado.terreno[pos.fila][pos.columna];
  if (valor === PARED) return estado; // defensivo: no debería llegarse acá con pared
  if (valor === LAVA) return manejarLava(estado, pos);
  if (valor === VACIO) return reiniciarNivel(estado, { porMuerte: "vacio" });
  if (valor === TELETRANSPORTADOR) return manejarTeletransportador(estado, pos);
  if (valor === META) return manejarMeta(estado, pos);

  return moverJugadorA(estado, pos); // piso
}

function moverJugadorA(estado, pos, cambios = {}) {
  return { ...estado, ...cambios, jugador: pos, movimientos: estado.movimientos + 1 };
}

function recogerLlave(estado, pos) {
  const llaves = estado.llaves.filter((p) => !posIguales(p, pos));
  return moverJugadorA(estado, pos, { llaves, ultimoEvento: { tipo: "llave", id: Date.now() } });
}

function recogerPickup(estado, pos, pickup) {
  const pickups = estado.pickups.filter((p) => p !== pickup);
  return moverJugadorA(estado, pos, {
    pickups,
    habilidadActiva: pickup.tipo,
    ultimoEvento: { tipo: `pickup-${pickup.tipo}`, id: Date.now() },
  });
}

function manejarLava(estado, pos) {
  if (estado.habilidadActiva === "invulnerabilidad") {
    return moverJugadorA(estado, pos, { habilidadActiva: null });
  }
  return reiniciarNivel(estado, { porMuerte: "lava" });
}

function manejarTeletransportador(estado, pos) {
  const otro = estado.portales.find((p) => !posIguales(p, pos));
  return moverJugadorA(estado, otro ?? pos);
}

function manejarMeta(estado, pos) {
  if (estado.llaves.length > 0) return estado; // bloqueada, faltan llaves
  return moverJugadorA(estado, pos, { estado: "ganado" });
}

// Caja: se empuja a la celda siguiente en la misma dirección si está libre.
// Si esa celda es el vacío, la caja se destruye pero el jugador SÍ avanza
// (a diferencia de que el jugador mismo pise el vacío, que reinicia el
// nivel) — así se comporta el boceto original, lo mantengo a propósito.
function empujarCaja(estado, posCaja, direccion) {
  const posSiguiente = sumar(posCaja, direccion);
  if (!dentroDeLimites(estado.terreno, posSiguiente)) return estado;
  if (hayCajaEn(estado, posSiguiente)) return estado; // no se apilan cajas

  const valorSiguiente = estado.terreno[posSiguiente.fila][posSiguiente.columna];

  if (valorSiguiente === VACIO) {
    const cajas = estado.cajas.filter((c) => !posIguales(c, posCaja));
    return moverJugadorA(estado, posCaja, {
      cajas,
      ultimoEvento: { tipo: "caja-destruida", id: Date.now() },
    });
  }

  const bloqueada =
    valorSiguiente === PARED ||
    valorSiguiente === LAVA ||
    valorSiguiente === META ||
    valorSiguiente === TELETRANSPORTADOR ||
    indexDe(estado.llaves, posSiguiente) !== -1 ||
    buscarPickup(estado.pickups, posSiguiente) !== undefined;

  if (bloqueada) return estado;

  const cajas = estado.cajas.map((c) => (posIguales(c, posCaja) ? posSiguiente : c));
  return moverJugadorA(estado, posCaja, { cajas });
}

// Modo fuerza: destruye la caja contra la que se choca. El jugador no
// avanza ese turno (igual que el boceto), pero cuenta como acción.
function destruirCaja(estado, posCaja) {
  const cajas = estado.cajas.filter((c) => !posIguales(c, posCaja));
  return {
    ...estado,
    cajas,
    habilidadActiva: null,
    movimientos: estado.movimientos + 1,
    ultimoEvento: { tipo: "caja-destruida", id: Date.now() },
  };
}

// ------------------------- helpers de posiciones -------------------------

function sumar(pos, direccion) {
  return { fila: pos.fila + direccion.df, columna: pos.columna + direccion.dc };
}

function dentroDeLimites(terreno, pos) {
  return pos.fila >= 0 && pos.fila < terreno.length && pos.columna >= 0 && pos.columna < terreno[0].length;
}

function posIguales(a, b) {
  return a.fila === b.fila && a.columna === b.columna;
}

function indexDe(lista, pos) {
  return lista.findIndex((p) => posIguales(p, pos));
}

function hayCajaEn(estado, pos) {
  return indexDe(estado.cajas, pos) !== -1;
}

function buscarPickup(pickups, pos) {
  return pickups.find((p) => posIguales(p, pos));
}

function buscarValorEnGrilla(grilla, valorBuscado) {
  const encontrados = [];
  for (let fila = 0; fila < grilla.length; fila++) {
    for (let columna = 0; columna < grilla[fila].length; columna++) {
      if (grilla[fila][columna] === valorBuscado) encontrados.push({ fila, columna });
    }
  }
  return encontrados;
}
