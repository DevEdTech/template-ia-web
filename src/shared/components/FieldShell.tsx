import type { ReactNode } from 'react';
import styles from './FieldShell.module.css';

export interface FieldOwnProps {
  /** Rotulo visivel. Obrigatorio: campo sem rotulo nao passa na revisao. */
  label: string;
  /** Texto de apoio mostrado abaixo do campo. */
  hint?: string;
  /** Mensagem de erro; quando presente, o campo fica marcado como invalido. */
  error?: string;
}

interface FieldShellProps extends FieldOwnProps {
  controlId: string;
  hintId: string;
  errorId: string;
  children: ReactNode;
}

/**
 * Estrutura comum de um campo de formulario: rotulo associado, dica e erro.
 * Interno ao kit; `Input`, `Textarea` e `Select` a utilizam para que todos os
 * campos do projeto tenham a mesma marcacao e a mesma semantica.
 */
export function FieldShell({
  label,
  hint,
  error,
  controlId,
  hintId,
  errorId,
  children,
}: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {/* A regiao existe sempre: assim o erro e anunciado quando aparece. */}
      <div aria-live="polite">
        {error ? (
          <p className={styles.error} id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
