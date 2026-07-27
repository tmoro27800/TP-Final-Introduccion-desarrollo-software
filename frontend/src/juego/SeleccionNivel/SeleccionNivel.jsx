import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BotonVuelta from "../../componentes/BotonVuelta/BotonVuelta.jsx";

import { getNivelesPorDificultad } from "../../servicios/nivelServicio.js";


export default function SeleccionNivel() {
    const navigate = useNavigate();
    const { modoId } = useParams();

    const [niveles, setNiveles] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
        getNivelesPorDificultad(modoId).then((niveles) => {
            setNiveles(niveles);
            setCargando(false);
        });
    }, [modoId]);

    return (
        <div className="selection-level">
            <div className="selection-level-container">
                <BotonVuelta label="Volver" onClick={() => navigate("/seleccion-modo")} />

                <h1></h1>

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