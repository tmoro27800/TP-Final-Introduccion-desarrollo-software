import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tablero from "../../componentes/Tablero/Tablero.jsx";
import Ventana from "../../componentes/Ventana/Ventana.jsx";
import useJuego from "../Juego/EnEjecucion.js";
import { crearPuntaje } from "../../servicios/puntajeServicio.js";
import { getNivelesPorDificultad } from "../../servicios/nivelServicio.js";
import "./Nivel.css";

// Texto del toast que se muestra un momento tras cada evento del motor
// (ver motorJuego.js: ultimoEvento). No cubre "reinicio-manual" a propósito
// (la tecla R ya es una acción explícita del jugador, no hace falta avisar).
const MENSAJES_EVENTO = {
    "muerte-lava": "💀 Te derritió la lava — nivel reiniciado",
    "muerte-vacio": "💀 Caíste al vacío — nivel reiniciado",
    "caja-destruida": "📦 Caja destruida",
    llave: "🔑 Llave recolectada",
    "pickup-fantasma": "👻 Modo fantasma activado",
    "pickup-invulnerabilidad": "✨ Invulnerabilidad activada",
    "pickup-fuerza": "💥 Modo fuerza activado",
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
        reiniciarCompleto,
    } = useJuego(nivel);

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
    useEffect(() => {
        if (!ultimoEvento) return;
        const mensaje = MENSAJES_EVENTO[ultimoEvento.tipo];
        if (!mensaje) return;
        setMensajeToast(mensaje);
        const timeout = setTimeout(() => setMensajeToast(null), 2000);
        return () => clearTimeout(timeout);
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
            <div className="game-container">
                <div className="game-header">
                    <button className="game-volver" onClick={onVolver}>
                        <span aria-hidden="true">←</span> Volver
                    </button>
                    <span className="game-titulo">{nivel.nombre}</span>
                    <button className="game-pausa" aria-label="Pausar">
                        <span aria-hidden="true">‖</span>
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
                    <Tablero mapa={nivel.terreno} jugador={jugador} cajas={cajas} llaves={llaves} pickups={pickups} />
                </div>

                {mensajeToast && <div className="game-toast">{mensajeToast}</div>}

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
