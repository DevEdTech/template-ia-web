import { useState } from 'react';
import { Button } from '@/shared/components';
import { decrement, increment } from '../model/counter';
import { loadCount, saveCount } from '../services/counterStorage';
import styles from './ExampleCounter.module.css';

/**
 * Componente de exemplo mínimo e interativo.
 * Demonstra a composição das camadas da feature:
 * - `model` para a lógica pura (increment/decrement);
 * - `services` para persistência (localStorage via adaptador).
 */
export function ExampleCounter() {
  const [count, setCount] = useState<number>(() => loadCount() ?? 0);

  function handleIncrement() {
    setCount((c) => {
      const next = increment(c);
      saveCount(next);
      return next;
    });
  }

  function handleDecrement() {
    setCount((c) => {
      const next = decrement(c);
      saveCount(next);
      return next;
    });
  }

  return (
    <div className={styles.counter}>
      <p className={styles.value} aria-live="polite">
        Contagem: <strong data-testid="count-value">{count}</strong>
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleDecrement}>
          Diminuir
        </Button>
        <Button onClick={handleIncrement}>Aumentar</Button>
      </div>
    </div>
  );
}
