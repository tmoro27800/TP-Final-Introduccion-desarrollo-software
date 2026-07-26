import "./BackButton.css";

export default function BackButton({ label = "Volver", onClick }) {
    return (
        <button className="back-button" onClick={onClick}>
            <span aria-hidden="true">←</span> {label}
        </button>
    );
}