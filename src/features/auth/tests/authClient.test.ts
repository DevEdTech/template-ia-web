import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { AuthEnv } from '@/shared/config/env';
import { AuthError } from '../model/session';
import {
  beginAuthorization,
  completeAuthorization,
  logoutUrl,
  refreshSession,
} from '../services/authClient';
import { clearHandshake, readHandshake, writeHandshake } from '../services/handshakeStore';

const config: AuthEnv = {
  issuer: 'https://login.exemplo.com',
  clientId: 'cliente-123',
  redirectUri: 'https://app.exemplo.com/auth/callback',
  scope: 'openid profile',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  clearHandshake();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('beginAuthorization', () => {
  test('monta a URL do provedor com PKCE S256 e guarda o handshake', async () => {
    const url = new URL(await beginAuthorization(config, '/relatorios'));

    expect(url.origin + url.pathname).toBe('https://login.exemplo.com/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('cliente-123');
    expect(url.searchParams.get('redirect_uri')).toBe(config.redirectUri);
    expect(url.searchParams.get('scope')).toBe('openid profile');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/);

    const handshake = readHandshake();
    expect(handshake?.returnTo).toBe('/relatorios');
    expect(handshake?.state).toBe(url.searchParams.get('state'));
    // O verifier nunca viaja na URL de autorizacao.
    expect(url.toString()).not.toContain(handshake?.verifier ?? 'ausente');
  });

  test('cada login gera state e verifier novos', async () => {
    await beginAuthorization(config, '/');
    const primeiro = readHandshake();
    await beginAuthorization(config, '/');
    const segundo = readHandshake();

    expect(segundo?.state).not.toBe(primeiro?.state);
    expect(segundo?.verifier).not.toBe(primeiro?.verifier);
  });
});

describe('completeAuthorization', () => {
  test('troca o codigo por token e devolve o endereco de retorno', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/painel' });
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        jsonResponse({ access_token: 'at', token_type: 'Bearer', expires_in: 60 }),
      );

    const result = await completeAuthorization(
      config,
      new URLSearchParams({ code: 'c1', state: 's1' }),
    );

    expect(result.returnTo).toBe('/painel');
    expect(result.token.access_token).toBe('at');

    const body = fetchSpy.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code_verifier')).toBe('v1');
    // Consumido: uma segunda volta com o mesmo codigo nao pode reaproveitar.
    expect(readHandshake()).toBeNull();
  });

  test('recusa retorno cujo state nao casa com o login iniciado', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/' });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(
      completeAuthorization(config, new URLSearchParams({ code: 'c1', state: 'outro' })),
    ).rejects.toMatchObject({ code: 'estado-invalido' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('recusa retorno sem handshake guardado', async () => {
    await expect(
      completeAuthorization(config, new URLSearchParams({ code: 'c1', state: 's1' })),
    ).rejects.toBeInstanceOf(AuthError);
  });

  test('relata o erro do provedor quando volta sem codigo', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/' });

    await expect(
      completeAuthorization(
        config,
        new URLSearchParams({ state: 's1', error: 'access_denied', error_description: 'negado' }),
      ),
    ).rejects.toMatchObject({ code: 'codigo-ausente', message: 'negado' });
  });

  test('rejeita resposta de token em formato inesperado', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ accessToken: 'errado' }));

    await expect(
      completeAuthorization(config, new URLSearchParams({ code: 'c1', state: 's1' })),
    ).rejects.toMatchObject({ code: 'troca-recusada' });
  });

  test('traduz falha de rede em erro de provedor indisponivel', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('sem rede'));

    await expect(
      completeAuthorization(config, new URLSearchParams({ code: 'c1', state: 's1' })),
    ).rejects.toMatchObject({ code: 'provedor-indisponivel' });
  });
});

describe('refreshSession', () => {
  test('renova com o grant de refresh', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        jsonResponse({ access_token: 'novo', token_type: 'Bearer', expires_in: 900 }),
      );

    const token = await refreshSession(config, 'rt-1');

    expect(token.access_token).toBe('novo');
    const body = fetchSpy.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('refresh_token')).toBe('rt-1');
  });

  test('recusa do provedor vira renovacao-recusada, nao troca-recusada', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'invalid_grant' }, 400));

    await expect(refreshSession(config, 'rt-vencido')).rejects.toMatchObject({
      code: 'renovacao-recusada',
    });
  });

  test('indisponibilidade do provedor preserva o codigo original', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('timeout'));

    await expect(refreshSession(config, 'rt-1')).rejects.toMatchObject({
      code: 'provedor-indisponivel',
    });
  });
});

test('logoutUrl aponta para o encerramento no provedor', () => {
  const url = new URL(logoutUrl(config, 'https://app.exemplo.com'));
  expect(url.origin + url.pathname).toBe('https://login.exemplo.com/logout');
  expect(url.searchParams.get('client_id')).toBe('cliente-123');
  expect(url.searchParams.get('returnTo')).toBe('https://app.exemplo.com');
});
