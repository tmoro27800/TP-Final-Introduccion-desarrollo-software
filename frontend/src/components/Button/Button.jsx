import "./DarkButton.css";

function DarkButton({ children, onClick, disabled = false, type = "button" }) {
    return (
        <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="dark-button"
        >
        {children}
        </button>
    );
}

export default DarkButton;