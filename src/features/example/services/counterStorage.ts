// Adaptador de persistência da feature de exemplo.
// Todo acesso a localStorage fica isolado aqui (na camada de services),
// nunca diretamente nos componentes ou na lógica de model.

const STORAGE_KEY = 'example:counter';

/** Lê o valor persistido do contador. Retorna `null` se ausente ou inválido. */
export function loadCount(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch (error: unknown) {
    // Ambientes sem localStorage (ou com acesso bloqueado) não devem quebrar a app.
    console.warn('[counterStorage] Falha ao ler localStorage:', error);
    return null;
  }
}

/** Persiste o valor atual do contador. */
export function saveCount(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (error: unknown) {
    // Modo privado ou cota excedida — registra aviso sem quebrar a app.
    console.warn('[counterStorage] Falha ao gravar localStorage:', error);
  }
}
