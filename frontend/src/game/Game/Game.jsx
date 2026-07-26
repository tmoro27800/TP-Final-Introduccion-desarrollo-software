import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Board from "../Board/Board.jsx";
import { getLevelByIdMock } from "../../services/levelService.js";
import { prepararNivel } from "./prepararNivel.js";
import useJuego from "./useJuego.js";
import "./Game.css";

export default function Game() {
    const navigate = useNavigate();
    const { levelId } = useParams();

    const [nivel, setNivel] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
        getLevelByIdMock(levelId).then((data) => {
            const { mapa, jugadorInicial } = prepararNivel(data.mapa);
            setNivel({ ...data, mapa, jugadorInicial });
            setCargando(false);
        });
    }, [levelId]);

    if (cargando) {
        return (
            <div className="game">
                <p className="game-cargando">Cargando nivel...</p>
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
    const { jugador, movimientos, estado } = useJuego(nivel);

    const [primerMovimiento, setPrimerMovimiento] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [muertes, setMuertes] = useState(0); // todavía sin lógica, próximo paso

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

    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, "0")}`;
    };

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
                </div>

                <div className="game-tablero-wrapper">
                    <Board mapa={nivel.mapa} jugador={jugador} />
                </div>

                {estado === "ganado" && (
                    <div className="game-victoria">
                        <p>¡Completaste el nivel!</p>
                        <p className="game-victoria-detalle">
                            {movimientos} movimientos · {formatearTiempo(tiempo)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}