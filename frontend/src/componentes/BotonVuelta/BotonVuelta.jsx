import "./BotonVuelta.css";

export default function BotonVuelta({ label, onClick }) {
    return (
        <button className="back-button" onClick={onClick}>
            <span aria-hidden="true">←</span> {label}
        </button>
    );
}