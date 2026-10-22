import { describe, expect, it } from 'vitest';
import { EnvValidationError, createEnv } from '../env';

function raw(overrides: Record<string, unknown> = {}): ImportMetaEnv {
  return { MODE: 'test', PROD: false, DEV: true, SSR: false, BASE_URL: '/', ...overrides };
}

describe('createEnv', () => {
  it('expoe o modo e a flag de producao', () => {
    const env = createEnv(raw({ MODE: 'production', PROD: true }));

    expect(env.mode).toBe('production');
    expect(env.isProduction).toBe(true);
  });

  it('expõe a base pública para builds em subdiretórios', () => {
    expect(createEnv(raw({ BASE_URL: '/template-ia-web/' })).baseUrl).toBe('/template-ia-web/');
    expect(createEnv(raw({ BASE_URL: '/template-ia-web' })).baseUrl).toBe('/template-ia-web/');
    expect(createEnv(raw()).baseUrl).toBe('/');
  });

  it('deixa apiUrl indefinida quando a variavel nao existe', () => {
    expect(createEnv(raw()).apiUrl).toBeUndefined();
  });

  it('trata string vazia ou so espacos como ausente', () => {
    expect(createEnv(raw({ VITE_API_URL: '   ' })).apiUrl).toBeUndefined();
  });

  it('normaliza a URL informada removendo a barra final', () => {
    expect(createEnv(raw({ VITE_API_URL: 'https://api.exemplo.com/' })).apiUrl).toBe(
      'https://api.exemplo.com',
    );
  });

  it('falha com mensagem acionavel quando a URL e invalida', () => {
    expect(() => createEnv(raw({ VITE_API_URL: 'api.exemplo.com' }))).toThrow(EnvValidationError);
    expect(() => createEnv(raw({ VITE_API_URL: 'api.exemplo.com' }))).toThrow(/URL absoluta/);
  });

  it('reune todos os problemas em uma unica mensagem', () => {
    try {
      createEnv(raw({ VITE_API_URL: 'nao-e-url' }));
      expect.unreachable('createEnv deveria ter lancado');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as Error).message).toContain('.env.local');
    }
  });
});

describe('configuracao de autenticacao', () => {
  const completa = {
    VITE_AUTH_ISSUER: 'https://login.exemplo.com',
    VITE_AUTH_CLIENT_ID: 'cliente-1',
    VITE_AUTH_REDIRECT_URI: 'https://app.exemplo.com/auth/callback',
  };

  it('fica indefinida quando nenhuma variavel de auth existe', () => {
    expect(createEnv(raw()).auth).toBeUndefined();
  });

  it('monta a configuracao com escopo padrao quando as tres existem', () => {
    const auth = createEnv(raw(completa)).auth;

    expect(auth).toEqual({
      issuer: 'https://login.exemplo.com',
      clientId: 'cliente-1',
      redirectUri: 'https://app.exemplo.com/auth/callback',
      scope: 'openid profile email',
    });
  });

  it('respeita o escopo declarado', () => {
    expect(createEnv(raw({ ...completa, VITE_AUTH_SCOPE: 'openid pedidos:ler' })).auth?.scope).toBe(
      'openid pedidos:ler',
    );
  });

  it('recusa configuracao parcial em vez de falhar no meio do fluxo', () => {
    expect(() => createEnv(raw({ VITE_AUTH_ISSUER: completa.VITE_AUTH_ISSUER }))).toThrow(
      EnvValidationError,
    );
    expect(() => createEnv(raw({ VITE_AUTH_CLIENT_ID: 'cliente-1' }))).toThrow(/definidas juntas/);
  });

  it('recusa emissor que nao e URL absoluta', () => {
    expect(() => createEnv(raw({ ...completa, VITE_AUTH_ISSUER: 'login.exemplo.com' }))).toThrow(
      /VITE_AUTH_ISSUER/,
    );
  });
});
