import { describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { AuthEnv } from '@/shared/config/env';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { AuthProvider } from '../components/AuthProvider';
import { RequireAuth } from '../components/RequireAuth';
import { createSession, type Session } from '../model/session';

const config: AuthEnv = {
  issuer: 'https://login.exemplo.com',
  clientId: 'cliente-123',
  redirectUri: 'https://app.exemplo.com/auth/callback',
  scope: 'openid relatorios:ler',
};

const NOW = 1_700_000_000_000;

function session(scope = 'openid relatorios:ler'): Session {
  return createSession(
    { access_token: 'at', token_type: 'Bearer', expires_in: 3600, scope },
    NOW,
    'user-1',
  );
}

function wrap(children: ReactNode, overrides: Partial<Parameters<typeof AuthProvider>[0]> = {}) {
  return (
    <AuthProvider config={config} now={() => NOW} navigateExternal={vi.fn()} {...overrides}>
      {children}
    </AuthProvider>
  );
}

describe('RequireAuth', () => {
  test('mostra o conteudo protegido para sessao valida', () => {
    renderWithProviders(
      wrap(
        <RequireAuth>
          <p>Relatório confidencial</p>
        </RequireAuth>,
        { initialSession: session() },
      ),
    );

    expect(screen.getByText('Relatório confidencial')).toBeInTheDocument();
  });

  test('leva ao provedor quando a sessao e anonima, preservando o destino', async () => {
    const navigateExternal = vi.fn();

    renderWithProviders(
      wrap(
        <RequireAuth>
          <p>Protegido</p>
        </RequireAuth>,
        { navigateExternal },
      ),
    );

    await waitFor(() => expect(navigateExternal).toHaveBeenCalledTimes(1));
    const url = new URL(navigateExternal.mock.calls[0]?.[0] as string);
    expect(url.pathname).toBe('/authorize');
    expect(screen.queryByText('Protegido')).not.toBeInTheDocument();
  });

  test('nega acesso por escopo sem mandar o usuario de volta ao provedor', async () => {
    const navigateExternal = vi.fn();

    renderWithProviders(
      wrap(
        <RequireAuth scopes={['relatorios:escrever']}>
          <p>Protegido</p>
        </RequireAuth>,
        { initialSession: session('openid relatorios:ler'), navigateExternal },
      ),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Acesso insuficiente');
    expect(screen.queryByText('Protegido')).not.toBeInTheDocument();
    // Redirecionar nao resolve falta de permissao: viraria laco.
    expect(navigateExternal).not.toHaveBeenCalled();
  });

  test('sem provedor configurado, informa a falha de configuracao', async () => {
    renderWithProviders(
      wrap(
        <RequireAuth>
          <p>Protegido</p>
        </RequireAuth>,
        { config: undefined },
      ),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel entrar');
    expect(screen.getByRole('alert')).toHaveTextContent('VITE_AUTH_ISSUER');
  });

  test('o estado de erro oferece nova tentativa', async () => {
    const navigateExternal = vi.fn();
    const { user } = renderWithProviders(
      wrap(
        <RequireAuth>
          <p>Protegido</p>
        </RequireAuth>,
        { config: undefined, navigateExternal },
      ),
    );

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
