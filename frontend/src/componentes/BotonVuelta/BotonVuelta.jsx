import { useEstadoBoton, elegirSprite } from "../useEstadoBoton.js";
import flecha from "../../assets/SpriteMenuPrincipal/BotonRetroceder/BotonRetroceder.png";
import flechaHover from "../../assets/SpriteMenuPrincipal/BotonRetroceder/BotonRetrocederHover.png";
import flechaClick from "../../assets/SpriteMenuPrincipal/BotonRetroceder/BotonRetrocederClick.png";
import "./BotonVuelta.css";

export default function BotonVuelta({ label, onClick, className = "" }) {
    const { hover, activo, eventos } = useEstadoBoton();
    const icono = elegirSprite(hover, activo, flecha, flechaHover, flechaClick);

    return (
        <button className={`back-button ${className}`.trim()} onClick={onClick} {...eventos}>
            <img src={icono} alt="" className="back-button-icono" draggable={false} />
            {label}
        </button>
    );
}
