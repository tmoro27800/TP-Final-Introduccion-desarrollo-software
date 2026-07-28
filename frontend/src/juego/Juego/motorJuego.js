import {
  PARED,
  META,
  LAVA,
  VACIO,
  TELETRANSPORTADOR,
  PINCHOS,
  LASER,
  BOTON,
  PUERTA,
  PUENTE,
  PLACA_PRESION,
} from "./tiposCelda.js";

// Motor puro del juego: no importa nada de React, no toca el DOM. Recibe un
// estado y una dirección, devuelve el estado siguiente (o el mismo objeto
// si el movimiento no tuvo ningún efecto).
//
// Diseño: "terreno" (piso/pared/meta/lava/vacío/teletransportador/pinchos/
// láser/botón/puerta/puente/placa) es fijo durante toda la partida. Lo que
// se mueve o se consume (jugador, cajas, llaves, pickups de habilidad) vive
// en el resto del estado. `estado.inicial` guarda una foto de los valores
// de arranque para poder reiniciar el nivel (por muerte o por la tecla R)
// sin tener que volver a pedirle el nivel al backend.
//
// No hay reloj real en este motor — todo pasa en reacción a una tecla. Por
// eso el láser (cíclico) y el puente (cuenta regresiva) se miden en
// cantidad de MOVIMIENTOS, no en segundos.
//
// Para agregar una mecánica nueva a futuro: sumar su valor a tiposCelda.js,
// escribir un resolver acá y agregar una rama en `resolverAterrizaje`. El
// resto del motor no se toca.

const DURACION_CICLO_LASER = 3; // movimientos prendido, y otros tantos apagado
const DURACION_PUENTE = 5; // movimientos desde que se pisa hasta que colapsa
const PENALIZACION_PINCHOS = 3; // pasos extra que suma al contador al pisarlos

export function crearEstadoInicial(nivelPreparado) {
  const portales = buscarValorEnGrilla(nivelPreparado.terreno, TELETRANSPORTADOR);
  const puentesIniciales = detectarGruposPuente(nivelPreparado.terreno);

  const inicial = {
    jugador: nivelPreparado.jugadorInicial,
    cajas: nivelPreparado.cajasIniciales,
    llaves: nivelPreparado.llavesIniciales,
    pickups: nivelPreparado.pickupsIniciales,
    botonesPresionados: [],
    puentes: puentesIniciales,
  };

  return {
    terreno: nivelPreparado.terreno,
    portales,
    inicial,

    jugador: inicial.jugador,
    cajas: inicial.cajas,
    llaves: inicial.llaves,
    pickups: inicial.pickups,
    botonesPresionados: inicial.botonesPresionados,
    puentes: inicial.puentes,
    habilidadActiva: null,

    totalLlaves: inicial.llaves.length,
    movimientos: 0,
    muertes: 0,
    estado: "jugando", // "jugando" | "ganado"
    ultimoEvento: null, // { tipo, id } — para que la UI muestre un toast puntual
  };
}

// Reinicio manual (tecla R) o llamado internamente por una muerte. Un botón
// tocado o un puente colapsado son parte del INTENTO actual, no sobreviven
// a un reinicio — vuelven a su estado de arranque, igual que cajas/llaves.
export function reiniciarNivel(estado, { porMuerte = null } = {}) {
  return {
    ...estado,
    jugador: estado.inicial.jugador,
    cajas: estado.inicial.cajas,
    llaves: estado.inicial.llaves,
    pickups: estado.inicial.pickups,
    botonesPresionados: estado.inicial.botonesPresionados,
    puentes: estado.inicial.puentes,
    habilidadActiva: null,
    estado: "jugando",
    // pisar un hazard cuenta como una acción con efecto, igual que un paso
    // o un empuje; el reinicio manual (R) no es una acción del motor.
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
  const resultado = esPared
    ? atravesarPared(estado, destino, direccion)
    : resolverAterrizaje(estado, destino, direccion);

  return avanzarPuentes(estado, resultado);
}

// Pared: bloqueada, salvo con Fantasma activo, que permite pasar UNA pared
// si la celda de más allá es transitable. Reutiliza resolverAterrizaje para
// esa celda de más allá, así cajas/lava/vacío/teletransportador/meta/llaves/
// pickups/pinchos/láser/botón se comportan exactamente igual atravesando
// una pared que en un paso normal.
//
// Excepción: una PUERTA cerrada bloquea incluso a fantasma — si no, la
// mecánica de botón/puerta no tendría sentido (cualquiera con fantasma se
// la saltearía siempre). Por eso se chequea acá, antes de intentar el salto.
function atravesarPared(estado, posPared, direccion) {
  if (estado.habilidadActiva !== "fantasma") return estado;

  const destino2 = sumar(posPared, direccion);
  if (!dentroDeLimites(estado.terreno, destino2)) return estado;

  const valorDestino2 = estado.terreno[destino2.fila][destino2.columna];
  if (valorDestino2 === PARED) return estado; // pared reforzada: bloqueado
  if (valorDestino2 === PUERTA && !puertaAbierta(estado)) return estado; // puerta cerrada: bloqueado

  const estadoSinFantasma = { ...estado, habilidadActiva: null };
  return resolverAterrizaje(estadoSinFantasma, destino2, direccion);
}

// "Qué pasa cuando el jugador llega a esta celda" — cubre caja, llave,
// pickup de habilidad, lava, vacío, teletransportador, meta, pinchos,
// láser, botón, puerta, puente y piso. Se usa tanto para un paso normal
// como para la celda de destino del salto fantasma.
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
  if (valor === LAVA) return manejarHazard(estado, pos, "lava");
  if (valor === PINCHOS) return manejarPinchos(estado, pos);
  if (valor === VACIO) return reiniciarNivel(estado, { porMuerte: "vacio" });
  if (valor === TELETRANSPORTADOR) return manejarTeletransportador(estado, pos);
  if (valor === META) return manejarMeta(estado, pos);
  if (valor === LASER) return manejarLaser(estado, pos);
  if (valor === BOTON) return presionarBoton(estado, pos);
  if (valor === PUERTA) return manejarPuerta(estado, pos);
  if (valor === PUENTE) return manejarPuente(estado, pos);

  return moverJugadorA(estado, pos); // piso / placa de presión (transitable siempre)
}

function moverJugadorA(estado, pos, cambios = {}, pasosExtra = 0) {
  return { ...estado, ...cambios, jugador: pos, movimientos: estado.movimientos + 1 + pasosExtra };
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

// Hazard que mata salvo con invulnerabilidad activa (lava). El láser NO usa
// esto — es instantáneo, sin excepción de invulnerabilidad (ver
// manejarLaser). Los pinchos tampoco — no matan, ver manejarPinchos.
function manejarHazard(estado, pos, motivo) {
  if (estado.habilidadActiva === "invulnerabilidad") {
    return moverJugadorA(estado, pos, { habilidadActiva: null });
  }
  return reiniciarNivel(estado, { porMuerte: motivo });
}

// Pinchos: a diferencia de la lava, no matan — penalizan sumando
// PENALIZACION_PINCHOS movimientos al contador, para que cruzarlos sea una
// decisión de costo (¿vale la pena el atajo?) y no un peligro a esquivar
// siempre. Invulnerabilidad activa evita también esta penalización.
function manejarPinchos(estado, pos) {
  if (estado.habilidadActiva === "invulnerabilidad") {
    return moverJugadorA(estado, pos, { habilidadActiva: null });
  }
  return moverJugadorA(estado, pos, { ultimoEvento: { tipo: "pinchos", id: Date.now() } }, PENALIZACION_PINCHOS);
}

function manejarTeletransportador(estado, pos) {
  const otro = estado.portales.find((p) => !posIguales(p, pos));
  return moverJugadorA(estado, otro ?? pos);
}

function manejarMeta(estado, pos) {
  if (estado.llaves.length > 0) return estado; // bloqueada, faltan llaves
  return moverJugadorA(estado, pos, { estado: "ganado" });
}

// Láser: prendido/apagado en ciclos de DURACION_CICLO_LASER movimientos
// (ver laserActivo). Si está prendido cuando el jugador entra, muere sin
// excepción de invulnerabilidad — es instantáneo, no una "quemadura" como
// la lava.
function manejarLaser(estado, pos) {
  if (laserActivo(estado.movimientos)) {
    return reiniciarNivel(estado, { porMuerte: "laser" });
  }
  return moverJugadorA(estado, pos);
}

export function laserActivo(movimientos) {
  return Math.floor(movimientos / DURACION_CICLO_LASER) % 2 === 0;
}

// Botón: queda presionado PARA SIEMPRE (no como la placa de presión, que
// depende de que una caja siga encima). Cualquier botón presionado abre
// TODAS las puertas del nivel — no hay emparejamiento botón-puerta
// específico (ver puertaAbierta).
function presionarBoton(estado, pos) {
  const yaPresionado = indexDe(estado.botonesPresionados, pos) !== -1;
  const botonesPresionados = yaPresionado ? estado.botonesPresionados : [...estado.botonesPresionados, pos];
  return moverJugadorA(estado, pos, {
    botonesPresionados,
    ultimoEvento: yaPresionado ? estado.ultimoEvento : { tipo: "boton", id: Date.now() },
  });
}

// Puerta: transitable solo si algún botón fue presionado alguna vez, o si
// hay una caja ahora mismo sobre alguna placa de presión.
function manejarPuerta(estado, pos) {
  if (!puertaAbierta(estado)) return estado; // bloqueada
  return moverJugadorA(estado, pos);
}

export function puertaAbierta(estado) {
  if (estado.botonesPresionados.length > 0) return true;
  return estado.cajas.some((c) => estado.terreno[c.fila][c.columna] === PLACA_PRESION);
}

// Puente: al pisar por primera vez cualquier celda del grupo, arranca la
// cuenta regresiva (ver avanzarPuentes, que la decrementa en cada
// movimiento siguiente). Si el grupo ya colapsó, pisarlo mata como el
// vacío.
function manejarPuente(estado, pos) {
  const grupo = estado.puentes.find((p) => indexDe(p.celdas, pos) !== -1);
  if (!grupo) return moverJugadorA(estado, pos); // defensivo

  if (grupo.colapsado) {
    return reiniciarNivel(estado, { porMuerte: "puente" });
  }

  if (!grupo.activado) {
    const puentes = estado.puentes.map((p) =>
      p.id === grupo.id ? { ...p, activado: true, movimientosRestantes: DURACION_PUENTE } : p
    );
    return moverJugadorA(estado, pos, { puentes, ultimoEvento: { tipo: "puente-activado", id: Date.now() } });
  }

  return moverJugadorA(estado, pos);
}

// Post-procesamiento que envuelve calcularSiguienteEstado: decrementa los
// puentes activos en cada movimiento EXITOSO (no en los bloqueados), y
// mata al jugador si queda parado sobre uno que justo colapsa. Los puentes
// recién activados en ESTE MISMO turno (por manejarPuente) todavía no
// gastan tick — la cuenta regresiva arranca desde el turno siguiente.
function avanzarPuentes(estadoAnterior, estado) {
  if (estado === estadoAnterior) return estado; // sin efecto, no gasta turno de puente
  if (estado.estado !== "jugando") return estado; // ganó, o ya murió/reinició en este mismo paso
  if (!estado.puentes.some((p) => p.activado && !p.colapsado)) return estado;

  let colapsoAlguno = false;
  let alerta = null;
  const puentes = estado.puentes.map((p) => {
    if (!p.activado || p.colapsado) return p;

    const eraActivoAntes = estadoAnterior.puentes.find((q) => q.id === p.id)?.activado;
    if (!eraActivoAntes) return p; // recién activado este turno

    const restantes = p.movimientosRestantes - 1;
    if (restantes <= 0) {
      colapsoAlguno = true;
      return { ...p, colapsado: true, movimientosRestantes: 0 };
    }
    if (restantes <= 2) alerta = { tipo: "puente-alerta", id: `${Date.now()}-${p.id}` };
    return { ...p, movimientosRestantes: restantes };
  });

  if (!colapsoAlguno) {
    return alerta ? { ...estado, puentes, ultimoEvento: alerta } : { ...estado, puentes };
  }

  const jugadorEnPuenteColapsado = puentes.some((p) => p.colapsado && indexDe(p.celdas, estado.jugador) !== -1);
  if (jugadorEnPuenteColapsado) {
    return reiniciarNivel({ ...estado, puentes }, { porMuerte: "puente" });
  }

  return { ...estado, puentes };
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

  // Una caja puede pisar una placa de presión (de hecho es el único modo de
  // activarla) — por eso PLACA_PRESION no está en la lista de bloqueos.
  const bloqueada =
    valorSiguiente === PARED ||
    valorSiguiente === LAVA ||
    valorSiguiente === PINCHOS ||
    valorSiguiente === LASER ||
    valorSiguiente === BOTON ||
    valorSiguiente === PUERTA ||
    valorSiguiente === PUENTE ||
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

// Agrupa celdas de PUENTE contiguas (4-conectividad) en grupos independientes
// — cada uno con su propia cuenta regresiva una vez activado. Se calcula una
// sola vez al cargar el nivel (ver crearEstadoInicial).
function detectarGruposPuente(terreno) {
  const visitado = new Set();
  const grupos = [];
  let siguienteId = 0;

  for (let fila = 0; fila < terreno.length; fila++) {
    for (let columna = 0; columna < terreno[fila].length; columna++) {
      if (terreno[fila][columna] !== PUENTE) continue;
      const clave = `${fila},${columna}`;
      if (visitado.has(clave)) continue;

      const celdas = [];
      const pila = [{ fila, columna }];
      visitado.add(clave);

      while (pila.length > 0) {
        const actual = pila.pop();
        celdas.push(actual);

        const vecinos = [
          { fila: actual.fila - 1, columna: actual.columna },
          { fila: actual.fila + 1, columna: actual.columna },
          { fila: actual.fila, columna: actual.columna - 1 },
          { fila: actual.fila, columna: actual.columna + 1 },
        ];
        for (const v of vecinos) {
          if (!dentroDeLimites(terreno, v)) continue;
          const claveV = `${v.fila},${v.columna}`;
          if (visitado.has(claveV) || terreno[v.fila][v.columna] !== PUENTE) continue;
          visitado.add(claveV);
          pila.push(v);
        }
      }

      grupos.push({ id: siguienteId++, celdas, activado: false, movimientosRestantes: null, colapsado: false });
    }
  }

  return grupos;
}
