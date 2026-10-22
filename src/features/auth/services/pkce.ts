/**
 * PKCE (RFC 7636): o que permite um cliente publico trocar codigo por token
 * sem guardar segredo.
 *
 * O `code_verifier` e gerado aqui, guardado no proprio navegador e enviado
 * apenas na troca. Sem ele, um codigo interceptado no redirecionamento seria
 * suficiente para obter token.
 */

/** Par PKCE: o segredo efemero e o desafio que vai na URL de autorizacao. */
export interface PkcePair {
  readonly verifier: string;
  readonly challenge: string;
}

const VERIFIER_BYTES = 32;

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** @returns valor aleatorio seguro em base64url, para verifier e state. */
export function randomToken(bytes = VERIFIER_BYTES): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return base64Url(buffer);
}

/**
 * Gera o par PKCE com `S256`. O metodo `plain` nao e usado de proposito: ele
 * transmite o segredo em claro na URL.
 */
export async function createPkcePair(): Promise<PkcePair> {
  const verifier = randomToken();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}
