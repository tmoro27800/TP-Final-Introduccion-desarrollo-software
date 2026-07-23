import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkButton from "../../components/Button/Button.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import logo from "../../assets/logo/logo.png";
import "./Menu.css";

export default function Menu() {
    const navigate = useNavigate();
    const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);
    const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

    return (
        <div className="menu">
        <div className="menu-logo-wrapper">
            <img src={logo} alt="Cube of Stars" className="menu-logo" />
        </div>

        <nav className="menu-botones">
            <DarkButton onClick={() => navigate("/seleccion-modo")}>Jugar</DarkButton>
            <DarkButton onClick={() => navigate("/puntajes")}>Tabla de puntajes</DarkButton>
            <DarkButton onClick={() => setMostrarInstrucciones(true)}>Como jugar</DarkButton>
            <DarkButton onClick={() => setMostrarConfiguracion(true)}>Configurar</DarkButton>
        </nav>

        <Modal visible={mostrarInstrucciones} onClose={() => setMostrarInstrucciones(false)}>
            <h2>Como jugar</h2>
            <p>Instrucciones del puzzle acá...</p>
        </Modal>

        <Modal visible={mostrarConfiguracion} onClose={() => setMostrarConfiguracion(false)}>
            <h2>Configuración</h2>
            <p>Opciones de sonido, controles, etc.</p>
        </Modal>
        </div>
    );
}