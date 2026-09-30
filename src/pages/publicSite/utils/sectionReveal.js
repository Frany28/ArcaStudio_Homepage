/**
 * Configuración compartida para revelar los títulos de sección.
 * Centralizarla mantiene el mismo ritmo visual en toda la página.
 */
const REVEAL_DELAY_SECONDS = 0.1;
const REVEAL_DURATION_SECONDS = 0.9;

/** Devuelve la transición de Motion respetando la preferencia de movimiento reducido. */
function getSectionRevealTransition(visible, reduceMotion) {
  return reduceMotion ? { duration: 0 } : {
    type: "spring",
    duration: REVEAL_DURATION_SECONDS,
    bounce: 0.12,
    delay: visible ? REVEAL_DELAY_SECONDS : 0,
  };
}

/** Genera la máscara vertical utilizada en los estados oculto y visible. */
function getSectionRevealClip(visible) {
  return visible ? "inset(0 0 0 0)" : "inset(0 0 100% 0)";
}

export { getSectionRevealTransition, getSectionRevealClip, REVEAL_DELAY_SECONDS, REVEAL_DURATION_SECONDS };
