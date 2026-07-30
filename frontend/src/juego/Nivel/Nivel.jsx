import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Tablero from "../../componentes/Tablero/Tablero.jsx";
import Ventana from "../../componentes/Ventana/Ventana.jsx";
import BotonVuelta from "../../componentes/BotonVuelta/BotonVuelta.jsx";
import useJuego from "../Juego/EnEjecucion.js";
import { crearPuntaje } from "../../servicios/puntajeServicio.js";
import { getNivelesPorDificultad } from "../../servicios/nivelServicio.js";
import { PUERTA, PUERTA_CON_LLAVE } from "../Juego/tiposCelda.js";
import { useMusica } from "../Musica/MusicaContext.jsx";
import { useSonidosDeJuego } from "../Musica/useSonidosDeJuego.js";
import { useConsejos } from "../Consejos/useConsejos.js";
import "./Nivel.css";

// Texto del toast que se muestra un momento tras cada evento del motor (ver
// motorJuego.js: ultimoEvento). No cubre "reinicio-manual" a propósito (la
// tecla R ya es una acción explícita del jugador, no hace falta avisar).
//
// Antes cada mensaje llevaba un emoji de prefijo — con la tipografía pixel
// del juego se veían borrosos/desalineados (no son parte de esa fuente) y no
// aportaban nada que el texto no dijera ya. En vez de eso, cada mensaje
// declara una "categoria" que el toast usa para pintarse con un color/acento
// distinto (ver .game-toast en Nivel.css) — la misma idea que ya usa
// game-habilidad para fantasma/invulnerabilidad/fuerza, aplicada acá también.
const MENSAJES_EVENTO = {
    "muerte-lava": { texto: "Te derritió la lava — nivel reiniciado", categoria: "peligro" },
    "muerte-vacio": { texto: "Caíste al vacío — nivel reiniciado", categoria: "peligro" },
    "muerte-laser": { texto: "Te atravesó el láser — nivel reiniciado", categoria: "peligro" },
    "muerte-puente": { texto: "El puente colapsó bajo tus pies — nivel reiniciado", categoria: "peligro" },
    "caja-destruida": { texto: "Caja destruida", categoria: "logro" },
    llave: { texto: "Llave recolectada", categoria: "logro" },
    "pickup-fantasma": { texto: "Modo fantasma activado", categoria: "habilidad-fantasma" },
    "pickup-invulnerabilidad": { texto: "Invulnerabilidad activada", categoria: "habilidad-invulnerabilidad" },
    "pickup-fuerza": { texto: "Modo fuerza activado", categoria: "habilidad-fuerza" },
    pinchos: { texto: "Pinchos: +3 movimientos", categoria: "alerta" },
    boton: { texto: "Botón presionado — puerta abierta", categoria: "logro" },
    "puente-activado": { texto: "Puente activado — cruzalo rápido", categoria: "logro" },
    "puente-alerta": { texto: "El puente está por colapsar", categoria: "alerta" },
};

// Una partida en curso: motor de juego (useJuego), HUD, y guardado de
// puntaje al ganar. nivel ya viene resuelto desde Juego.jsx.
export default function Nivel({ nivel, onVolver }) {
    const navigate = useNavigate();
    const {
        jugador,
        cajas,
        llaves,
        pickups,
        totalLlaves,
        habilidadActiva,
        movimientos,
        muertes,
        estado,
        ultimoEvento,
        ultimoIntento,
        botonesPresionados,
        puentes,
        puertaAbierta,
        puertaConLlaveAbierta,
        reiniciarCompleto,
    } = useJuego(nivel);

    // nivel.dificultad ya viene como "normal"/"dificil" — coincide 1 a 1 con
    // las pistas que conoce MusicaContext, sin necesidad de mapear nada.
    const { reproducir } = useMusica();
    useEffect(() => {
        reproducir(nivel.dificultad);
    }, [reproducir, nivel.dificultad]);

    // Para que useSonidosDeJuego.js sepa si vale la pena avisar "se abrió
    // la puerta" — puertaAbierta/puertaConLlaveAbierta son banderas globales
    // del estado (no dependen de que la puerta exista en el mapa), así que
    // sin esto sonarían igual en un nivel que no tiene esa puerta.
    const tienePuerta = useMemo(() => nivel.terreno.some((fila) => fila.includes(PUERTA)), [nivel.terreno]);
    const tienePuertaConLlave = useMemo(
        () => nivel.terreno.some((fila) => fila.includes(PUERTA_CON_LLAVE)),
        [nivel.terreno]
    );

    useSonidosDeJuego({
        ultimoIntento,
        ultimoEvento,
        llaves,
        puertaAbierta,
        puertaConLlaveAbierta,
        tienePuerta,
        tienePuertaConLlave,
        estado,
    });

    // Consejos progresivos del nivel (ver useConsejos.js): se piden recién
    // la primera vez que el jugador abre el modal, no antes.
    const [mostrarConsejos, setMostrarConsejos] = useState(false);
    const { consejosRevelados, hayMas, totalConsejos, cargando: cargandoConsejos, pedirConsejos, revelarSiguiente } =
        useConsejos(nivel.id);

    // Flash rojo de pantalla completa al morir (lava/láser/vacío/puente) —
    // puramente visual, no bloquea el movimiento. Se remonta con un `key`
    // distinto por cada muerte (el propio id de ultimoEvento) para que la
    // animación CSS arranque de cero incluso si se muere dos veces seguido
    // muy rápido; se anima solo con CSS (forwards, sin JS de por medio) así
    // que no hay ningún timeout que limpiar ni riesgo de que quede pegado.
    const muerteFlashId = ultimoEvento?.tipo?.startsWith("muerte-") ? ultimoEvento.id : null;

    const [primerMovimiento, setPrimerMovimiento] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [mensajeToast, setMensajeToast] = useState(null);
    // undefined = todavía no se buscó, null = no hay siguiente nivel
    const [siguienteNivel, setSiguienteNivel] = useState(undefined);

    // Guardado del puntaje al ganar: se pide el nombre del jugador y se
    // manda a POST /api/puntajes (ver puntajeServicio.js). nivel/dificultad
    // viajan tal cual vinieron del backend en GET /api/niveles/:id, así
    // coinciden con lo que espera la validación cruzada del backend.
    const [nombreJugador, setNombreJugador] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [puntajeGuardado, setPuntajeGuardado] = useState(false);
    const [errorGuardado, setErrorGuardado] = useState(null);

    // efecto 1: detecta el primer movimiento
    useEffect(() => {
        if (movimientos > 0) setPrimerMovimiento(true);
    }, [movimientos]);

    // efecto 2: arranca el cronómetro recién después del primer movimiento,
    // y se frena solo cuando ya se ganó
    useEffect(() => {
        if (!primerMovimiento || estado === "ganado") return;
        const intervalo = setInterval(() => setTiempo((t) => t + 1), 1000);
        return () => clearInterval(intervalo);
    }, [primerMovimiento, estado]);

    // efecto 3: muestra un toast breve cada vez que el motor reporta un
    // evento nuevo (muerte, pickup, llave, caja destruida — ver motorJuego.js)
    //
    // A propósito NO se devuelve `() => clearTimeout(timeout)` como cleanup:
    // en un juego de movimientos rápidos, ultimoEvento cambia con cada paso
    // (aunque no tenga mensaje), y React ejecuta ese cleanup ANTES de la
    // siguiente pasada del efecto — cancelando el timeout que iba a esconder
    // el toast, sin llegar a programar uno nuevo (el siguiente paso no
    // siempre trae un evento con mensaje). El toast se quedaba pegado en
    // pantalla para siempre. Mismo bug ya visto y resuelto en
    // useEfectosDestruccion.js / useEfectoPowerUp.js.
    useEffect(() => {
        if (!ultimoEvento) return;
        const mensaje = MENSAJES_EVENTO[ultimoEvento.tipo];
        if (!mensaje) return;
        setMensajeToast(mensaje);
        setTimeout(() => setMensajeToast(null), 2000);
    }, [ultimoEvento]);

    // efecto 4: al ganar, busca cuál es el próximo nivel de la misma
    // dificultad (para el botón "Siguiente nivel"). GET /api/niveles ya
    // devuelve la lista ordenada por order_index, así que el nivel justo
    // después del actual en el array es el siguiente.
    useEffect(() => {
        if (estado !== "ganado") return;
        let cancelado = false;
        getNivelesPorDificultad(nivel.dificultad).then((lista) => {
            if (cancelado) return;
            const indice = lista.findIndex((n) => n.id === nivel.id);
            setSiguienteNivel(indice !== -1 && indice + 1 < lista.length ? lista[indice + 1] : null);
        });
        return () => {
            cancelado = true;
        };
    }, [estado, nivel.id, nivel.dificultad]);

    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, "0")}`;
    };

    function handleRepetirNivel() {
        reiniciarCompleto();
        setTiempo(0);
        setPrimerMovimiento(false);
        setNombreJugador("");
        setPuntajeGuardado(false);
        setErrorGuardado(null);
    }

    async function handleGuardarPuntaje(e) {
        e.preventDefault();
        const jugadorLimpio = nombreJugador.trim();
        if (!jugadorLimpio) return;

        setGuardando(true);
        setErrorGuardado(null);
        try {
            await crearPuntaje({
                nivel: nivel.id,
                dificultad: nivel.dificultad,
                jugador: jugadorLimpio,
                movimientos,
                tiempo,
            });
            setPuntajeGuardado(true);
        } catch (err) {
            setErrorGuardado(err.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="game">
            {muerteFlashId && <div key={muerteFlashId} className="game-muerte-flash" />}

            <div className="game-container">
                <div className="game-header">
                    <BotonVuelta label="Volver" onClick={onVolver} className="game-header-volver" />
                    <span className="game-titulo">{nivel.nombre}</span>
                    <button
                        type="button"
                        className="game-header-consejos"
                        onClick={() => {
                            pedirConsejos();
                            setMostrarConsejos(true);
                        }}
                    >
                        Consejos
                    </button>
                </div>

                <div className="game-stats">
                    <div className="game-stat">
                        <span className="game-stat-label">Tiempo</span>
                        <span className="game-stat-valor">{formatearTiempo(tiempo)}</span>
                    </div>
                    <div className="game-stat">
                        <span className="game-stat-label">Movs</span>
                        <span className="game-stat-valor">{movimientos}</span>
                    </div>
                    <div className="game-stat game-stat--peligro">
                        <span className="game-stat-label">Muertes</span>
                        <span className="game-stat-valor">{muertes}</span>
                    </div>
                    {totalLlaves > 0 && (
                        <div className="game-stat">
                            <span className="game-stat-label">Llaves</span>
                            <span className="game-stat-valor">
                                {totalLlaves - llaves.length}/{totalLlaves}
                            </span>
                        </div>
                    )}
                </div>

                {/* Se reserva el espacio siempre (visibility, no display) para que
                    el tablero no salte de lugar cada vez que se activa/consume
                    una habilidad. */}
                <div
                    className={`game-habilidad ${habilidadActiva ? `game-habilidad--${habilidadActiva}` : ""}`}
                    style={{ visibility: habilidadActiva ? "visible" : "hidden" }}
                >
                    Habilidad activa: {habilidadActiva || "—"}
                </div>

                <div className="game-tablero-wrapper">
                    <Tablero
                        mapa={nivel.terreno}
                        jugador={jugador}
                        cajas={cajas}
                        llaves={llaves}
                        pickups={pickups}
                        habilidadActiva={habilidadActiva}
                        ultimoIntento={ultimoIntento}
                        ultimoEvento={ultimoEvento}
                        movimientos={movimientos}
                        botonesPresionados={botonesPresionados}
                        puentes={puentes}
                        puertaAbierta={puertaAbierta}
                        puertaConLlaveAbierta={puertaConLlaveAbierta}
                    />
                </div>

                {mensajeToast && (
                    <div className={`game-toast game-toast--${mensajeToast.categoria}`}>{mensajeToast.texto}</div>
                )}

                {/* Consejos progresivos (ver useConsejos.js): se van revelando de a
                    uno con el botón de abajo, no vienen todos de entrada. */}
                <Ventana visible={mostrarConsejos} onClose={() => setMostrarConsejos(false)}>
                    <h2>Consejos</h2>

                    {cargandoConsejos && <p className="consejos-vacio">Cargando...</p>}

                    {!cargandoConsejos && totalConsejos === 0 && (
                        <p className="consejos-vacio">Este nivel todavía no tiene consejos cargados.</p>
                    )}

                    {!cargandoConsejos && totalConsejos > 0 && (
                        <div className="consejos-lista">
                            {consejosRevelados.map((consejo, indice) => (
                                <div className="consejo-item" key={consejo.id}>
                                    <span className="consejo-numero">{indice + 1}</span>
                                    <p>{consejo.texto}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {hayMas && (
                        <button type="button" className="consejos-boton-siguiente" onClick={revelarSiguiente}>
                            Ver siguiente consejo ({consejosRevelados.length}/{totalConsejos})
                        </button>
                    )}
                </Ventana>

                {/* Modal centrado con el resto de la pantalla de fondo, igual que
                    los modales de Configuración/Cómo jugar del menú (Ventana.jsx).
                    onClose=onVolver: cerrarlo (✕ o click afuera) vuelve al menú
                    anterior, igual que el botón "Volver" del header. */}
                <Ventana visible={estado === "ganado"} onClose={onVolver}>
                    <div className="game-victoria-contenido">
                        <h2 className="game-victoria-titulo">¡Completaste el nivel!</h2>
                        <p className="game-victoria-detalle">
                            {movimientos} movimientos · {formatearTiempo(tiempo)}
                        </p>

                        {!puntajeGuardado && (
                            <form className="game-victoria-form" onSubmit={handleGuardarPuntaje}>
                                <input
                                    type="text"
                                    maxLength={50}
                                    placeholder="Tu nombre"
                                    value={nombreJugador}
                                    onChange={(e) => setNombreJugador(e.target.value)}
                                    disabled={guardando}
                                    autoFocus
                                />
                                <button type="submit" disabled={guardando || !nombreJugador.trim()}>
                                    {guardando ? "Guardando..." : "Guardar puntaje"}
                                </button>
                                {errorGuardado && (
                                    <p className="game-victoria-error">{errorGuardado}</p>
                                )}
                            </form>
                        )}

                        {puntajeGuardado && (
                            <div className="game-victoria-guardado">
                                <p>¡Puntaje guardado!</p>
                                <button onClick={() => navigate("/puntajes")}>
                                    Ver tabla de puntajes
                                </button>
                            </div>
                        )}

                        {/* Siempre disponibles al ganar, se haya guardado el puntaje o no. */}
                        <div className="game-victoria-acciones">
                            <button className="game-victoria-accion" onClick={() => navigate("/")}>
                                Menú principal
                            </button>
                            <button className="game-victoria-accion" onClick={handleRepetirNivel}>
                                Repetir nivel
                            </button>
                            {siguienteNivel && (
                                <button
                                    className="game-victoria-accion game-victoria-accion--principal"
                                    onClick={() => navigate(`/juego/${siguienteNivel.id}`)}
                                >
                                    Siguiente nivel →
                                </button>
                            )}
                        </div>
                    </div>
                </Ventana>
            </div>
        </div>
    );
}
