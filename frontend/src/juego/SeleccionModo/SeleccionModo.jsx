import { useNavigate } from "react-router-dom";
import BackButton from "../../componentes/BotonVuelta/BotonVuelta.jsx";
import "./SelectionMode.css";

export default function SeleccionModo() {
    const navigate = useNavigate();

    return (
        <div className="selection-mode">
            <div className="selection-mode-container">
                <BackButton label="Volver al menú" onClick={() => navigate("/")} />

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

                    <button
                        className="selection-mode-boton selection-mode-boton--libre"
                        disabled
                    >
                        <span className="selection-mode-icono" aria-hidden="true"></span>
                        <span className="selection-mode-texto">
                            <span className="selection-mode-titulo">Modo Libre</span>
                            <span className="selection-mode-subtitulo">
                                Ranking único, sin niveles fijos
                            </span>
                        </span>
                        <span className="selection-mode-badge">Próximamente</span>
                    </button>
                </div>
            </div>
        </div>
    );
}