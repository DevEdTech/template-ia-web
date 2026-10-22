import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../components/authContext';

/**
 * Acesso a autenticacao dentro da arvore do `AuthProvider`.
 *
 * Falha alto fora do provedor: um componente que le sessao `undefined` por
 * falta de provider renderiza como anonimo e esconde o erro de composicao.
 *
 * @throws {Error} quando usado fora do `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth precisa de um <AuthProvider> acima na arvore.');
  }
  return context;
}
