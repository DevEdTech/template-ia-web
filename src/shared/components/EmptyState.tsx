import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './States.module.css';

export interface EmptyStateProps {
  title: string;
  /** Diga o proximo passo, nao apenas que a lista esta vazia. */
  description?: string;
  /** Acao que resolve o vazio (normalmente um `Button`). */
  action?: ReactNode;
}

/** Estado vazio padrao: explica a ausencia e oferece o proximo passo. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <Inbox className={`icon ${styles.mark}`} aria-hidden="true" />
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
