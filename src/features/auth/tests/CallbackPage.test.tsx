import { afterEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import type { AuthEnv } from '@/shared/config/env';
import { CallbackPage } from '../components/CallbackPage';
import { writeHandshake } from '../services/handshakeStore';

const config: AuthEnv = {
  issuer: 'https://login.exemplo.com',
  clientId: 'cliente-123',
  redirectUri: 'https://app.exemplo.com/auth/callback',
  scope: 'openid',
};

const NOW = 1_700_000_000_000;

function renderCallback(query: string, overrides: { config?: AuthEnv | undefined } = {}) {
  const onSession = vi.fn();
  render(
    <MemoryRouter initialEntries={[`/auth/callback${query}`]}>
      <Routes>
        <Route
          path="/auth/callback"
          element={
            <CallbackPage
              config={'config' in overrides ? overrides.config : config}
              onSession={onSession}
              now={() => NOW}
            />
          }
        />
        <Route path="/painel" element={<p>Painel</p>} />
        <Route path="/" element={<p>Início</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return { onSession };
}

// Espiao de `fetch` acumula historico entre testes do mesmo arquivo quando nao
// e restaurado: uma asercao de "nao chamou" passaria a ver chamada alheia.
afterEach(() => {
  vi.restoreAllMocks();
});

describe('CallbackPage', () => {
  test('troca o codigo, entrega a sessao e volta ao destino original', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/painel' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'at', token_type: 'Bearer', expires_in: 600 }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { onSession } = renderCallback('?code=c1&state=s1');

    await waitFor(() => expect(onSession).toHaveBeenCalledTimes(1));
    expect(onSession.mock.calls[0]?.[0]).toMatchObject({
      accessToken: 'at',
      expiresAt: NOW + 600_000,
    });
    expect(await screen.findByText('Painel')).toBeInTheDocument();
  });

  test('state divergente nao conclui login e explica a recusa', async () => {
    writeHandshake({ state: 's1', verifier: 'v1', returnTo: '/painel' });
    const { onSession } = renderCallback('?code=c1&state=outro');

    expect(await screen.findByRole('alert')).toHaveTextContent('Login nao concluido');
    expect(onSession).not.toHaveBeenCalled();
  });

  test('sem provedor configurado, informa em vez de tentar a troca', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { onSession } = renderCallback('?code=c1&state=s1', { config: undefined });

    expect(await screen.findByRole('alert')).toHaveTextContent('nao configurada');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onSession).not.toHaveBeenCalled();
  });

  test('o estado de falha oferece o caminho de volta', async () => {
    const { onSession } = renderCallback('?error=access_denied&state=s1', { config: undefined });

    (await screen.findByRole('button', { name: 'Voltar ao início' })).click();
    await waitFor(() => expect(screen.getByText('Início')).toBeInTheDocument());
    expect(onSession).not.toHaveBeenCalled();
  });
});
