// App: layout principal da aplicacao e roteamento base.
//
// Erros de renderizacao deste layout ou das rotas filhas sao tratados pelo
// `errorElement` registrado em `app/routes`, que cobre inclusive falhas no
// proprio header. Para isolar um widget arriscado dentro de uma pagina, use
// o `ErrorBoundary` de `@vitru/styleguide`.
import { Home, Palette } from 'lucide-react';
import { NavLink, Outlet, useMatch } from 'react-router';
import { env } from '@/shared/config/env';
import styles from './App.module.css';

const PROJECT_NAME = 'Web Project Template';

export function App() {
  const isStyleguide = useMatch('/styleguide');

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={styles.brand}>
          {/* Marca decorativa: o nome do projeto ao lado ja identifica a pagina. */}
          <img
            className={styles.mark}
            src={`${env.baseUrl}favicon.svg`}
            alt=""
            width="28"
            height="28"
          />
          <h1 className={styles.projectName}>{PROJECT_NAME}</h1>
        </div>
        <nav className={styles.nav} aria-label="Navegação principal">
          <NavLink to="/" end>
            <Home className="icon icon-sm" aria-hidden="true" />
            Início
          </NavLink>
          <NavLink to="/styleguide">
            <Palette className="icon icon-sm" aria-hidden="true" />
            Styleguide
          </NavLink>
        </nav>
      </header>

      <main
        id="conteudo"
        className={`${styles.content} ${isStyleguide ? styles.fullWidth : ''}`}
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  );
}
