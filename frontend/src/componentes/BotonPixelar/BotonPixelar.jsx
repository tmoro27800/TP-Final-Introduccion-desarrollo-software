import { useState } from "react";
import "./BotonPixelar.css";

// Botón con 3 variantes de sprite: normal, hover (mouse encima) y activo
// (mientras se lo mantiene presionado). srcHover/srcActive son opcionales —
// si no se pasan, el botón simplemente no cambia de sprite en ese estado.
export default function BotonPixelar({ src, srcHover, srcActive, alt, onClick }) {
    const [hover, setHover] = useState(false);
    const [activo, setActivo] = useState(false);

    // onFocus/onBlur mantienen el estado "hover" también para navegación por
    // teclado (Tab), no solo mouse — así el detalle visual no depende de
    // tener mouse.
    const imagen = activo && srcActive ? srcActive : hover && srcHover ? srcHover : src;

    return (
        <button
            type="button"
            className="pixel-button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => {
                setHover(false);
                setActivo(false); // si arrastra el mouse afuera presionado, no se queda "pegado"
            }}
            onMouseDown={() => setActivo(true)}
            onMouseUp={() => setActivo(false)}
            onTouchStart={() => setActivo(true)}
            onTouchEnd={() => setActivo(false)}
            onFocus={() => setHover(true)}
            onBlur={() => {
                setHover(false);
                setActivo(false);
            }}
        >
            <img src={imagen} alt={alt} draggable={false} />
        </button>
    );
}
