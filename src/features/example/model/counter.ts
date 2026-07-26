// Lógica pura da feature de exemplo. Sem React, sem I/O, fácil de testar.

export const MIN_COUNT = 0;

/** Incrementa respeitando um passo positivo. */
export function increment(value: number, step = 1): number {
  return value + step;
}

/** Decrementa sem permitir valores abaixo de MIN_COUNT. */
export function decrement(value: number, step = 1): number {
  return Math.max(MIN_COUNT, value - step);
}
