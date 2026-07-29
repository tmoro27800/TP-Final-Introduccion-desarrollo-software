import { useConfiguracion } from "../Configuracion/ConfiguracionContext.jsx";

import mover from "../../assets/Audios/Sonidos/Dodge3.ogg";
import muerte from "../../assets/Audios/Sonidos/V1_hurt.ogg";
import puertaConLlave from "../../assets/Audios/Sonidos/CAMOFF.ogg";
import puertaPlacaOBoton from "../../assets/Audios/Sonidos/data_pion-sfx19-crash-338379.ogg";
import laserActivo from "../../assets/Audios/Sonidos/HotaruLaser.ogg";
import laserPreparando from "../../assets/Audios/Sonidos/Targeting1.ogg";
import llave from "../../assets/Audios/Sonidos/BeanNode.ogg";
import cajaDestruida from "../../assets/Audios/Sonidos/Impact6.ogg";
import todasLasLlaves from "../../assets/Audios/Sonidos/LittlePlanet.ogg";
import chocarParedValve from "../../assets/Audios/Sonidos/Valve.ogg";
import chocarParedZap from "../../assets/Audios/Sonidos/Zap.ogg";
import fantasmaActivado from "../../assets/Audios/Sonidos/LightsOut.ogg";
import fantasmaTraspaso from "../../assets/Audios/Sonidos/BlueSphere2.ogg";
import meta from "../../assets/Audios/Sonidos/SSExit.ogg";
import fuerzaActivado from "../../assets/Audios/Sonidos/Fireball.ogg";

const VOLUMEN = 0.5;

// Mapa acción -> archivo(s), tal cual está documentado en
// assets/Audios/SacadoDe.txt. Algunas acciones usan más de un sonido a la
// vez (chocar contra una pared: Valve + Zap juntos).
const SONIDOS = {
    mover: [mover],
    muerte: [muerte],
    puertaConLlave: [puertaConLlave],
    // "Falso glitch" en SacadoDe.txt no especifica a qué puerta corresponde
    // — CAMOFF ya está tomado para la puerta con llave, así que este queda
    // para la otra puerta del juego (la de botón/placa de presión).
    puertaPlacaOBoton: [puertaPlacaOBoton],
    laserActivo: [laserActivo],
    laserPreparando: [laserPreparando],
    llave: [llave],
    cajaDestruida: [cajaDestruida],
    todasLasLlaves: [todasLasLlaves],
    chocarPared: [chocarParedValve, chocarParedZap],
    fantasmaActivado: [fantasmaActivado],
    fantasmaTraspaso: [fantasmaTraspaso],
    meta: [meta],
    fuerzaActivado: [fuerzaActivado],
};

// Efectos de sonido puntuales (no música de fondo, ver MusicaContext.jsx):
// cada llamado crea un <audio> nuevo y lo deja sonar solo — no hace falta
// mantener referencias ni loop, y varios pueden sonar superpuestos sin
// cortarse entre sí (ej. moverse Y agarrar una llave en el mismo paso).
export function useEfectosSonido() {
    const { audio } = useConfiguracion();

    function reproducir(nombre) {
        if (!audio.efectos) return;
        for (const src of SONIDOS[nombre]) {
            const el = new Audio(src);
            el.volume = VOLUMEN;
            el.play().catch(() => {});
        }
    }

    return { reproducir };
}
