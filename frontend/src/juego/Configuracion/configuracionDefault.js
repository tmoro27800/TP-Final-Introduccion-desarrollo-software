// Valores por defecto de la configuración del jugador.
//
// Estos valores viven SOLO en memoria (estado de React vía
// ConfiguracionContext.jsx) durante lo que dura la sesión del navegador.
// No se guardan en localStorage/sessionStorage ni se mandan al backend:
// si el usuario cierra la pestaña o recarga la página, todo vuelve a
// estos valores por defecto. Es a propósito — no hay sistema de
// usuarios/login en el proyecto, así que no hay "cuenta" donde persistir
// preferencias entre sesiones.
export const CONFIGURACION_DEFAULT = {
  controles: {
    arriba: "W",
    izquierda: "A",
    abajo: "S",
    derecha: "D",
  },
  audio: {
    musica: true,
    efectos: true,
  },
  // Reservado para cuando se implemente i18n de verdad. Por ahora solo
  // se guarda la preferencia; el texto de la UI sigue en español siempre.
  idioma: "es",
};
