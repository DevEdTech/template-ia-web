/**
 * Sessao do usuario: tipos e regras puras.
 *
 * Nada aqui toca rede, armazenamento ou `window`. A pureza e o que permite
 * testar expiracao e renovacao sem simular um provedor de identidade.
 */

/** Resposta de token do provedor, no formato do OAuth 2.0. */
export interface TokenResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly refresh_token?: string;
  readonly id_token?: string;
  readonly scope?: string;
}

/** Sessao ativa. O token de acesso vive em memoria, nunca em disco. */
export interface Session {
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  /** Instante de expiracao em milissegundos desde a epoca (UTC). */
  readonly expiresAt: number;
  readonly scope: readonly string[];
  readonly subject: string | undefined;
}

/** Estados observaveis da autenticacao, para a interface tratar todos. */
export type AuthState =
  | { readonly status: 'autenticando' }
  | { readonly status: 'autenticada'; readonly session: Session }
  | { readonly status: 'anonima' }
  | { readonly status: 'erro'; readonly code: AuthErrorCode; readonly message: string };

/**
 * Codigos estaveis de falha. A interface decide a mensagem; o codigo e o que
 * nao muda quando o texto muda.
 */
export type AuthErrorCode =
  | 'configuracao-ausente'
  | 'estado-invalido'
  | 'codigo-ausente'
  | 'troca-recusada'
  | 'renovacao-recusada'
  | 'provedor-indisponivel';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/** Margem de seguranca: renova antes de expirar, nao depois. */
export const REFRESH_MARGIN_MS = 60_000;

/**
 * Converte a resposta do provedor em sessao.
 * @param token resposta de token.
 * @param now instante de referencia em milissegundos.
 * @param subject identificador do usuario, quando conhecido.
 */
export function createSession(token: TokenResponse, now: number, subject?: string): Session {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    // `expires_in` vem em segundos; um provedor que mande valor nao positivo
    // esta dizendo que o token ja nasceu vencido.
    expiresAt: now + Math.max(0, token.expires_in) * 1000,
    scope: token.scope ? token.scope.split(' ').filter(Boolean) : [],
    subject,
  };
}

/** @returns se a sessao ja venceu no instante informado. */
export function isExpired(session: Session, now: number): boolean {
  return session.expiresAt <= now;
}

/** @returns se a sessao esta perto o bastante do fim para renovar. */
export function shouldRefresh(session: Session, now: number): boolean {
  return session.refreshToken !== undefined && session.expiresAt - now <= REFRESH_MARGIN_MS;
}

/** @returns se a sessao cobre todos os escopos exigidos. */
export function hasScopes(session: Session, required: readonly string[]): boolean {
  return required.every((scope) => session.scope.includes(scope));
}

/**
 * Cabecalho de autorizacao da sessao, para os servicos do projeto usarem.
 * Fica no model porque e formatacao pura, nao I/O.
 */
export function authorizationHeader(session: Session): Readonly<Record<string, string>> {
  return { Authorization: `Bearer ${session.accessToken}` };
}
