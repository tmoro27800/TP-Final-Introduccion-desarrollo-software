import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilaControl from "../../componentes/FilaControl/FilaControl.jsx";
import BotonPixelar from "../../componentes/BotonPixelar/BotonPixelar.jsx";
import Ventana from "../../componentes/Ventana/Ventana.jsx";
import { useConfiguracion } from "../Configuracion/ConfiguracionContext.jsx";
import { MECANICAS, resolverVisual } from "./mecanicasInfo.js";
import "../../componentes/Tablero/Tablero.css";

import titulo from "../../assets/SpriteMenuPrincipal/Titulo.png";

import botonJugar from "../../assets/SpriteMenuPrincipal/BotonJugar.png";
import botonJugarHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonJugar.png";
import botonJugarClick from "../../assets/SpriteMenuPrincipal/Click/BotonJugar.png";

import botonLeaderboard from "../../assets/SpriteMenuPrincipal/BotonLeaderboard.png";
import botonLeaderboardHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonLeaderboard.png";
import botonLeaderboardClick from "../../assets/SpriteMenuPrincipal/Click/BotonLeaderboard.png";

import botonAyuda from "../../assets/SpriteMenuPrincipal/BotonAyuda.png";
import botonAyudaHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonAyuda.png";
import botonAyudaClick from "../../assets/SpriteMenuPrincipal/Click/BotonAyuda.png";

import botonConfiguracion from "../../assets/SpriteMenuPrincipal/BotonConfiguracion.png";
import botonConfiguracionHover from "../../assets/SpriteMenuPrincipal/Mouse/BotonConfiguracion.png";
import botonConfiguracionClick from "../../assets/SpriteMenuPrincipal/Click/BotonConfiguracion.png";

import "./Menu.css";

export default function Menu() {
    const navigate = useNavigate();
    const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);
    const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

    // "Como jugar" tiene dos vistas internas: controles (teclas) y
    // mecánicas (glosario de estructuras del mapa) — mismo patrón que ya
    // usa el modal de Configuración con vistaConfig.
    const [vistaAyuda, setVistaAyuda] = useState("controles"); // "controles" | "mecanicas"

    const [vistaConfig, setVistaConfig] = useState("principal"); // "principal" | "controles"
    const [teclaEsperando, setTeclaEsperando] = useState(null); // qué acción está esperando una tecla nueva

    // Controles/audio/idioma viven en ConfiguracionContext (sesión-only,
    // ver ConfiguracionContext.jsx) — no en estado local — para que el
    // resto de la app (ej. EnEjecucion.js) vea los mismos valores.
    const { controles, actualizarControl, restaurarControles, audio, actualizarAudio, idioma, setIdioma } =
        useConfiguracion();

    useEffect(() => {
        if (!teclaEsperando) return;

        const handleKeyDown = (e) => {
        const nuevaTecla = e.key.toUpperCase();
        actualizarControl(teclaEsperando, nuevaTecla);
        setTeclaEsperando(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [teclaEsperando, actualizarControl]);

    const cerrarConfiguracion = () => {
        setMostrarConfiguracion(false);
        setVistaConfig("principal");
    };

    const cerrarInstrucciones = () => {
        setMostrarInstrucciones(false);
        setVistaAyuda("controles");
    };

    return (
        <div className="menu">
            <div className="menu-titulo-wrapper">
                <img src={titulo} alt="Cube of Stars" className="menu-titulo" />
            </div>

            <nav className="menu-botones">
                <div className="menu-boton-fila">
                    <BotonPixelar
                        src={botonJugar}
                        srcHover={botonJugarHover}
                        srcActive={botonJugarClick}
                        alt="Jugar"
                        onClick={() => navigate("/seleccion-modo")}
                    />
                </div>

                <div className="menu-botones-fila">
                    <BotonPixelar
                        src={botonLeaderboard}
                        srcHover={botonLeaderboardHover}
                        srcActive={botonLeaderboardClick}
                        alt="Tabla de puntajes"
                        onClick={() => navigate("/puntajes")}
                    />
                    <BotonPixelar
                        src={botonAyuda}
                        srcHover={botonAyudaHover}
                        srcActive={botonAyudaClick}
                        alt="Como jugar"
                        onClick={() => setMostrarInstrucciones(true)}
                    />
                    <BotonPixelar
                        src={botonConfiguracion}
                        srcHover={botonConfiguracionHover}
                        srcActive={botonConfiguracionClick}
                        alt="Configurar"
                        onClick={() => setMostrarConfiguracion(true)}
                    />
                </div>
            </nav>

            {/* Modal: Como jugar */}
            <Ventana visible={mostrarInstrucciones} onClose={cerrarInstrucciones}>
                <h2>Como jugar</h2>

                <div className="ayuda-tabs">
                <button
                    type="button"
                    className={`ayuda-tab ${vistaAyuda === "controles" ? "ayuda-tab--activa" : ""}`}
                    onClick={() => setVistaAyuda("controles")}
                >
                    Controles
                </button>
                <button
                    type="button"
                    className={`ayuda-tab ${vistaAyuda === "mecanicas" ? "ayuda-tab--activa" : ""}`}
                    onClick={() => setVistaAyuda("mecanicas")}
                >
                    Mecánicas
                </button>
                </div>

                {vistaAyuda === "controles" && (
                <>
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

                    <div className="control-item">
                        <div className="teclas-grupo">
                        <div className="teclas-fila">
                            <div className="tecla">R</div>
                        </div>
                        </div>
                        <div className="control-texto">
                        <h3>R</h3>
                        <p>Reiniciar el nivel</p>
                        </div>
                    </div>
                    </div>
                </>
                )}

                {vistaAyuda === "mecanicas" && (
                <div className="mecanicas-lista">
                    {MECANICAS.map((mecanica) => {
                    const visual = resolverVisual(mecanica.valor);
                    return (
                        <div className="mecanica-item" key={mecanica.valor}>
                        <div className="mecanica-icono">
                            {visual?.tipo === "img" && (
                            <img src={visual.src} alt="" draggable={false} className="tablero-celda" />
                            )}
                            {visual?.tipo === "llave" && (
                            <div className="tablero-llave" style={{ width: "100%", height: "100%" }} />
                            )}
                            {visual?.tipo === "css" && (
                            <div
                                className={`tablero-celda tablero-celda--${visual.clase}${
                                visual.modificador ? ` tablero-celda--${visual.clase}--${visual.modificador}` : ""
                                }`}
                            />
                            )}
                        </div>
                        <div className="mecanica-texto">
                            <h3>{mecanica.nombre}</h3>
                            <p>{mecanica.descripcion}</p>
                        </div>
                        </div>
                    );
                    })}
                </div>
                )}
            </Ventana>

            {/* Modal: Configuración (con dos vistas internas) */}
            <Ventana visible={mostrarConfiguracion} onClose={cerrarConfiguracion}>
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
                        <select
                        className="config-select"
                        value={idioma}
                        onChange={(e) => setIdioma(e.target.value)}
                        >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
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
                        <input
                            type="checkbox"
                            checked={audio.musica}
                            onChange={(e) => actualizarAudio("musica", e.target.checked)}
                        />
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
                        <input
                            type="checkbox"
                            checked={audio.efectos}
                            onChange={(e) => actualizarAudio("efectos", e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        </label>
                    </div>
                    </div>

                    <button className="config-btn-guardar" onClick={cerrarConfiguracion}>
                        Guardar cambios
                    </button>
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
                    <FilaControl
                        icono="↑"
                        label="Mover arriba"
                        tecla={controles.arriba}
                        esperando={teclaEsperando === "arriba"}
                        onClick={() => setTeclaEsperando("arriba")}
                    />
                    <FilaControl
                        icono="←"
                        label="Mover izquierda"
                        tecla={controles.izquierda}
                        esperando={teclaEsperando === "izquierda"}
                        onClick={() => setTeclaEsperando("izquierda")}
                    />
                    <FilaControl
                        icono="↓"
                        label="Mover abajo"
                        tecla={controles.abajo}
                        esperando={teclaEsperando === "abajo"}
                        onClick={() => setTeclaEsperando("abajo")}
                    />
                    <FilaControl
                        icono="→"
                        label="Mover derecha"
                        tecla={controles.derecha}
                        esperando={teclaEsperando === "derecha"}
                        onClick={() => setTeclaEsperando("derecha")}
                    />
                    </div>

                    <div className="reasignar-footer">
                    <button className="config-btn-secundario" onClick={restaurarControles}>
                        Restaurar valores
                    </button>
                    <button className="config-btn-guardar" onClick={() => setVistaConfig("principal")}>
                        Guardar
                    </button>
                    </div>
                </div>
                )}
            </Ventana>
        </div>
    );
}