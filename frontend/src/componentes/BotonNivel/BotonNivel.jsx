import { useEstadoBoton, elegirSprite } from "../useEstadoBoton.js";
import botonVacio from "../../assets/SpriteMenuPrincipal/BotonVacio/BotonVacio.png";
import botonVacioHover from "../../assets/SpriteMenuPrincipal/BotonVacio/BotonVacioHover.png";
import botonVacioClick from "../../assets/SpriteMenuPrincipal/BotonVacio/BotonVacioClick.png";
import "./BotonNivel.css";

// Celda de selección de nivel: el sprite BotonVacio (normal/hover/click,
// mismo patrón que BotonPixelar) con el número de nivel superpuesto encima
// — no viene "horneado" en el sprite porque es el mismo dibujo para
// cualquier cantidad de niveles.
export default function BotonNivel({ numero, onClick }) {
    const { hover, activo, eventos } = useEstadoBoton();
    const imagen = elegirSprite(hover, activo, botonVacio, botonVacioHover, botonVacioClick);

    return (
        <button type="button" className="boton-nivel" onClick={onClick} {...eventos}>
            <img src={imagen} alt="" draggable={false} className="boton-nivel-sprite" />
            <span className="boton-nivel-numero">{numero}</span>
        </button>
    );
}
