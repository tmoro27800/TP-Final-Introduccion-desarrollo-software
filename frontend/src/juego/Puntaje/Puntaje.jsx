import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilaPuntaje from "../../componentes/FilaPuntaje/FilaPuntaje.jsx";

export default function Puntaje() {

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
                            className={dificultad === "normal" ? "activo" : ""}
                            onClick={() => setDificultad("normal")}
                        >
                            Normal
                        </button>
                        <button
                            className={dificultad === "dificil" ? "activo" : ""}
                            onClick={() => setDificultad("dificil")}
                        >
                            Difícil
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