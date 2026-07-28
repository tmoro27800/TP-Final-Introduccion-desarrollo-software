import { useEstadoBoton, elegirSprite } from "../useEstadoBoton.js";
import flecha from "../../assets/SpriteMenuPrincipal/BotonRetroceder.png";
import flechaHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonRetroceder.png";
import flechaClick from "../../assets/SpriteMenuPrincipal/Click/BotonRetroceder.png";
import "./BotonVuelta.css";

export default function BotonVuelta({ label, onClick }) {
    const { hover, activo, eventos } = useEstadoBoton();
    const icono = elegirSprite(hover, activo, flecha, flechaHover, flechaClick);

    return (
        <button className="back-button" onClick={onClick} {...eventos}>
            <img src={icono} alt="" className="back-button-icono" draggable={false} />
            {label}
        </button>
    );
}
