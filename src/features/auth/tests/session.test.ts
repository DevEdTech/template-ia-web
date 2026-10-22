import { describe, expect, test } from 'vitest';
import {
  AuthError,
  REFRESH_MARGIN_MS,
  authorizationHeader,
  createSession,
  hasScopes,
  isExpired,
  shouldRefresh,
  type TokenResponse,
} from '../model/session';

const NOW = 1_700_000_000_000;

function token(overrides: Partial<TokenResponse> = {}): TokenResponse {
  return {
    access_token: 'at-123',
    token_type: 'Bearer',
    expires_in: 3600,
    ...overrides,
  };
}

describe('createSession', () => {
  test('converte expires_in em instante absoluto', () => {
    const session = createSession(token({ expires_in: 120 }), NOW);
    expect(session.expiresAt).toBe(NOW + 120_000);
  });

  test('trata token que nasce vencido sem virar instante no passado', () => {
    const session = createSession(token({ expires_in: -500 }), NOW);
    expect(session.expiresAt).toBe(NOW);
    expect(isExpired(session, NOW)).toBe(true);
  });

  test('separa os escopos declarados e ignora espaco extra', () => {
    const session = createSession(token({ scope: 'openid  profile ' }), NOW);
    expect(session.scope).toEqual(['openid', 'profile']);
  });

  test('sessao sem escopo declarado nao atende exigencia de escopo', () => {
    const session = createSession(token(), NOW);
    expect(session.scope).toEqual([]);
    expect(hasScopes(session, ['relatorios:ler'])).toBe(false);
  });
});

describe('expiracao e renovacao', () => {
  test('sessao dentro da validade nao esta expirada', () => {
    const session = createSession(token(), NOW);
    expect(isExpired(session, NOW + 1000)).toBe(false);
  });

  test('renova quando entra na margem de seguranca', () => {
    const session = createSession(token({ expires_in: 3600, refresh_token: 'rt' }), NOW);
    const dentroDaMargem = session.expiresAt - REFRESH_MARGIN_MS;
    expect(shouldRefresh(session, dentroDaMargem - 1)).toBe(false);
    expect(shouldRefresh(session, dentroDaMargem)).toBe(true);
  });

  test('nao promete renovacao sem refresh token', () => {
    const session = createSession(token({ expires_in: 1 }), NOW);
    expect(shouldRefresh(session, NOW + 10_000)).toBe(false);
  });
});

describe('hasScopes', () => {
  test('exige todos os escopos pedidos', () => {
    const session = createSession(token({ scope: 'openid relatorios:ler' }), NOW);
    expect(hasScopes(session, ['openid'])).toBe(true);
    expect(hasScopes(session, ['openid', 'relatorios:escrever'])).toBe(false);
  });

  test('lista vazia e sempre atendida', () => {
    expect(hasScopes(createSession(token(), NOW), [])).toBe(true);
  });
});

test('authorizationHeader monta o cabecalho Bearer', () => {
  const session = createSession(token({ access_token: 'abc' }), NOW);
  expect(authorizationHeader(session)).toEqual({ Authorization: 'Bearer abc' });
});

test('AuthError preserva o codigo estavel', () => {
  const error = new AuthError('estado-invalido', 'state nao casa');
  expect(error.code).toBe('estado-invalido');
  expect(error.name).toBe('AuthError');
  expect(error).toBeInstanceOf(Error);
});
