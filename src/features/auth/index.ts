/**
 * Interface publica da feature de autenticacao.
 *
 * Outras features consomem apenas o que esta aqui. O cliente HTTP, o
 * armazenamento do handshake e o PKCE sao detalhes internos: trocar o
 * provedor de identidade nao deve alcancar nenhuma tela.
 */
export { AuthProvider } from './components/AuthProvider';
export type { AuthProviderProps } from './components/AuthProvider';
export type { AuthContextValue } from './components/authContext';
export { RequireAuth } from './components/RequireAuth';
export { CallbackPage } from './components/CallbackPage';
export { useAuth } from './hooks/useAuth';
export {
  AuthError,
  authorizationHeader,
  createSession,
  hasScopes,
  isExpired,
  shouldRefresh,
  type AuthErrorCode,
  type AuthState,
  type Session,
  type TokenResponse,
} from './model/session';
