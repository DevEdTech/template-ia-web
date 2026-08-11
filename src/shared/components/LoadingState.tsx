import styles from './States.module.css';

export interface LoadingStateProps {
  /** Diga o que esta carregando; evita a tela muda de "Carregando...". */
  label?: string;
}

/** Estado de carregamento padrao, anunciado por leitores de tela. */
export function LoadingState({ label = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className={styles.state} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.description}>{label}</p>
    </div>
  );
}
