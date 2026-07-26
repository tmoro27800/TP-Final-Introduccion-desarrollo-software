import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScoreRow from "../../components/ScoreRow/ScoreRow.jsx";

import { getDificultades } from "../../services/dificultadService.js";


import "./Score.css";

const PUNTAJES_MOCK = [
    { nivel: 1, dificultad: "facil", jugador: "Nacho", movimientos: 12, tiempo: 45 },
    { nivel: 1, dificultad: "facil", jugador: "Sofi", movimientos: 15, tiempo: 38 },
    { nivel: 1, dificultad: "facil", jugador: "Tomi", movimientos: 12, tiempo: 40 },
    { nivel: 1, dificultad: "facil", jugador: "Lucia", movimientos: 20, tiempo: 60 },
 
    { nivel: 1, dificultad: "normal", jugador: "Nacho", movimientos: 18, tiempo: 70 },
    { nivel: 1, dificultad: "normal", jugador: "Bauti", movimientos: 22, tiempo: 65 },
    { nivel: 1, dificultad: "normal", jugador: "Sofi", movimientos: 18, tiempo: 68 },
 
    { nivel: 2, dificultad: "facil", jugador: "Tomi", movimientos: 9, tiempo: 30 },
    { nivel: 2, dificultad: "facil", jugador: "Lucia", movimientos: 14, tiempo: 33 },
 
    { nivel: 2, dificultad: "normal", jugador: "Bauti", movimientos: 25, tiempo: 90 },
 
    { nivel: 1, dificultad: "libre", jugador: "Nacho", movimientos: 30, tiempo: 120 },
    { nivel: 1, dificultad: "libre", jugador: "Sofi", movimientos: 28, tiempo: 110 },
];

const CANTIDAD_NIVELES = 10;

export default function Score() {

    const navigate = useNavigate();

    const [nivelSeleccionado, setNivelSeleccionado] = useState(1);

    const [dificultad, setDificultad] = useState("facil");

    const niveles = Array.from({ length: CANTIDAD_NIVELES }, (_, i) => i + 1);

    // en modo libre no hay niveles, es un ranking único
    const puntajesFiltrados = PUNTAJES_MOCK.filter((p) => {
        if (dificultad === "libre") return p.dificultad === "libre";
        return p.dificultad === dificultad && p.nivel === nivelSeleccionado;
    });

    // orden combinado: primero menos movimientos, y ante empate, menor tiempo
    const puntajesOrdenados = [...puntajesFiltrados].sort((a, b) => {
        if (a.movimientos !== b.movimientos) return a.movimientos - b.movimientos;
        return a.tiempo - b.tiempo;
    });

    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, "0")}`;
    };

    return (
        <div className="score">
            <div className="score-container">
                <button className="score-volver" onClick={() => navigate("/")}>
                    <span aria-hidden="true">←</span> Volver al menú
                </button>
                <h1>Tabla de puntajes</h1>

                <div className="score-filtros">
                    <div className="score-dificultades">
                        <button
                            className={dificultad === "facil" ? "activo" : ""}
                            onClick={() => setDificultad("facil")}
                        >
                            Facil
                        </button>
                        <button
                            className={dificultad === "normal" ? "activo" : ""}
                            onClick={() => setDificultad("normal")}
                        >
                            Normal
                        </button>
                        <button
                            className={dificultad === "libre" ? "activo" : ""}
                            onClick={() => setDificultad("libre")}
                        >
                            Modo Libre
                        </button>
                    </div>

                    {dificultad !== "libre" && (
                        <select
                            name="nivel"
                            id="niveles-select"
                            value={nivelSeleccionado}
                            onChange={(e) => setNivelSeleccionado(Number(e.target.value))}
                        >
                            {niveles.map((n) => (
                                <option key={n} value={n}>
                                    Nivel {n}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="score-tabla-wrapper">
                    <table className="score-tabla">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Jugador</th>
                                <th>Cant movimientos</th>
                                <th>Tiempo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {puntajesOrdenados.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="score-vacio">
                                        Todavia no hay puntajes para este nivel/dificultad
                                    </td>
                                </tr>
                            )}
 
                            {puntajesOrdenados.map((p, index) => (
                                <ScoreRow
                                    key={`${p.jugador}-${p.nivel}-${p.dificultad}-${index}`}
                                    posicion={index + 1}
                                    nombre={p.jugador}
                                    movimientos={p.movimientos}
                                    tiempo={p.tiempo}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}