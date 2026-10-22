import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { hasScopes } from '../model/session';
import { useAuth } from '../hooks/useAuth';
import styles from './RequireAuth.module.css';

export interface RequireAuthProps {
  readonly children: ReactNode;
  /** Escopos exigidos pela area protegida. */
  readonly scopes?: readonly string[];
}

/**
 * Guarda de rota. Envolve o conteudo protegido e cobre os quatro estados:
 * descobrindo, levando ao provedor, autenticada e falha.
 *
 * Nao redireciona por conta propria quando ja ha sessao sem o escopo pedido:
 * mandar o usuario de volta ao provedor nao resolve falta de permissao, e o
 * laco de redirecionamento e pior que a mensagem.
 */
export function RequireAuth({ children, scopes = [] }: RequireAuthProps) {
  const { state, login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (state.status !== 'anonima') return;
    void login(`${location.pathname}${location.search}`);
  }, [state.status, login, location.pathname, location.search]);

  if (state.status === 'autenticada') {
    if (!hasScopes(state.session, scopes)) {
      return (
        <div className={styles.block} role="alert">
          <h2>Acesso insuficiente</h2>
          <p>
            Esta area exige {scopes.join(', ')}. Sua sessao atual nao tem essa permissao — fale com
            quem administra o acesso.
          </p>
        </div>
      );
    }
    return <>{children}</>;
  }

  if (state.status === 'erro') {
    return (
      <div className={styles.block} role="alert">
        <h2>Nao foi possivel entrar</h2>
        <p>{state.message}</p>
        <button type="button" onClick={() => void login(location.pathname)}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.block} aria-live="polite">
      <p>Levando você ao login…</p>
    </div>
  );
}
