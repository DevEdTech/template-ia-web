import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthEnv } from '@/shared/config/env';
import { AuthContext, type AuthContextValue } from './authContext';
import {
  AuthError,
  type AuthState,
  type Session,
  createSession,
  isExpired,
  shouldRefresh,
} from '../model/session';
import { beginAuthorization, logoutUrl, refreshSession } from '../services/authClient';

export interface AuthProviderProps {
  readonly children: ReactNode;
  /** Configuracao do provedor; `undefined` mantem a aplicacao anonima. */
  readonly config: AuthEnv | undefined;
  /** Sessao inicial, usada pela pagina de retorno e pelos testes. */
  readonly initialSession?: Session | undefined;
  /** Navegacao para fora da aplicacao, injetavel para teste. */
  readonly navigateExternal?: (url: string) => void;
  /** Relogio, injetavel para teste. */
  readonly now?: () => number;
}

function defaultNavigate(url: string): void {
  window.location.assign(url);
}

/**
 * Provedor de autenticacao.
 *
 * O token de acesso fica apenas em memoria: `localStorage` entrega o token a
 * qualquer script injetado na pagina, e a persistencia entre recargas e papel
 * do refresh no provedor. Uma recarga volta ao estado anonimo e refaz o fluxo,
 * que e silencioso quando a sessao no provedor ainda vale.
 */
export function AuthProvider({
  children,
  config,
  initialSession,
  navigateExternal = defaultNavigate,
  now = Date.now,
}: AuthProviderProps) {
  // O estado inicial e decidido aqui, nao num efeito: nao ha descoberta
  // assincrona a fazer no boot. Sem sessao em memoria, a aplicacao comeca
  // anonima e o `RequireAuth` da area protegida inicia o fluxo.
  const [state, setState] = useState<AuthState>(() =>
    initialSession ? { status: 'autenticada', session: initialSession } : { status: 'anonima' },
  );

  // A sessao tambem vive numa ref para `ensureSession` nao depender do ciclo
  // de render: um servico pode pedir o token a qualquer momento.
  const sessionRef = useRef<Session | undefined>(initialSession);
  const refreshing = useRef<Promise<Session | null> | null>(null);

  useEffect(() => {
    if (state.status === 'autenticada') sessionRef.current = state.session;
    if (state.status === 'anonima') sessionRef.current = undefined;
  }, [state]);

  const login = useCallback(
    async (returnTo = '/') => {
      if (config === undefined) {
        setState({
          status: 'erro',
          code: 'configuracao-ausente',
          message:
            'Autenticacao nao configurada: defina VITE_AUTH_ISSUER, VITE_AUTH_CLIENT_ID e VITE_AUTH_REDIRECT_URI.',
        });
        return;
      }
      setState({ status: 'autenticando' });
      try {
        navigateExternal(await beginAuthorization(config, returnTo));
      } catch (error) {
        setState({
          status: 'erro',
          code: error instanceof AuthError ? error.code : 'provedor-indisponivel',
          message: error instanceof Error ? error.message : 'Falha ao iniciar o login.',
        });
      }
    },
    [config, navigateExternal],
  );

  const adoptSession = useCallback((session: Session) => {
    sessionRef.current = session;
    setState({ status: 'autenticada', session });
  }, []);

  const logout = useCallback(() => {
    sessionRef.current = undefined;
    setState({ status: 'anonima' });
    if (config !== undefined) navigateExternal(logoutUrl(config, window.location.origin));
  }, [config, navigateExternal]);

  const ensureSession = useCallback(async (): Promise<Session | null> => {
    const session = sessionRef.current;
    if (session === undefined || config === undefined) return null;
    if (!isExpired(session, now()) && !shouldRefresh(session, now())) return session;
    if (session.refreshToken === undefined) {
      sessionRef.current = undefined;
      setState({ status: 'anonima' });
      return null;
    }
    // Varias chamadas simultaneas devem compartilhar uma unica renovacao.
    refreshing.current ??= (async () => {
      try {
        const token = await refreshSession(config, session.refreshToken as string);
        const renewed = createSession(token, now(), session.subject);
        sessionRef.current = renewed;
        setState({ status: 'autenticada', session: renewed });
        return renewed;
      } catch (error) {
        sessionRef.current = undefined;
        setState({
          status: 'erro',
          code: error instanceof AuthError ? error.code : 'renovacao-recusada',
          message: error instanceof Error ? error.message : 'Nao foi possivel renovar a sessao.',
        });
        return null;
      } finally {
        refreshing.current = null;
      }
    })();
    return refreshing.current;
  }, [config, now]);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout, ensureSession, adoptSession }),
    [state, login, logout, ensureSession, adoptSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
