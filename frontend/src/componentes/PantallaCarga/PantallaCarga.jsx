import "./PantallaCarga.css";

// Pantalla de carga temática: 3 "gemas" (mismo motivo rombo que la llave del
// tablero, ver Tablero.css) rebotando en secuencia, más una barra a los
// saltos (steps(), no una transición suave) para que se sienta pixel-art/
// retro en vez de un spinner genérico.
export default function PantallaCarga({ mensaje = "Cargando..." }) {
    return (
        <div className="carga">
            <div className="carga-gemas" aria-hidden="true">
                <span className="carga-gema carga-gema--1" />
                <span className="carga-gema carga-gema--2" />
                <span className="carga-gema carga-gema--3" />
            </div>
            <p className="carga-mensaje">{mensaje}</p>
        </div>
    );
}
