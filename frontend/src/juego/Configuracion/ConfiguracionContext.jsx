import { createContext, useContext, useState } from "react";
import { CONFIGURACION_DEFAULT } from "./configuracionDefault.js";

// Contexto global de configuración: controles y audio.
//
// Vive en <ConfiguracionProvider> montado en App.jsx, por encima de todas
// las rutas — así cualquier pantalla (Menu, Juego, etc.) puede leer o
// cambiar la configuración actual con useConfiguracion().
//
// Todo el estado es en memoria (useState). No hay persistencia entre
// sesiones a propósito: si el usuario cierra o recarga la página, vuelve
// a CONFIGURACION_DEFAULT. Ver configuracionDefault.js.
const ConfiguracionContext = createContext(null);

export function ConfiguracionProvider({ children }) {
  const [controles, setControles] = useState(CONFIGURACION_DEFAULT.controles);
  const [audio, setAudio] = useState(CONFIGURACION_DEFAULT.audio);

  // Cambia una sola tecla (ej. "arriba") sin tocar las demás.
  function actualizarControl(accion, tecla) {
    setControles((prev) => ({ ...prev, [accion]: tecla }));
  }

  // Prende/apaga música o efectos sin tocar el otro.
  function actualizarAudio(campo, valor) {
    setAudio((prev) => ({ ...prev, [campo]: valor }));
  }

  function restaurarControles() {
    setControles(CONFIGURACION_DEFAULT.controles);
  }

  function restaurarTodo() {
    setControles(CONFIGURACION_DEFAULT.controles);
    setAudio(CONFIGURACION_DEFAULT.audio);
  }

  const value = {
    controles,
    setControles,
    actualizarControl,
    restaurarControles,

    audio,
    setAudio,
    actualizarAudio,

    restaurarTodo,
  };

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

// Hook de conveniencia: useConfiguracion() en vez de useContext(ConfiguracionContext).
// Tira un error claro si alguien lo usa fuera del Provider, en vez de fallar
// silenciosamente con "cannot read property of null".
export function useConfiguracion() {
  const contexto = useContext(ConfiguracionContext);
  if (!contexto) {
    throw new Error(
      "useConfiguracion() se usó fuera de <ConfiguracionProvider>. " +
        "Revisá que App.jsx lo tenga envolviendo las rutas."
    );
  }
  return contexto;
}
