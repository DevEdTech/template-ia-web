// Adaptador de persistencia da feature de exemplo.
// Todo acesso a localStorage fica isolado aqui (na camada de services),
// nunca diretamente nos componentes ou na logica de model.

const STORAGE_KEY = 'example:counter';

/** Le o valor persistido do contador. Retorna `null` se ausente ou invalido. */
export function loadCount(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    // Ambientes sem localStorage (ou com acesso bloqueado) nao devem quebrar a app.
    return null;
  }
}

/** Persiste o valor atual do contador. */
export function saveCount(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Ignora falhas de escrita (ex.: modo privado / cota excedida).
  }
}
