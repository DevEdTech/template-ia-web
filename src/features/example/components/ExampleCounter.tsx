import { useEffect, useState } from 'react';
import { Button } from '../../../shared/components';
import { decrement, increment } from '../model/counter';
import { loadCount, saveCount } from '../services/counterStorage';
import styles from './ExampleCounter.module.css';

/**
 * Componente de exemplo minimo e interativo.
 * Demonstra a composicao das camadas da feature:
 * - `model` para a logica pura (increment/decrement);
 * - `services` para persistencia (localStorage via adaptador).
 */
export function ExampleCounter() {
  const [count, setCount] = useState<number>(() => loadCount() ?? 0);

  useEffect(() => {
    saveCount(count);
  }, [count]);

  return (
    <div className={styles.counter}>
      <p className={styles.value} aria-live="polite">
        Contagem: <strong data-testid="count-value">{count}</strong>
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setCount((c) => decrement(c))}>
          Diminuir
        </Button>
        <Button onClick={() => setCount((c) => increment(c))}>Aumentar</Button>
      </div>
    </div>
  );
}
