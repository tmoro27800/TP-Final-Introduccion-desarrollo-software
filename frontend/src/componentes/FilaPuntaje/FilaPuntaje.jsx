import "./ScoreRow.css";

const MEDALLAS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function ScoreRow({ posicion, nombre, movimientos, tiempo }) {
    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, "0")}`;
    };

    return (
        <tr className={`score-row ${posicion === 1 ? "primer-puesto" : ""}`}>
            <td className="score-posicion">{MEDALLAS[posicion] || posicion}</td>
            <td className="score-nombre">{nombre}</td>
            <td className="score-movimientos">{movimientos}</td>
            <td className="score-tiempo">{formatearTiempo(tiempo)}</td>
        </tr>
    );
}