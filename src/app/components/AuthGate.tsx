// Composicao da autenticacao: o provedor na raiz e a rota de retorno.
//
// Fica em `app/` porque e composicao, nao regra: a feature `auth` nao sabe
// onde ela e montada, e `app/` nao conhece o fluxo OIDC por dentro.
import type { ReactNode } from 'react';
import { AuthProvider, CallbackPage, useAuth } from '@/features/auth';
import { env } from '@/shared/config/env';

export function AuthGate({ children }: { children: ReactNode }) {
  return <AuthProvider config={env.auth}>{children}</AuthProvider>;
}

/**
 * Rota `redirect_uri`. Sem provedor configurado a pagina explica a ausencia em
 * vez de quebrar: o template roda sem autenticacao ate alguem configurar.
 */
export function AuthCallbackRoute() {
  const { adoptSession } = useAuth();
  return <CallbackPage config={env.auth} onSession={adoptSession} />;
}
