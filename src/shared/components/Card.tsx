import type { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Titulo opcional; quando presente, vira o cabecalho do bloco. */
  title?: string;
  /** `quiet` para blocos de apoio, `raised` para destacar do fundo. */
  tone?: 'plain' | 'quiet' | 'raised';
  children: ReactNode;
}

/**
 * Bloco de conteudo com superficie, borda e espacamento padronizados.
 * Use para agrupar informacao relacionada; nao use como decoracao.
 */
export function Card({ title, tone = 'plain', children }: CardProps) {
  const classes = [styles.card, tone !== 'plain' && styles[tone]].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {children}
    </section>
  );
}
