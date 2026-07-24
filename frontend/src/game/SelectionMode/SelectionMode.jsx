import { useNavigate } from "react-router-dom";
import "./SelectionMode.css";

const MODOS = [
    {
        id: "normal",
        nombre: "Modo Normal",
        descripcion: "La experiencia clásica del puzzle",
        icono: "🎮",
    },
    {
        id: "dificil",
        nombre: "Modo Difícil",
        descripcion: "Menos movimientos, más desafío",
        icono: "🔥",
    },
    {
        id: "libre",
        nombre: "Modo Libre",
        descripcion: "Jugá sin límites, a tu ritmo",
        icono: "∞",
    },
    ];

    export default function SeleccionModo() {
    const navigate = useNavigate();

    const handleSeleccionar = (modoId) => {
        navigate(`/seleccion-nivel/${modoId}`);
    };

    return (
        <div className="seleccion-modo">
        <h2>Elegí tu modo de juego</h2>

        <div className="modos-grid">
            {MODOS.map((modo) => (
            <button
                key={modo.id}
                className="modo-card"
                onClick={() => handleSeleccionar(modo.id)}
            >
                <span className="modo-icono">{modo.icono}</span>
                <span className="modo-nombre">{modo.nombre}</span>
                <span className="modo-descripcion">{modo.descripcion}</span>
            </button>
            ))}
        </div>
        </div>
    );
}