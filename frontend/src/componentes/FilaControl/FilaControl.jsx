import "./FilaControl.css";

export default function FilaControl({ icono, label, tecla, esperando, onClick }) {
    return (
        <div className="control-row">
        <div className="control-row-info">
            <span className="control-row-icono">{icono}</span>
            <span>{label}</span>
        </div>
        <button
            className={`tecla-boton ${esperando ? "esperando" : ""}`}
            onClick={onClick}
        >
            {esperando ? "..." : tecla}
        </button>
        </div>
    );
}