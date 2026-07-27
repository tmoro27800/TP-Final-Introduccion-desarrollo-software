import { useState } from "react";
import "./PixelButton.css";

export default function PixelButton({ src, srcHover, alt, onClick }) {
    const [hover, setHover] = useState(false);

    return (
        <button
            type="button"
            className="pixel-button"
            onClick={onClick}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
        >
            <img src={hover ? srcHover : src} alt={alt} draggable={false} />
        </button>
    );
}