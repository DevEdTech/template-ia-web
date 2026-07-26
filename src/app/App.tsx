// App: layout principal da aplicacao e roteamento base.
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/components';
import styles from './App.module.css';

const PROJECT_NAME = 'Web Project Template';

export function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>{PROJECT_NAME}</h1>
        <p className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />O template está funcionando.
        </p>
      </header>

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
  );
}
