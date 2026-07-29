import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BotonVuelta from "../../componentes/BotonVuelta/BotonVuelta.jsx";
import BotonPixelar from "../../componentes/BotonPixelar/BotonPixelar.jsx";
import { useMusica } from "../Musica/MusicaContext.jsx";
import "./SeleccionModo.css";

import botonNormal from "../../assets/SpriteSeleccionModo/BotonDificultadNormal/BotonDificultadNormal.png";
import botonNormalHover from "../../assets/SpriteSeleccionModo/BotonDificultadNormal/BotonDificultadNormalHover.png";
import botonNormalClick from "../../assets/SpriteSeleccionModo/BotonDificultadNormal/BotonDificultadNormalClick.png";

import botonDificil from "../../assets/SpriteSeleccionModo/BotonDificultadDificil/BotonDificultadDificil.png";
import botonDificilHover from "../../assets/SpriteSeleccionModo/BotonDificultadDificil/BotonDificultadDificilHover.png";
import botonDificilClick from "../../assets/SpriteSeleccionModo/BotonDificultadDificil/BotonDificultadDificilClick.png";

export default function SeleccionModo() {
    const navigate = useNavigate();

    const { reproducir } = useMusica();
    useEffect(() => {
        reproducir("menu");
    }, [reproducir]);

    return (
        <div className="selection-mode">
            <div className="selection-mode-container">
                <BotonVuelta label="Volver al menú" onClick={() => navigate("/")} />

                <h1>Elegí un modo</h1>
                <p className="selection-mode-subtitulo">La dificultad define qué niveles vas a poder jugar</p>

                <div className="selection-mode-opciones">
                    <div className="selection-mode-opcion">
                        <BotonPixelar
                            src={botonNormal}
                            srcHover={botonNormalHover}
                            srcActive={botonNormalClick}
                            alt="Normal"
                            onClick={() => navigate("/seleccion-nivel/normal")}
                        />
                        <p className="selection-mode-descripcion">Ritmo pausado, ideal para practicar</p>
                    </div>
                    <div className="selection-mode-opcion">
                        <BotonPixelar
                            src={botonDificil}
                            srcHover={botonDificilHover}
                            srcActive={botonDificilClick}
                            alt="Dificil"
                            onClick={() => navigate("/seleccion-nivel/dificil")}
                        />
                        <p className="selection-mode-descripcion">Más obstáculos, menos margen de error</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
