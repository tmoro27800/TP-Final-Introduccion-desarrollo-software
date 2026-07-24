import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ControlRow from "../../components/ControlRow/ControlRow.jsx";
import DarkButton from "../../components/Button/Button.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import logo from "../../assets/logo/logo.png";
import "./Menu.css";

export default function Menu() {
    const navigate = useNavigate();
    const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);
    const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

    const [vistaConfig, setVistaConfig] = useState("principal"); // "principal" | "controles"
    const [teclaEsperando, setTeclaEsperando] = useState(null); // qué acción está esperando una tecla nueva
    const [controles, setControles] = useState({
        arriba: "W",
        izquierda: "A",
        abajo: "S",
        derecha: "D",
    });

    useEffect(() => {
        if (!teclaEsperando) return;

        const handleKeyDown = (e) => {
        const nuevaTecla = e.key.toUpperCase();
        setControles((prev) => ({ ...prev, [teclaEsperando]: nuevaTecla }));
        setTeclaEsperando(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [teclaEsperando]);

    const cerrarConfiguracion = () => {
        setMostrarConfiguracion(false);
        setVistaConfig("principal");
    };

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

        {/* Modal: Como jugar */}
        <Modal visible={mostrarInstrucciones} onClose={() => setMostrarInstrucciones(false)}>
            <h2>Como jugar</h2>
            <p className="instrucciones-intro">
            Mové tu personaje por el mapa para resolver el puzzle
            </p>

            <div className="controles-lista">
            <div className="control-item">
                <div className="teclas-grupo">
                <div className="teclas-fila">
                    <div className="tecla">W</div>
                </div>
                <div className="teclas-fila">
                    <div className="tecla">A</div>
                    <div className="tecla">S</div>
                    <div className="tecla">D</div>
                </div>
                </div>
                <div className="control-texto">
                <h3>WASD</h3>
                <p>Mover el personaje</p>
                </div>
            </div>

            <div className="control-item">
                <div className="teclas-grupo">
                <div className="teclas-fila">
                    <div className="tecla">↑</div>
                </div>
                <div className="teclas-fila">
                    <div className="tecla">←</div>
                    <div className="tecla">↓</div>
                    <div className="tecla">→</div>
                </div>
                </div>
                <div className="control-texto">
                <h3>Flechas</h3>
                <p>Alternativa a WASD</p>
                </div>
            </div>
            </div>
        </Modal>

        {/* Modal: Configuración (con dos vistas internas) */}
        <Modal visible={mostrarConfiguracion} onClose={cerrarConfiguracion}>
            {vistaConfig === "principal" && (
            <>
                <h2>Configuración</h2>

                <div className="config-lista">
                <div className="config-item">
                    <div className="config-info">
                    <span className="config-icono">⌨</span>
                    <div>
                        <h3>Controles</h3>
                        <p>Reasignar teclas (WASD)</p>
                    </div>
                    </div>
                    <button
                    className="config-btn-secundario"
                    onClick={() => setVistaConfig("controles")}
                    >
                    Cambiar
                    </button>
                </div>

                <div className="config-item">
                    <div className="config-info">
                    <span className="config-icono">文</span>
                    <div>
                        <h3>Idioma</h3>
                    </div>
                    </div>
                    <select className="config-select">
                    <option>Español</option>
                    <option>Inglés</option>
                    </select>
                </div>

                <div className="config-item">
                    <div className="config-info">
                    <span className="config-icono">♪</span>
                    <div>
                        <h3>Música</h3>
                    </div>
                    </div>
                    <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="config-item">
                    <div className="config-info">
                    <span className="config-icono">🔊</span>
                    <div>
                        <h3>Efectos de sonido</h3>
                    </div>
                    </div>
                    <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    </label>
                </div>
                </div>

                <button className="config-btn-guardar">Guardar cambios</button>
            </>
            )}

            {vistaConfig === "controles" && (
            <div className="reasignar-controles">
                <div className="reasignar-header">
                <button className="btn-volver" onClick={() => setVistaConfig("principal")}>
                    ‹
                </button>
                <h2>Reasignar controles</h2>
                </div>

                <p className="reasignar-hint">
                Tocá una tecla para reasignarla y presioná la nueva
                </p>

                <div className="controles-lista-reasignar">
                <ControlRow
                    icono="↑"
                    label="Mover arriba"
                    tecla={controles.arriba}
                    esperando={teclaEsperando === "arriba"}
                    onClick={() => setTeclaEsperando("arriba")}
                />
                <ControlRow
                    icono="←"
                    label="Mover izquierda"
                    tecla={controles.izquierda}
                    esperando={teclaEsperando === "izquierda"}
                    onClick={() => setTeclaEsperando("izquierda")}
                />
                <ControlRow
                    icono="↓"
                    label="Mover abajo"
                    tecla={controles.abajo}
                    esperando={teclaEsperando === "abajo"}
                    onClick={() => setTeclaEsperando("abajo")}
                />
                <ControlRow
                    icono="→"
                    label="Mover derecha"
                    tecla={controles.derecha}
                    esperando={teclaEsperando === "derecha"}
                    onClick={() => setTeclaEsperando("derecha")}
                />
                </div>

                <div className="reasignar-footer">
                <button
                    className="config-btn-secundario"
                    onClick={() =>
                    setControles({ arriba: "W", izquierda: "A", abajo: "S", derecha: "D" })
                    }
                >
                    Restaurar valores
                </button>
                <button className="config-btn-guardar" onClick={() => setVistaConfig("principal")}>
                    Guardar
                </button>
                </div>
            </div>
            )}
        </Modal>
        </div>
    );
}