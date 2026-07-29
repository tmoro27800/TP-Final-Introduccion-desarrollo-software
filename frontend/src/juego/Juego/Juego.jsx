import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Tablero from "../../componentes/Tablero/Tablero.jsx";
import PantallaCarga from "../../componentes/PantallaCarga/PantallaCarga.jsx";
import useJuego from "./EnEjecucion.js";
import { prepararNivel } from "./PrepararNivel.js";
import { getNivelPorId } from "../../servicios/nivelServicio.js";
import { crearPuntaje } from "../../servicios/puntajeServicio.js";
import { nivelDePrueba } from "./nivelDePrueba.js";
import { nivelDePruebaAislado } from "./nivelDePruebaAislado.js";
import "./Juego.css";

// Niveles de debug/QA que no vienen del backend (ver nivelDePrueba.js y
// nivelDePruebaAislado.js) — se accede por id fijo en vez de pedirlos a
// getNivelPorId, así se puede probar el motor sin depender de la base.
const NIVELES_LOCALES = {
    [nivelDePrueba.id]: nivelDePrueba,
    [nivelDePruebaAislado.id]: nivelDePruebaAislado,
};

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

export default function Game() {
    const navigate = useNavigate();
    const { levelId } = useParams();

    const [nivel, setNivel] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setCargando(true);
        setError(null);

        // Los niveles locales de debug (ver NIVELES_LOCALES) no pegan contra
        // el backend — sirven para probar el motor de juego completo sin
        // depender de que la base de datos esté levantada.
        const nivelLocal = NIVELES_LOCALES[levelId];
        const promesaNivel = nivelLocal ? Promise.resolve(nivelLocal) : getNivelPorId(levelId);

        promesaNivel
            .then((data) => {
                const nivelPreparado = prepararNivel(data.mapa);
                setNivel({ ...data, ...nivelPreparado });
                setCargando(false);
            })
            .catch((err) => {
                setError(err.message);
                setCargando(false);
            });
    }, [levelId]);

    if (error) {
        return (
            <div className="game">
                <p className="game-cargando">No se pudo cargar el nivel: {error}</p>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="game">
                <PantallaCarga mensaje="Cargando nivel..." />
            </div>
        );
    }

    // key={levelId}: si el usuario navega de un nivel a otro, fuerza a
    // React a desmontar y volver a montar este componente desde cero,
    // así useJuego arranca limpio (jugador, movimientos, etc.)
    return (
        <GameEngine key={levelId} nivel={nivel} onVolver={() => navigate(-1)} />
    );
}

function GameEngine({ nivel, onVolver }) {
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
    } = useJuego(nivel);

    const [primerMovimiento, setPrimerMovimiento] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [mensajeToast, setMensajeToast] = useState(null);

    // Guardado del puntaje al ganar: se pide el nombre del jugador y se
    // manda a POST /api/puntajes (ver puntajeServicio.js). nivel/dificultad
    // viajan tal cual vinieron del backend en GET /api/niveles/:id, así
    // coinciden con lo que espera la validación cruzada del backend. El
    // nivel de prueba (/juego/test) no existe en la base, así que no
    // ofrece guardar puntaje.
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

    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, "0")}`;
    };

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

                {estado === "ganado" && (
                    <div className="game-victoria">
                        <p>¡Completaste el nivel!</p>
                        <p className="game-victoria-detalle">
                            {movimientos} movimientos · {formatearTiempo(tiempo)}
                        </p>

                        {NIVELES_LOCALES[nivel.id] && <p className="game-victoria-detalle">(nivel de prueba: no se guarda puntaje)</p>}

                        {!NIVELES_LOCALES[nivel.id] && !puntajeGuardado && (
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

                        {!NIVELES_LOCALES[nivel.id] && puntajeGuardado && (
                            <div className="game-victoria-guardado">
                                <p>¡Puntaje guardado!</p>
                                <button onClick={() => navigate("/puntajes")}>
                                    Ver tabla de puntajes
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
