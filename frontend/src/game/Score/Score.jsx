import { useState, useEffect } from "react";
import ScoreRow from "../../components/ScoreRow/ScoreRow.jsx";

import "./Score.css";

export default function Puntajes() {
    const [dificultades, setDificultades] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [dificultadId, setDificultadId] = useState(null);
    const [nivelId, setNivelId] = useState(null);
    const [scores, setScores] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 1. Al montar, traer todas las dificultades
    useEffect(() => {
        getDificultades().then((data) => {
        setDificultades(data);
        if (data.length > 0) setDificultadId(data[0].id); // selecciona la primera por defecto
        });
    }, []);

    // 2. Cuando cambia la dificultad, traer los niveles de esa dificultad
    useEffect(() => {
        if (!dificultadId) return;
        getNivelesPorDificultad(dificultadId).then((data) => {
        setNiveles(data);
        if (data.length > 0) setNivelId(data[0].id); // selecciona el primer nivel por defecto
        });
    }, [dificultadId]);

    // 3. Cuando cambia el nivel, traer los puntajes de ese nivel
    useEffect(() => {
        if (!nivelId) return;
        setCargando(true);
        getScoresPorNivel(nivelId).then((data) => {
        setScores(data);
        setCargando(false);
        });
    }, [nivelId]);

    const dificultadActual = dificultades.find((d) => d.id === dificultadId);

    return (
        <div className="puntajes">
        <div className="puntajes-header">
            <div className="puntajes-titulo">
            <span className="puntajes-icono">🏆</span>
            <h2>Puntajes</h2>
            </div>

            <select
            className="puntajes-select"
            value={nivelId || ""}
            onChange={(e) => setNivelId(Number(e.target.value))}
            >
            {niveles.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>
                {nivel.name}
                </option>
            ))}
            </select>
        </div>

        <div className="puntajes-tabs">
            {dificultades.map((dif) => (
            <button
                key={dif.id}
                className={`puntajes-tab ${dif.id === dificultadId ? "activo" : ""}`}
                onClick={() => setDificultadId(dif.id)}
            >
                {dif.nombre}
            </button>
            ))}
        </div>

        <div className="puntajes-columnas">
            <span>#</span>
            <span>Jugador</span>
            <span className="alinear-derecha">Mov.</span>
            <span className="alinear-derecha">Tiempo</span>
        </div>

        {cargando && <p className="puntajes-vacio">Cargando...</p>}

        {!cargando && scores.length === 0 && (
            <p className="puntajes-vacio">Todavía nadie completó este nivel</p>
        )}

        {!cargando &&
            scores.map((score, index) => (
            <ScoreRow
                key={score.id}
                posicion={index + 1}
                nombre={score.player_name}
                movimientos={score.moves}
                tiempo={score.time_seconds}
            />
            ))}
        </div>
    );
}