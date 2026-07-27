import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilaPuntaje from "../../componentes/FilaPuntaje/FilaPuntaje.jsx";
import { getNivelesPorDificultad } from "../../servicios/nivelServicio.js";
import { getPuntajesPorNivel } from "../../servicios/puntajeServicio.js";

export default function Puntaje() {
    const navigate = useNavigate();

    const [dificultad, setDificultad] = useState("normal");
    const [niveles, setNiveles] = useState([]);
    const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
    const [puntajes, setPuntajes] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Al cambiar de dificultad, trae los niveles de esa dificultad para
    // poblar el <select> y selecciona el primero por defecto.
    useEffect(() => {
        setNiveles([]);
        setNivelSeleccionado(null);
        getNivelesPorDificultad(dificultad).then((data) => {
            setNiveles(data);
            setNivelSeleccionado(data[0]?.id ?? null);
        });
    }, [dificultad]);

    // Al cambiar de nivel (o dificultad), trae los puntajes de ese par.
    useEffect(() => {
        if (!nivelSeleccionado) {
            setPuntajes([]);
            setCargando(false);
            return;
        }
        setCargando(true);
        getPuntajesPorNivel(nivelSeleccionado, dificultad).then((data) => {
            setPuntajes(data);
            setCargando(false);
        });
    }, [nivelSeleccionado, dificultad]);

    // orden combinado: primero menos movimientos, y ante empate, menor tiempo
    // (el backend ya lo devuelve ordenado así, pero no cuesta nada repetirlo acá)
    const puntajesOrdenados = [...puntajes].sort((a, b) => {
        if (a.movimientos !== b.movimientos) return a.movimientos - b.movimientos;
        return a.tiempo - b.tiempo;
    });

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

                    {niveles.length > 0 && (
                        <select
                            name="nivel"
                            id="niveles-select"
                            value={nivelSeleccionado ?? ""}
                            onChange={(e) => setNivelSeleccionado(Number(e.target.value))}
                        >
                            {niveles.map((n) => (
                                <option key={n.id} value={n.id}>
                                    {n.nombre}
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
                            {!cargando && niveles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="score-vacio">
                                        Todavía no hay niveles para esta dificultad
                                    </td>
                                </tr>
                            )}

                            {!cargando && niveles.length > 0 && puntajesOrdenados.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="score-vacio">
                                        Todavia no hay puntajes para este nivel/dificultad
                                    </td>
                                </tr>
                            )}

                            {puntajesOrdenados.map((p, index) => (
                                <FilaPuntaje
                                    key={`${p.jugador}-${index}`}
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
