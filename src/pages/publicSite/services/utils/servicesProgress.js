/**
 * Máquina de estado pura de la narrativa de Servicios.
 * Al no depender del DOM, sus transiciones se pueden probar de forma aislada.
 */

/** Crea el estado inicial de la secuencia. */
function createServicesProgress() {
  return { step: 0, revealed: true, categoriesComplete: false };
}

/** Avanza al siguiente paso cuando la revelación actual ya terminó. */
function advanceServicesProgress(state) {
  if (!state.revealed || state.step >= 2) return state;
  return { ...state, step: state.step + 1, revealed: false };
}

/** Marca como visible el paso indicado si todavía es el paso activo. */
function completeServicesReveal(state, step) {
  return state.step === step ? { ...state, revealed: true } : state;
}

/** Indica si la navegación puede abandonar la sección sin omitir contenido. */
function canLeaveServices(state) {
  return state.step === 2 && state.revealed && state.categoriesComplete;
}

/** Registra una categoría visitada y comunica cuándo se recorrieron todas. */
function visitServiceCategory(visited, index, count) {
  const next = new Set(visited);
  if (Number.isInteger(index) && index >= 0 && index < count) next.add(index);
  return { visited: next, complete: count > 0 && next.size === count };
}

export { createServicesProgress, advanceServicesProgress, completeServicesReveal, canLeaveServices, visitServiceCategory };
