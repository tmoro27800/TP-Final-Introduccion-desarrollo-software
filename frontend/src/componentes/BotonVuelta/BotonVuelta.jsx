import { useEstadoBoton, elegirSprite } from "../useEstadoBoton.js";
import flecha from "../../assets/SpriteMenuPrincipal/BotonRetroceder/BotonRetroceder.png";
import flechaHover from "../../assets/SpriteMenuPrincipal/BotonRetroceder/BotonRetrocederHover.png";
import flechaClick from "../../assets/SpriteMenuPrincipal/BotonRetroceder/BotonRetrocederClick.png";
import "./BotonVuelta.css";

// label es opcional: sin él, el botón es solo el sprite (que ya trae su
// propio marco dibujado, no una flecha suelta) — usado en las pantallas
// donde no tiene sentido un texto al lado (selección de modo/nivel, tabla
// de puntajes, ver los .back-button--flotante correspondientes). Como el
// texto visible desaparece en ese caso, aria-label mantiene un nombre
// accesible para lectores de pantalla.
export default function BotonVuelta({ label, onClick, className = "" }) {
    const { hover, activo, eventos } = useEstadoBoton();
    const icono = elegirSprite(hover, activo, flecha, flechaHover, flechaClick);

    return (
        <button
            className={`back-button ${className}`.trim()}
            onClick={onClick}
            aria-label={label || "Volver"}
            {...eventos}
        >
            <img src={icono} alt="" className="back-button-icono" draggable={false} />
            {label}
        </button>
    );
}
