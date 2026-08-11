import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  /** Explica em uma frase o que a pessoa faz nesta tela. */
  description?: string;
  /** Ações da tela (normalmente um `Button` primário e um secundário). */
  actions?: ReactNode;
}

/**
 * Cabecalho padrao de uma tela: titulo, descricao curta e acoes.
 * Toda pagina comeca com ele, para que as telas do projeto tenham a
 * mesma hierarquia visual.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.texts}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
