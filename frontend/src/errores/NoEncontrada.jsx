import { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Logo/Logo/Titulo0.png";
import { useMusica } from "../juego/Musica/MusicaContext.jsx";
import "./NoEncontrada.css";

export default function NoEncontrada() {
    const { reproducir } = useMusica();
    useEffect(() => {
        reproducir("menu");
    }, [reproducir]);

    return (
        <div className="not-found">

        <div className="not-found-logo-wrapper">
            <img src={logo} alt="Cube of Stars" className="not-found-logo" />
        </div>

        <h1 className="not-found-codigo">404</h1>
        <p className="not-found-mensaje">Esta pantalla se perdió en el espacio.</p>

        <Link to="/" className="not-found-boton">
            Volver al menú
        </Link>
        </div>
    );
}