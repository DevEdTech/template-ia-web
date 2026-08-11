import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './States.module.css';

export interface ErrorStateProps {
  title?: string;
  /** Explique o que aconteceu em linguagem simples, sem termos tecnicos. */
  description?: string;
  /** Acao de recuperacao, normalmente "Tentar de novo". */
  action?: ReactNode;
}

/** Estado de erro padrao de uma area da tela, com caminho de recuperacao. */
export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Tente novamente em alguns instantes.',
  action,
}: ErrorStateProps) {
  return (
    <div className={`${styles.state} ${styles.danger}`} role="alert">
      <TriangleAlert className={`icon ${styles.mark}`} aria-hidden="true" />
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
