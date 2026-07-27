import { useLocation } from "react-router-dom";
import FondoMenu from "./FondoMenu/FondoMenu.jsx";
import FondoNivel from "./FondoNivel/FondoNivel.jsx";
import "./AppFondo.css";

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
            {esPantallaDeNivel ? <FondoNivel /> : <FondoMenu />}
        </div>
    );
}
