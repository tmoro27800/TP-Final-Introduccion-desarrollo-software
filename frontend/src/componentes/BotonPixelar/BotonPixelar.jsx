import { useEstadoBoton, elegirSprite } from "../useEstadoBoton.js";
import "./BotonPixelar.css";

// Botón con 3 variantes de sprite: normal, hover (mouse encima) y activo
// (mientras se lo mantiene presionado). srcHover/srcActive son opcionales —
// si no se pasan, el botón simplemente no cambia de sprite en ese estado.
export default function BotonPixelar({ src, srcHover, srcActive, alt, onClick }) {
    const { hover, activo, eventos } = useEstadoBoton();
    const imagen = elegirSprite(hover, activo, src, srcHover, srcActive);

    return (
        <button type="button" className="pixel-button" onClick={onClick} {...eventos}>
            <img src={imagen} alt={alt} draggable={false} />
        </button>
    );
}
