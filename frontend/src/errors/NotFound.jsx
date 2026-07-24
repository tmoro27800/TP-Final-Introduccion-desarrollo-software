import { Link } from "react-router-dom";
import logo from "../assets/logo/logo.png";
import "./NotFound.css";

export default function NotFound() {
    return (
        <div className="not-found">

        <h1 className="not-found-codigo">404</h1>
        <p className="not-found-mensaje">Esta pantalla se perdió en el espacio.</p>

        <Link to="/" className="not-found-boton">
            Volver al menú
        </Link>
        </div>
    );
}