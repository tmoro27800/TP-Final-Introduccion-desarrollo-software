import "./Ventana.css";

export default function Ventana({ visible, onClose, children }) {
    // Si "visible" es false, el componente no renderiza nada — literal null
    if (!visible) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={onClose}>✕</button>
            {children}
        </div>
        </div>
    );
}