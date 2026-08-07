// App: layout principal da aplicacao e roteamento base.
//
// Erros de renderizacao deste layout ou das rotas filhas sao tratados pelo
// `errorElement` registrado em `app/routes`, que cobre inclusive falhas no
// proprio header. Para isolar um widget arriscado dentro de uma pagina, use
// o `ErrorBoundary` de `shared/components`.
import { Outlet } from 'react-router';
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

      <Outlet />
    </main>
  );
}
