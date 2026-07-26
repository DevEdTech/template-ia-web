// App: apenas layout e composição. Sem regra de negócio aqui.
import { ExampleCounter } from '@/features/example';
import styles from './App.module.css';

const PROJECT_NAME = 'Web Project Template';

const NPM_SCRIPTS: ReadonlyArray<{ command: string; description: string }> = [
  { command: 'npm run dev', description: 'Inicia o servidor de desenvolvimento (Vite)' },
  { command: 'npm run build', description: 'Type-check e build de produção' },
  { command: 'npm run lint', description: 'Roda o ESLint' },
  { command: 'npm run format', description: 'Formata os arquivos com Prettier' },
  { command: 'npm run typecheck', description: 'Verifica os tipos com o TypeScript' },
  { command: 'npm run test', description: 'Roda os testes com Vitest' },
  { command: 'npm run validate', description: 'Roda toda a suíte de verificações' },
];

export function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>{PROJECT_NAME}</h1>
        <p className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />O template está funcionando.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Componente de exemplo</h2>
        <ExampleCounter />
      </section>

      <section className={styles.section}>
        <h2>Comandos npm disponíveis</h2>
        <ul className={styles.scripts}>
          {NPM_SCRIPTS.map(({ command, description }) => (
            <li key={command}>
              <code>{command}</code>
              <span>{description}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
