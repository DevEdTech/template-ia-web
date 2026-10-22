import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import type { AuthEnv } from '@/shared/config/env';
import { AuthError, type Session, createSession } from '../model/session';
import { completeAuthorization } from '../services/authClient';
import styles from './RequireAuth.module.css';

export interface CallbackPageProps {
  readonly config: AuthEnv | undefined;
  /** Recebe a sessao concluida; normalmente eleva o estado ao provedor. */
  readonly onSession: (session: Session) => void;
  readonly now?: () => number;
}

/**
 * Pagina de retorno do provedor (`redirect_uri`).
 *
 * Troca o codigo por token uma unica vez: o `code` e de uso unico e o
 * `StrictMode` monta o efeito duas vezes em desenvolvimento, o que faria a
 * segunda troca falhar com erro enganoso.
 */
export function CallbackPage({ config, onSession, now = Date.now }: CallbackPageProps) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    // Falta de configuracao e decidida no render, abaixo: so o que depende de
    // rede justifica um efeito.
    if (config === undefined || attempted.current) return;
    attempted.current = true;

    void (async () => {
      try {
        const { token, returnTo } = await completeAuthorization(config, params);
        onSession(createSession(token, now()));
        // `replace`: o endereco de retorno carrega o codigo usado e nao deve
        // ficar no historico.
        void navigate(returnTo, { replace: true });
      } catch (error) {
        setProblem(
          error instanceof AuthError || error instanceof Error
            ? error.message
            : 'Falha ao concluir o login.',
        );
      }
    })();
  }, [config, params, navigate, onSession, now]);

  const falha = config === undefined ? 'Autenticacao nao configurada neste ambiente.' : problem;

  if (falha !== null) {
    return (
      <div className={styles.block} role="alert">
        <h2>Login nao concluido</h2>
        <p>{falha}</p>
        <button type="button" onClick={() => void navigate('/', { replace: true })}>
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className={styles.block} aria-live="polite">
      <p>Concluindo o login…</p>
    </div>
  );
}
