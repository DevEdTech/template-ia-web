/**
 * Fronteira com o provedor de identidade.
 *
 * Tudo que fala HTTP com o provedor esta aqui: montar a URL de autorizacao,
 * trocar codigo por token, renovar e encerrar. Os componentes chamam esta
 * fronteira; nunca fazem `fetch` direto. Isso concentra tratamento de erro e
 * permite substituir o provedor por um duble nos testes.
 *
 * Nenhum segredo mora aqui. O fluxo e Authorization Code + PKCE, desenhado
 * para cliente publico: tudo que vai para o browser e publico por definicao.
 */

import type { AuthEnv } from '@/shared/config/env';
import { AuthError, type TokenResponse } from '../model/session';
import { createPkcePair, randomToken } from './pkce';
import { readHandshake, writeHandshake, clearHandshake } from './handshakeStore';

const TIMEOUT_MS = 10_000;

/** Endpoints derivados do emissor, no padrao OIDC. */
function endpoints(config: AuthEnv) {
  const base = config.issuer.replace(/\/$/, '');
  return {
    authorize: `${base}/authorize`,
    token: `${base}/oauth/token`,
    logout: `${base}/logout`,
  };
}

async function postForm(url: string, body: URLSearchParams): Promise<TokenResponse> {
  // Requisicao pode travar; sem timeout a interface espera para sempre.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
  } catch (error) {
    throw new AuthError(
      'provedor-indisponivel',
      `Nao foi possivel falar com o provedor de identidade: ${
        error instanceof Error ? error.message : 'falha de rede'
      }.`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new AuthError(
      'troca-recusada',
      `O provedor recusou a requisicao de token (HTTP ${response.status}).`,
    );
  }

  const payload: unknown = await response.json();
  if (!isTokenResponse(payload)) {
    throw new AuthError('troca-recusada', 'Resposta de token em formato inesperado.');
  }
  return payload;
}

/** Validacao na fronteira: dado de fora nunca entra no modelo sem conferencia. */
function isTokenResponse(value: unknown): value is TokenResponse {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.access_token === 'string' &&
    typeof candidate.token_type === 'string' &&
    typeof candidate.expires_in === 'number'
  );
}

/**
 * Comeca o login: guarda `state` e `code_verifier` e devolve o endereco do
 * provedor para onde a aplicacao deve navegar.
 */
export async function beginAuthorization(config: AuthEnv, returnTo: string): Promise<string> {
  const { verifier, challenge } = await createPkcePair();
  const state = randomToken(16);
  writeHandshake({ state, verifier, returnTo });

  const url = new URL(endpoints(config).authorize);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

/** Resultado da volta do provedor. */
export interface AuthorizationResult {
  readonly token: TokenResponse;
  readonly returnTo: string;
}

/**
 * Conclui o login a partir dos parametros de retorno.
 * @throws {AuthError} quando `state` nao casa, falta codigo ou a troca falha.
 */
export async function completeAuthorization(
  config: AuthEnv,
  params: URLSearchParams,
): Promise<AuthorizationResult> {
  const handshake = readHandshake();
  // Sempre limpa: o verifier serve a uma tentativa, com sucesso ou sem ele.
  clearHandshake();

  const code = params.get('code');
  const state = params.get('state');

  if (handshake === null || state === null || handshake.state !== state) {
    throw new AuthError(
      'estado-invalido',
      'O retorno do provedor nao corresponde ao login iniciado neste navegador.',
    );
  }
  if (code === null) {
    const description = params.get('error_description') ?? params.get('error');
    throw new AuthError(
      'codigo-ausente',
      description ?? 'O provedor voltou sem codigo de autorizacao.',
    );
  }

  const token = await postForm(
    endpoints(config).token,
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      code,
      code_verifier: handshake.verifier,
    }),
  );

  return { token, returnTo: handshake.returnTo };
}

/**
 * Renova a sessao.
 * @throws {AuthError} quando o provedor recusa a renovacao.
 */
export async function refreshSession(
  config: AuthEnv,
  refreshToken: string,
): Promise<TokenResponse> {
  try {
    return await postForm(
      endpoints(config).token,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: refreshToken,
      }),
    );
  } catch (error) {
    if (error instanceof AuthError && error.code === 'troca-recusada') {
      throw new AuthError('renovacao-recusada', 'A sessao expirou e nao pode ser renovada.');
    }
    throw error;
  }
}

/** Endereco de encerramento no provedor, para o logout completo. */
export function logoutUrl(config: AuthEnv, returnTo: string): string {
  const url = new URL(endpoints(config).logout);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}
