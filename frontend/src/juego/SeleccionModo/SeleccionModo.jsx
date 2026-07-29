import { useNavigate } from "react-router-dom";
import BotonVuelta from "../../componentes/BotonVuelta/BotonVuelta.jsx";
import "./SeleccionModo.css";

export default function SeleccionModo() {
    const navigate = useNavigate();

    return (
        <div className="selection-mode">
            <div className="selection-mode-container">
                <BotonVuelta label="Volver al menú" onClick={() => navigate("/")} />

                <h1>Elegí un modo</h1>

                <div className="selection-mode-opciones">
                    <button
                        className="selection-mode-boton selection-mode-boton--normal"
                        onClick={() => navigate("/seleccion-nivel/normal")}
                    >
                        <span className="selection-mode-icono" aria-hidden="true"></span>
                        <span className="selection-mode-texto">
                            <span className="selection-mode-titulo">Normal</span>
                            <span className="selection-mode-subtitulo">
                                Ritmo pausado, ideal para practicar
                            </span>
                        </span>
                    </button>

                    <button
                        className="selection-mode-boton selection-mode-boton--dificil"
                        onClick={() => navigate("/seleccion-nivel/dificil")}
                    >
                        <span className="selection-mode-icono" aria-hidden="true"></span>
                        <span className="selection-mode-texto">
                            <span className="selection-mode-titulo">Dificil</span>
                            <span className="selection-mode-subtitulo">
                                Más obstáculos, menos margen de error
                            </span>
                        </span>
                    </button>
                </div>

                {/* Debug/QA: niveles hardcodeados con las 8 mecánicas nuevas
                    (cajas, fantasma, teletransportador, invulnerabilidad,
                    lava, vacío, llaves, fuerza), no dependen del backend.
                    Ver frontend/src/juego/Juego/nivelDePrueba.js y
                    nivelDePruebaAislado.js. */}
                <div className="selection-mode-debug-fila">
                    <button
                        className="selection-mode-debug"
                        onClick={() => navigate("/juego/test")}
                    >
                        🧪 Nivel de prueba (recorrido completo)
                    </button>
                    <button
                        className="selection-mode-debug"
                        onClick={() => navigate("/juego/test-aislado")}
                    >
                        🧪 Nivel de prueba (mecánicas aisladas)
                    </button>
                </div>
            </div>
        </div>
    );
}