import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { useConfiguracion } from "../Configuracion/ConfiguracionContext.jsx";
import pistaMenu from "../../assets/Audios/Musicas/OneShot OST - Geothermal.mp3";
import pistaNormal from "../../assets/Audios/Musicas/Mittsies - Epitomize.mp3";
import pistaDificil from "../../assets/Audios/Musicas/Omnispeak Awaria OST.mp3";

const PISTAS = { menu: pistaMenu, normal: pistaNormal, dificil: pistaDificil };
const VOLUMEN = 0.4;

const MusicaContext = createContext(null);

// Música de fondo global: un solo <audio> que vive acá (nunca se desmonta
// al navegar entre pantallas, a diferencia de los componentes de cada
// ruta) y que cada pantalla pide con reproducir("menu" | "normal" |
// "dificil") en un useEffect al montar — ver Menu.jsx, SeleccionModo.jsx,
// SeleccionNivel.jsx, Puntaje.jsx, NoEncontrada.jsx (todas piden "menu") y
// Nivel.jsx (pide nivel.dificultad, que ya viene como "normal"/"dificil").
// Pedir la MISMA pista que ya está sonando no la reinicia — así navegar
// entre pantallas del menú no corta ni reinicia la música de fondo.
export function MusicaProvider({ children }) {
    const { audio } = useConfiguracion();
    const audioRef = useRef(null);
    const pistaActualRef = useRef(null);

    if (!audioRef.current) {
        const el = new Audio();
        el.loop = true;
        el.volume = VOLUMEN;
        audioRef.current = el;
    }

    // El navegador bloquea el autoplay hasta el primer gesto del usuario —
    // la primera pantalla pide música apenas monta, pero recién puede
    // sonar de verdad después de un click/tecla. Reintenta ahí; si ya está
    // sonando o el usuario apagó la música desde Configuración, no hace nada.
    useEffect(() => {
        function reintentar() {
            const el = audioRef.current;
            if (audio.musica && pistaActualRef.current && el.paused) {
                el.play().catch(() => {});
            }
        }
        document.addEventListener("pointerdown", reintentar);
        document.addEventListener("keydown", reintentar);
        return () => {
            document.removeEventListener("pointerdown", reintentar);
            document.removeEventListener("keydown", reintentar);
        };
    }, [audio.musica]);

    // Prender/apagar la música desde Configuración no cambia qué pista está
    // elegida, solo si efectivamente suena.
    useEffect(() => {
        const el = audioRef.current;
        if (audio.musica && pistaActualRef.current) {
            el.play().catch(() => {});
        } else {
            el.pause();
        }
    }, [audio.musica]);

    // useCallback (no una función suelta) para que las pantallas puedan
    // ponerla en el array de dependencias de su useEffect de montaje sin
    // que se dispare de nuevo en cada re-render — solo cambia de
    // referencia cuando cambia audio.musica, que es lo único que usa.
    const reproducir = useCallback(
        (pista) => {
            if (pistaActualRef.current === pista) return; // ya está sonando esta
            pistaActualRef.current = pista;
            const el = audioRef.current;
            el.src = PISTAS[pista];
            el.currentTime = 0;
            if (audio.musica) el.play().catch(() => {});
        },
        [audio.musica]
    );

    return <MusicaContext.Provider value={{ reproducir }}>{children}</MusicaContext.Provider>;
}

// Hook de conveniencia: useMusica() en vez de useContext(MusicaContext).
export function useMusica() {
    const contexto = useContext(MusicaContext);
    if (!contexto) {
        throw new Error(
            "useMusica() se usó fuera de <MusicaProvider>. Revisá que App.jsx lo tenga envolviendo las rutas."
        );
    }
    return contexto;
}
