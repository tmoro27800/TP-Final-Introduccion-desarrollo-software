import { useLocation } from "react-router-dom";
import BackgroundMenu from "./BackgroundMenu/BackgroundMenu.jsx";
import { BackgroundLevel } from "./BackgroundLevel/BackgroundLevel.jsx"; // TODO: ajustar nombre/ruta si tu Fondo 2 se llama distinto
import "./AppBackground.css";

// Único lugar que hay que tocar para decidir qué pantallas usan el Fondo 2 (niveles).
// Todo lo que no matchee acá usa el Fondo 1 (menú) por defecto.
const RUTAS_FONDO_NIVEL = ["/juego"];

export default function AppBackground() {
    const location = useLocation();

    const esPantallaDeNivel = RUTAS_FONDO_NIVEL.some((ruta) =>
        location.pathname.startsWith(ruta)
    );

    return (
        <div className="app-fondo-wrapper">
            {esPantallaDeNivel ? <BackgroundLevel /> : <BackgroundMenu />}
        </div>
    );
}
