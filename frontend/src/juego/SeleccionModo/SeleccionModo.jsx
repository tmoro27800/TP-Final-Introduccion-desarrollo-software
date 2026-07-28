import { useNavigate } from "react-router-dom";
import BotonVuelta from "../../componentes/BotonVuelta/BotonVuelta.jsx";
import BotonPixelar from "../../componentes/BotonPixelar/BotonPixelar.jsx";
import "./SeleccionModo.css";

import botonNormal from "../../assets/SpriteMenuPrincipal/BotonDificultadNormal.png";
import botonNormalHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonDificultadNormal.png";
import botonNormalClick from "../../assets/SpriteMenuPrincipal/Click/BotonDificultadNormal.png";

import botonDificil from "../../assets/SpriteMenuPrincipal/BotonDificultadDificil.png";
import botonDificilHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonDificultadDificil.png";
import botonDificilClick from "../../assets/SpriteMenuPrincipal/Click/BotonDificultadDificil.png";

export default function SeleccionModo() {
    const navigate = useNavigate();

    return (
        <div className="selection-mode">
            <div className="selection-mode-container">
                <BotonVuelta label="Volver al menú" onClick={() => navigate("/")} />

                <h1>Elegí un modo</h1>

                <div className="selection-mode-opciones">
                    <BotonPixelar
                        src={botonNormal}
                        srcHover={botonNormalHover}
                        srcActive={botonNormalClick}
                        alt="Normal"
                        onClick={() => navigate("/seleccion-nivel/normal")}
                    />
                    <BotonPixelar
                        src={botonDificil}
                        srcHover={botonDificilHover}
                        srcActive={botonDificilClick}
                        alt="Dificil"
                        onClick={() => navigate("/seleccion-nivel/dificil")}
                    />
                </div>
            </div>
        </div>
    );
}
