import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { AuthEnv } from '@/shared/config/env';
import { AuthProvider } from '../components/AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { createSession, type Session } from '../model/session';

const config: AuthEnv = {
  issuer: 'https://login.exemplo.com',
  clientId: 'cliente-123',
  redirectUri: 'https://app.exemplo.com/auth/callback',
  scope: 'openid',
};

const NOW = 1_700_000_000_000;

function tokenResponse(accessToken: string, expiresIn = 3600) {
  return new Response(
    JSON.stringify({ access_token: accessToken, token_type: 'Bearer', expires_in: expiresIn }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}

function sessionExpiringIn(seconds: number, refreshToken?: string): Session {
  return createSession(
    {
      access_token: 'antigo',
      token_type: 'Bearer',
      expires_in: seconds,
      refresh_token: refreshToken,
    },
    NOW,
    'user-1',
  );
}

/** Expõe o contexto para o teste agir sobre ele sem passar por uma tela. */
function Harness({ onReady }: { onReady: (auth: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();
  onReady(auth);
  return <p>status: {auth.state.status}</p>;
}

function renderProvider(initialSession: Session | undefined, navigateExternal = vi.fn()) {
  let auth: ReturnType<typeof useAuth> | null = null;
  render(
    <AuthProvider
      config={config}
      initialSession={initialSession}
      navigateExternal={navigateExternal}
      now={() => NOW}
    >
      <Harness
        onReady={(value) => {
          auth = value;
        }}
      />
    </AuthProvider>,
  );
  return {
    navigateExternal,
    get auth() {
      if (auth === null) throw new Error('contexto nao montado');
      return auth;
    },
  };
}

// Espiao de `fetch` acumula historico entre testes do mesmo arquivo quando nao
// e restaurado: uma asercao de "nao chamou" passaria a ver chamada alheia.
afterEach(() => {
  vi.restoreAllMocks();
});

describe('AuthProvider', () => {
  test('comeca anonima sem sessao em memoria', () => {
    renderProvider(undefined);
    expect(screen.getByText('status: anonima')).toBeInTheDocument();
  });

  test('ensureSession devolve a sessao atual quando ainda esta longe do fim', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const harness = renderProvider(sessionExpiringIn(3600, 'rt-1'));

    await expect(harness.auth.ensureSession()).resolves.toMatchObject({ accessToken: 'antigo' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('renova quando a sessao entra na margem e publica o novo estado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(tokenResponse('novo'));
    const harness = renderProvider(sessionExpiringIn(30, 'rt-1'));

    await expect(harness.auth.ensureSession()).resolves.toMatchObject({ accessToken: 'novo' });
    await waitFor(() => expect(screen.getByText('status: autenticada')).toBeInTheDocument());
  });

  test('chamadas simultaneas compartilham uma unica renovacao', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(tokenResponse('novo'));
    const harness = renderProvider(sessionExpiringIn(30, 'rt-1'));

    const [a, b] = await Promise.all([harness.auth.ensureSession(), harness.auth.ensureSession()]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
  });

  test('sessao vencida sem refresh token volta a anonima em vez de insistir', async () => {
    const harness = renderProvider(sessionExpiringIn(-10));

    await expect(harness.auth.ensureSession()).resolves.toBeNull();
    await waitFor(() => expect(screen.getByText('status: anonima')).toBeInTheDocument());
  });

  test('recusa de renovacao vira estado de erro com codigo proprio', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
    );
    const harness = renderProvider(sessionExpiringIn(30, 'rt-vencido'));

    await expect(harness.auth.ensureSession()).resolves.toBeNull();
    await waitFor(() => expect(screen.getByText('status: erro')).toBeInTheDocument());
  });

  test('logout descarta a sessao e encerra tambem no provedor', async () => {
    const harness = renderProvider(sessionExpiringIn(3600, 'rt-1'));

    harness.auth.logout();

    await waitFor(() => expect(screen.getByText('status: anonima')).toBeInTheDocument());
    expect(harness.navigateExternal).toHaveBeenCalledTimes(1);
    expect(harness.navigateExternal.mock.calls[0]?.[0]).toContain('/logout');
    await expect(harness.auth.ensureSession()).resolves.toBeNull();
  });

  test('ensureSession sem sessao nenhuma nao chama o provedor', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const harness = renderProvider(undefined);

    await expect(harness.auth.ensureSession()).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('adoptSession assume a sessao concluida pela pagina de retorno', async () => {
    const harness = renderProvider(undefined);

    harness.auth.adoptSession(sessionExpiringIn(3600, 'rt-1'));

    await waitFor(() => expect(screen.getByText('status: autenticada')).toBeInTheDocument());
    await expect(harness.auth.ensureSession()).resolves.toMatchObject({ accessToken: 'antigo' });
  });
});

test('useAuth falha alto fora do provedor, em vez de parecer anonimo', () => {
  // O erro de composicao precisa aparecer no desenvolvimento, nao virar uma
  // tela de login silenciosa em producao.
  vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Harness onReady={() => {}} />)).toThrow(/AuthProvider/);
});
