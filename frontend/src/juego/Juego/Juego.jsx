import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PantallaCarga from "../../componentes/PantallaCarga/PantallaCarga.jsx";
import Nivel from "../Nivel/Nivel.jsx";
import { prepararNivel } from "./PrepararNivel.js";
import { getNivelPorId } from "../../servicios/nivelServicio.js";
import "./Juego.css";

// Wrapper de datos: solo se encarga de pedirle el nivel al backend y de los
// estados de carga/error. Toda la lógica de juego (motor, HUD, guardado de
// puntaje) vive en Nivel.jsx.
export default function Game() {
    const navigate = useNavigate();
    const { levelId } = useParams();

    const [nivel, setNivel] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setCargando(true);
        setError(null);

        getNivelPorId(levelId)
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
    // React a desmontar y volver a montar Nivel desde cero, así useJuego
    // arranca limpio (jugador, movimientos, etc.)
    return <Nivel key={levelId} nivel={nivel} onVolver={() => navigate(-1)} />;
}
