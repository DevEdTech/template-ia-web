import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { PageHeader, SectionHeading } from '@vitru/styleguide';
import { ArrowRight, BookOpen, NotebookPen, Palette, Terminal } from 'lucide-react';
import { CopyBlock } from './CopyBlock';
import styles from './HomePage.module.css';

const SETUP_COMMAND = 'npm run setup -- --name="meu-app" --display-name="Meu App"';
const FIRST_PROMPT = `Quero criar [descreva a ideia e quem vai usar].
Leia AGENTS.md e use a skill plan-app para me ajudar a definir o produto.
Faça uma entrevista curta, proponha o escopo da primeira versão e aguarde minha aprovação antes de implementar.`;

export function HomePage({ example }: { example?: ReactNode }) {
  return (
    <div className={styles.page}>
      <section className={styles.intro} aria-label="Boas-vindas">
        <p className={styles.eyebrow}>GUIA DO TEMPLATE</p>
        <PageHeader
          title="Seu projeto começa aqui"
          description="Personalize a base, explore o exemplo e leve sua ideia para a primeira funcionalidade."
        />
        <p className={styles.context}>
          Esta é a página de boas-vindas do template. Substitua-a pela tela do seu produto quando
          estiver pronto.
        </p>
        <a className={styles.startLink} href="#primeiros-passos">
          Ver primeiros passos <ArrowRight className="icon icon-sm" aria-hidden="true" />
        </a>
      </section>

      <section id="primeiros-passos" className={styles.section} aria-labelledby="steps-title">
        <h2 id="steps-title">Do template ao seu projeto</h2>
        <p className={styles.description}>
          Os comandos são executados no terminal, dentro da pasta do projeto. Abra cada etapa
          conforme precisar.
        </p>
        <ol className={styles.steps}>
          <li>
            <details open>
              <summary>
                <span className={styles.stepNumber} aria-hidden="true">
                  01
                </span>
                <span>
                  Personalize o projeto<small>Nome, descrição e ponto de partida</small>
                </span>
              </summary>
              <div className={styles.stepContent}>
                <p>
                  Troque os nomes de exemplo pelos do seu produto. O setup atualiza o nome no app,
                  no pacote e na documentação.
                </p>
                <CopyBlock label="Comando de personalização" text={SETUP_COMMAND} />
                <p className={styles.hint}>
                  Já fez o setup? Siga para a próxima etapa. Para conferir as alterações antes de
                  aplicar, acrescente <code>--dry-run</code>. O setup reinicia <code>tasks.md</code>{' '}
                  por padrão; use <code>--keep-tasks</code> para preservar tarefas que você já
                  criou.
                </p>
              </div>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span className={styles.stepNumber} aria-hidden="true">
                  02
                </span>
                <span>
                  Explore o que já vem pronto
                  <small>Um exemplo funcional e o kit de interface</small>
                </span>
              </summary>
              <div className={styles.stepContent}>
                <p>Veja como os componentes se comportam antes de construir sua primeira tela.</p>
                <div className={styles.links}>
                  {example && (
                    <a href="#exemplo">
                      <NotebookPen className="icon icon-sm" aria-hidden="true" />
                      Experimentar as notas
                    </a>
                  )}
                  <Link to="/styleguide">
                    <Palette className="icon icon-sm" aria-hidden="true" />
                    Abrir o styleguide
                  </Link>
                </div>
                <p className={styles.hint}>
                  Em <code>/styleguide</code> você encontra os componentes, as cores e a tipografia
                  que deve usar no projeto.
                </p>
              </div>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span className={styles.stepNumber} aria-hidden="true">
                  03
                </span>
                <span>
                  Planeje sua primeira funcionalidade<small>Descreva sua ideia para o agente</small>
                </span>
              </summary>
              <div className={styles.stepContent}>
                <p>
                  Preencha o trecho entre colchetes e cole o texto no seu agente de código. Primeiro
                  vocês definem o produto; depois, a implementação.
                </p>
                <CopyBlock label="Prompt para começar" text={FIRST_PROMPT} />
                <p className={styles.hint}>
                  Já tem um produto definido em <code>docs/prd.md</code>? Peça ao agente para usar{' '}
                  <code>plan-feature</code> com a funcionalidade desejada.
                </p>
              </div>
            </details>
          </li>
        </ol>
      </section>

      {example && (
        <section id="exemplo" className={styles.section} aria-label="Exemplo de notas">
          <SectionHeading icon={NotebookPen} title="Experimente: uma lista de notas" />
          <p className={styles.description}>
            Adicione uma nota e recarregue a página: ela continua aqui. Os dados ficam apenas neste
            navegador, sem conta ou servidor.
          </p>
          <div className={styles.example}>{example}</div>
          <details className={styles.reference}>
            <summary>Como usar este exemplo no seu projeto</summary>
            <p>
              Peça ao agente para explorar <code>src/features/notes</code>: ali estão a interface, a
              validação, a persistência e os testes.
            </p>
            <p>
              Quando não precisar mais da demonstração, rode o setup com os dados do seu projeto e
              acrescente <code>--remove-example --keep-tasks</code>. Isso remove as notas do código;
              não apaga dados já salvos no navegador.
            </p>
          </details>
        </section>
      )}

      <section className={styles.section} aria-label="Validação e referências">
        <SectionHeading icon={Terminal} title="Antes de considerar pronto" />
        <p className={styles.description}>
          Execute as verificações do projeto. Se alguma falhar, peça ao agente para corrigir a causa
          antes de continuar.
        </p>
        <CopyBlock label="Comando de validação" text="npm run validate" />
        <div className={styles.docs}>
          <BookOpen className="icon" aria-hidden="true" />
          <p>
            Continue no <code>README.md</code> para instalação e comandos, em{' '}
            <code>docs/agents.md</code> para trabalhar com agentes e em{' '}
            <code>docs/development-process.md</code> para o fluxo de entrega.
          </p>
        </div>
      </section>
    </div>
  );
}
