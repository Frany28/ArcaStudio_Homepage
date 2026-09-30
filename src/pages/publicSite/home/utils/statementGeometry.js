import { VIEWPORT_RESIZE_KINDS } from "./viewportResize.js";

/**
 * Medición y actualización segura de la máscara tipográfica del manifiesto.
 * Incluye alternativas para diferencias de geometría SVG entre navegadores.
 */
const STATEMENT_GEOMETRY_SETTLE_MS = 180;

function shouldDeferStatementGeometryResize(resizeKind) {
  return resizeKind === VIEWPORT_RESIZE_KINDS.TRANSIENT_MOBILE_HEIGHT;
}

/** Valida que una medición SVG pueda utilizarse para enfocar la animación. */
function isUsableStatementBounds(bounds) {
  return Boolean(
    bounds &&
      Number.isFinite(bounds.x) &&
      Number.isFinite(bounds.y) &&
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height) &&
      bounds.width > 0 &&
      bounds.height > 0
  );
}

/** Ejecuta una lectura de geometría sin propagar errores del motor SVG. */
function readStatementBounds(readBounds) {
  if (typeof readBounds !== "function") return null;

  try {
    const bounds = readBounds();
    return isUsableStatementBounds(bounds) ? bounds : null;
  } catch {
    return null;
  }
}

/** Obtiene el área de enfoque usando la medición más fiable disponible. */
function getStatementFocusBounds({
  focusGlyph,
  focusLetterIndex = -1,
  maskText,
}) {
  if (!maskText) return null;

  /*
   * WebKit can report an empty getBBox() for a nested <tspan> while an SVG
   * has just changed from visibility:hidden to visible. SVGTextContentElement
   * character geometry is more stable there, so prefer it when available.
   */
  if (
    Number.isInteger(focusLetterIndex) &&
    focusLetterIndex >= 0 &&
    typeof maskText.getExtentOfChar === "function"
  ) {
    const characterBounds = readStatementBounds(() =>
      maskText.getExtentOfChar(focusLetterIndex),
    );
    if (characterBounds) return characterBounds;
  }

  const glyphBounds = readStatementBounds(() => focusGlyph?.getBBox());
  if (glyphBounds) return glyphBounds;

  /*
   * Last-resort cross-browser fallback: keep the effect functional and
   * centered even if per-character metrics are temporarily unavailable.
   */
  return readStatementBounds(() => maskText.getBBox());
}

/** Indica si es seguro recalcular geometría sin interrumpir la animación. */
function isStatementGeometrySettled({
  animationHasProgressed = false,
  effectStarted = false,
  progress = 0,
  statementVisible = false,
}) {
  if (!effectStarted || statementVisible || progress >= 1) return true;
  return progress <= 0 && animationHasProgressed;
}

/**
 * Crea una cola que agrupa redimensionados y ejecuta una sola medición cuando
 * el efecto llega a un estado estable.
 */
function createStatementGeometryRefreshQueue({
  cancelFrame,
  clearTimer,
  measure,
  requestFrame,
  setTimer,
  settleDelay = STATEMENT_GEOMETRY_SETTLE_MS,
}) {
  let frameId = 0;
  let pending = false;
  let timerId;

  const flushIfSettled = (isSettled) => {
    if (!pending || frameId || !isSettled()) return false;

    frameId = requestFrame(() => {
      frameId = 0;
      if (pending && isSettled()) measure();
    });
    return true;
  };

  const defer = (isSettled) => {
    pending = true;
    clearTimer(timerId);
    timerId = setTimer(() => {
      timerId = undefined;
      flushIfSettled(isSettled);
    }, settleDelay);
  };

  return {
    complete() {
      pending = false;
      clearTimer(timerId);
      timerId = undefined;
    },
    defer,
    destroy() {
      cancelFrame(frameId);
      clearTimer(timerId);
      frameId = 0;
      timerId = undefined;
      pending = false;
    },
    flushIfSettled,
    isPending: () => pending,
    markPending() {
      pending = true;
    },
  };
}

export {
  STATEMENT_GEOMETRY_SETTLE_MS,
  createStatementGeometryRefreshQueue,
  getStatementFocusBounds,
  isStatementGeometrySettled,
  isUsableStatementBounds,
  shouldDeferStatementGeometryResize,
};
