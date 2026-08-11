/** Monta o `aria-describedby` apenas com os textos realmente presentes. */
export function describedBy(
  hint: string | undefined,
  hintId: string,
  error: string | undefined,
  errorId: string,
) {
  const ids = [hint ? hintId : null, error ? errorId : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
