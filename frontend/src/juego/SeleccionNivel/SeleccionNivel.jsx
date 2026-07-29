import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BotonVuelta from "../../componentes/BotonVuelta/BotonVuelta.jsx";
import BotonNivel from "../../componentes/BotonNivel/BotonNivel.jsx";
import PantallaCarga from "../../componentes/PantallaCarga/PantallaCarga.jsx";

import { getNivelesPorDificultad } from "../../servicios/nivelServicio.js";
import { useMusica } from "../Musica/MusicaContext.jsx";
import "./SeleccionNivel.css";


// modoId llega en minúsculas desde la URL (/seleccion-nivel/normal|dificil,
// ver App.jsx) — esto es solo para mostrarlo lindo en el título.
const NOMBRE_MODO = {
    normal: "Normal",
    dificil: "Dificil",
};

export default function SeleccionNivel() {
    const navigate = useNavigate();
    const { modoId } = useParams();

    const [niveles, setNiveles] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { reproducir } = useMusica();
    useEffect(() => {
        reproducir("menu");
    }, [reproducir]);

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

                <h1>Niveles {NOMBRE_MODO[modoId] ?? modoId}</h1>

                {cargando && <PantallaCarga mensaje="Cargando niveles..." />}

                {!cargando && niveles.length === 0 && (
                    <p className="selection-level-cargando">Todavía no hay niveles para este modo</p>
                )}

                {!cargando && niveles.length > 0 && (
                    <div className="selection-level-grid">
                        {niveles.map((nivel) => (
                            <BotonNivel key={nivel.id} numero={nivel.id} onClick={() => navigate(`/juego/${nivel.id}`)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}