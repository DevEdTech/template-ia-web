import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'danger' | 'highlight';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

/**
 * Etiqueta curta de status ou categoria.
 * O texto precisa fazer sentido sozinho: a cor nunca e a unica informacao.
 */
export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
