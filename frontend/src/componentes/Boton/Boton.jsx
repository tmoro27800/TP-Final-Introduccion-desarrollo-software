import "./Button.css";
/**
 * DarkButton
 * Botón reutilizable con estilo oscuro predefinido.
 *
 * Props:
 * @param {React.ReactNode} children - Contenido del botón (texto, ícono, o ambos).
 *   Es lo que se coloca entre las etiquetas al usarlo, ej: <DarkButton>Jugar</DarkButton>
 * @param {Function} onClick - Función que se ejecuta al hacer click en el botón.
 * @param {boolean} [disabled=false] - Si es true, deshabilita el botón (no clickeable).
 * @param {string} [type="button"] - Tipo de botón HTML nativo.
 *   Se deja "button" por defecto para evitar que, si el botón está dentro de un <form>,
 *   dispare un submit accidental (comportamiento por defecto del navegador si no se especifica).
 *
 * Ejemplo de uso:
 * <DarkButton onClick={() => navigate('/juego')}>Jugar</DarkButton>
 * <DarkButton onClick={handleGuardar} disabled={!nombreValido}>Guardar</DarkButton>
 */
export default function Boton({ children, onClick, disabled, type="button" }) {
    return (
        <button 
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="dark-button"
        >
        {children}
        </button>
    );
}