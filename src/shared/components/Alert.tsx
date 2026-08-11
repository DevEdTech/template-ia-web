import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertVariant = 'info' | 'success' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  /** Titulo curto; opcional quando a mensagem ja e uma frase completa. */
  title?: string;
  children: ReactNode;
}

const ICONS = {
  info: Info,
  success: CircleCheck,
  danger: TriangleAlert,
} as const;

/**
 * Mensagem de estado para a pessoa que usa a tela.
 * `danger` e anunciado por leitores de tela assim que aparece.
 */
export function Alert({ variant = 'info', title, children }: AlertProps) {
  const Icon = ICONS[variant];

  return (
    <div
      className={`${styles.alert} ${styles[variant]}`}
      role={variant === 'danger' ? 'alert' : 'status'}
    >
      <Icon className="icon" aria-hidden="true" />
      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <p className={styles.body}>{children}</p>
      </div>
    </div>
  );
}
