import "./ScoreRow.css";

const MEDALLAS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function ScoreRow({ posicion, nombre, movimientos, tiempo }) {
    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, "0")}`;
    };

    return (
        <div className={`score-row ${posicion === 1 ? "primer-puesto" : ""}`}>
        <span className="score-posicion">{MEDALLAS[posicion] || posicion}</span>
        <span className="score-nombre">{nombre}</span>
        <span className="score-movimientos">{movimientos}</span>
        <span className="score-tiempo">{formatearTiempo(tiempo)}</span>
        </div>
    );
}