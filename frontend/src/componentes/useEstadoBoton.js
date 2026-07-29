import { useState } from "react";

// Hover (mouse + foco por teclado) y presionado, para botones con sprites de
// 3 estados (normal/Mouse/Click — ver assets/SpriteMenuPrincipal). Devuelve
// los flags y los handlers ya armados para spread-earlos en el <button>.
export function useEstadoBoton() {
    const [hover, setHover] = useState(false);
    const [activo, setActivo] = useState(false);

    const eventos = {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => {
            setHover(false);
            setActivo(false); // si arrastra el mouse afuera presionado, no se queda "pegado"
        },
        onMouseDown: () => setActivo(true),
        onMouseUp: () => setActivo(false),
        onTouchStart: () => setActivo(true),
        onTouchEnd: () => setActivo(false),
        onFocus: () => setHover(true),
        onBlur: () => {
            setHover(false);
            setActivo(false);
        },
    };

    return { hover, activo, eventos };
}

// Conveniencia: dado (normal, hover, activo) devuelve cuál sprite mostrar.
export function elegirSprite(hover, activo, src, srcHover, srcActive) {
    if (activo && srcActive) return srcActive;
    if (hover && srcHover) return srcHover;
    return src;
}
