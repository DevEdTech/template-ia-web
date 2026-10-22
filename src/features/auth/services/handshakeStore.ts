/**
 * Guarda o estado efemero do login entre o redirecionamento e a volta.
 *
 * Fica em `services/` porque toca armazenamento do navegador — a regra de
 * arquitetura vale aqui como em qualquer outra feature, e
 * `npm run check:architecture` reprova `sessionStorage` fora desta fronteira.
 *
 * Usa `sessionStorage`, nao `localStorage`: o handshake vale para esta aba e
 * para esta tentativa. Nenhum token passa por aqui, apenas o `code_verifier`
 * e o `state`, que perdem valor assim que a troca termina.
 */

const KEY = 'auth:handshake';

/** Dados que precisam sobreviver ao redirecionamento ao provedor. */
export interface Handshake {
  readonly state: string;
  readonly verifier: string;
  /** Endereco interno para onde voltar depois do login. */
  readonly returnTo: string;
}

function isHandshake(value: unknown): value is Handshake {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.state === 'string' &&
    typeof candidate.verifier === 'string' &&
    typeof candidate.returnTo === 'string'
  );
}

export function writeHandshake(handshake: Handshake): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(handshake));
  } catch {
    // Armazenamento bloqueado (navegacao privada, politica do navegador).
    // Falhar aqui adiantaria pouco: o erro aparece na volta, com `state`
    // invalido e mensagem clara, em vez de interromper antes de tentar.
  }
}

export function readHandshake(): Handshake | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isHandshake(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearHandshake(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nada a fazer: o valor expira com a aba.
  }
}
