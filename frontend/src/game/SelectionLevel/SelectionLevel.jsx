import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLevelsByDifficultyMock } from "../../services/levelService.js";
import BackButton from "../../components/BackButton/BackButton.jsx";
import "./SelectionLevel.css";

const NOMBRES_MODO = {
    normal: "Normal",
    dificil: "Dificil",
};

export default function SelectionLevel() {
    const navigate = useNavigate();
    const { modoId } = useParams();

    const [niveles, setNiveles] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
        getLevelsByDifficultyMock(modoId).then((data) => setNiveles(data));
    }, [modoId]);

    return (
        <div className="selection-level">
            <div className="selection-level-container">
                <BackButton label="Volver" onClick={() => navigate("/seleccion-modo")} />

                <h1>{NOMBRES_MODO[modoId] ?? modoId}</h1>

                {cargando && <p className="selection-level-cargando">Cargando niveles...</p>}

                {!cargando && niveles.length === 0 && (
                    <p className="selection-level-cargando">Todavía no hay niveles para este modo</p>
                )}

                {!cargando && niveles.length > 0 && (
                    <div className="selection-level-grid">
                        {niveles.map((nivel) => (
                            <button
                                key={nivel.id}
                                className="selection-level-celda"
                                onClick={() => navigate(`/juego/${nivel.id}`)}
                            >
                                {nivel.id}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}