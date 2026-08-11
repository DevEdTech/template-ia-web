import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Download,
  Info,
  Palette,
  Pencil,
  Plus,
  Ruler,
  Search,
  Settings,
  Trash2,
  TriangleAlert,
  Type,
} from 'lucide-react';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Select,
  Table,
  Textarea,
  type TableColumn,
} from '@/shared/components';
import {
  COLOR_GROUPS,
  RADIUS_TOKENS,
  SAMPLE_ROWS,
  SPACE_TOKENS,
  TEXT_TOKENS,
  type SampleRow,
  type TokenEntry,
} from '../model/tokens';
import styles from './StyleguidePage.module.css';

const SAMPLE_ICONS = [
  { name: 'Search', Icon: Search },
  { name: 'Check', Icon: Check },
  { name: 'Info', Icon: Info },
  { name: 'TriangleAlert', Icon: TriangleAlert },
  { name: 'Pencil', Icon: Pencil },
  { name: 'Trash2', Icon: Trash2 },
  { name: 'Calendar', Icon: Calendar },
  { name: 'Bell', Icon: Bell },
  { name: 'Download', Icon: Download },
  { name: 'Settings', Icon: Settings },
  { name: 'ChevronRight', Icon: ChevronRight },
] as const;

const SAMPLE_COLUMNS: readonly TableColumn<SampleRow>[] = [
  { key: 'nome', header: 'Nome', cell: (row) => row.nome },
  { key: 'plano', header: 'Plano', cell: (row) => row.plano },
  {
    key: 'situacao',
    header: 'Situação',
    align: 'end',
    cell: (row) => (
      <Badge variant={row.ativo ? 'success' : 'danger'}>{row.ativo ? 'Ativo' : 'Vencido'}</Badge>
    ),
  },
];

function Swatch({ name, usage }: TokenEntry) {
  return (
    <li className={styles.swatch}>
      <span
        className={styles.chip}
        style={{ backgroundColor: `var(${name})` }}
        aria-hidden="true"
      />
      <code className={styles.token}>{name}</code>
      <span className={styles.usage}>{usage}</span>
    </li>
  );
}

/**
 * Styleguide vivo do projeto: mostra os tokens de `shared/styles/tokens.css`
 * aplicados de verdade, nao uma copia dos valores. Serve de referencia para
 * pessoas e agentes ao criar telas novas.
 *
 * Esta pagina permanece no projeto depois do `npm run setup`. Ao evoluir a
 * identidade visual, atualize os tokens e esta pagina acompanha.
 */
export function StyleguidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <h2>Styleguide</h2>
        <p>
          Tudo aqui vem dos tokens declarados em <code className={styles.code}>tokens.css</code>. Ao
          construir uma tela, use estes tokens em vez de valores literais: cor, espaçamento,
          tipografia, raio e movimento já estão definidos.
        </p>
      </section>

      <section className={styles.section}>
        <h3>
          <Palette className="icon" aria-hidden="true" />
          Cores
        </h3>
        {COLOR_GROUPS.map((group) => (
          <div key={group.title}>
            <p className={styles.groupTitle}>{group.title}</p>
            <ul className={styles.swatches}>
              {group.entries.map((entry) => (
                <Swatch key={entry.name} {...entry} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h3>
          <Type className="icon" aria-hidden="true" />
          Tipografia
        </h3>
        <ul className={styles.typeList}>
          {TEXT_TOKENS.map((entry) => (
            <li key={entry.name}>
              <span style={{ fontSize: `var(${entry.name})` }}>Texto de exemplo</span>
              <code className={styles.token}>
                {entry.name} · {entry.usage}
              </code>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>
          <Ruler className="icon" aria-hidden="true" />
          Espaçamento e raio
        </h3>
        <ul className={styles.spaceList}>
          {SPACE_TOKENS.map((entry) => (
            <li key={entry.name}>
              <span
                className={styles.spaceBar}
                style={{ width: `var(${entry.name})` }}
                aria-hidden="true"
              />
              <code className={styles.token}>
                {entry.name} · {entry.usage}
              </code>
            </li>
          ))}
        </ul>
        <ul className={styles.radiusList}>
          {RADIUS_TOKENS.map((entry) => (
            <li key={entry.name}>
              <span
                className={styles.radiusSample}
                style={{ borderRadius: `var(${entry.name})` }}
                aria-hidden="true"
              />
              <code className={styles.token}>{entry.name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>Botões</h3>
        <div className={styles.row}>
          <Button>Ação primária</Button>
          <Button variant="secondary">Ação secundária</Button>
          <Button variant="danger">
            <Trash2 className="icon icon-sm" aria-hidden="true" />
            Ação destrutiva
          </Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <p className={styles.note}>
          Uma ação primária por tela. Ação destrutiva sempre confirma antes de executar.
        </p>
      </section>

      <section className={styles.section}>
        <h3>Cabeçalho de tela</h3>
        <PageHeader
          title="Clientes"
          description="Quem já comprou pelo menos uma vez."
          actions={
            <Button>
              <Plus className="icon icon-sm" aria-hidden="true" />
              Novo cliente
            </Button>
          }
        />
      </section>

      <section className={styles.section}>
        <h3>Campos de formulário</h3>
        <div className={styles.formGrid}>
          <Input label="Nome" hint="Como aparece no contrato" placeholder="Digite aqui..." />
          <Input label="E-mail" error="Informe um e-mail válido" defaultValue="ana@" />
          <Select
            label="Situação"
            placeholder="Selecione..."
            options={[
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
            ]}
          />
          <Textarea label="Observações" hint="Opcional" />
        </div>
      </section>

      <section className={styles.section}>
        <h3>Blocos e etiquetas</h3>
        <div className={styles.cardGrid}>
          <Card title="Bloco padrão">
            <p className={styles.usage}>Agrupa informação relacionada.</p>
          </Card>
          <Card title="Bloco de apoio" tone="quiet">
            <p className={styles.usage}>Fundo suave, para contexto secundário.</p>
          </Card>
        </div>
        <div className={styles.row}>
          <Badge>Neutro</Badge>
          <Badge variant="accent">Em análise</Badge>
          <Badge variant="success">Ativo</Badge>
          <Badge variant="danger">Vencido</Badge>
          <Badge variant="highlight">Hoje</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Avisos</h3>
        <div className={styles.stack}>
          <Alert>Salvamos as alterações automaticamente.</Alert>
          <Alert variant="success" title="Cadastro concluído">
            O cliente já aparece na lista.
          </Alert>
          <Alert variant="danger" title="Não foi possível salvar">
            Verifique a conexão e tente de novo.
          </Alert>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Tabela</h3>
        <Table
          caption="Clientes ativos"
          columns={SAMPLE_COLUMNS}
          rows={SAMPLE_ROWS}
          rowKey={(row) => row.id}
        />
      </section>

      <section className={styles.section}>
        <h3>Estados de tela</h3>
        <p className={styles.note}>
          Toda tela que busca dados precisa cobrir os quatro estados: carregando, vazio, erro e
          sucesso.
        </p>
        <div className={styles.cardGrid}>
          <Card tone="quiet">
            <LoadingState label="Carregando clientes" />
          </Card>
          <Card tone="quiet">
            <EmptyState
              title="Nenhum cliente ainda"
              description="Cadastre o primeiro para começar."
              action={<Button variant="secondary">Cadastrar</Button>}
            />
          </Card>
          <Card tone="quiet">
            <ErrorState action={<Button variant="secondary">Tentar de novo</Button>} />
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Janela modal</h3>
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          Abrir exemplo
        </Button>
        <Dialog
          open={dialogOpen}
          title="Confirmar exclusão"
          onClose={() => setDialogOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={() => setDialogOpen(false)}>
                Excluir
              </Button>
            </>
          }
        >
          Esta ação não pode ser desfeita.
        </Dialog>
      </section>

      <section className={styles.section}>
        <h3>Ícones</h3>
        <p className={styles.note}>
          A biblioteca padrão é <code className={styles.code}>lucide-react</code>. Importe o ícone
          pelo nome, aplique a classe <code className={styles.code}>icon</code> (ou{' '}
          <code className={styles.code}>icon-sm</code>) e marque como{' '}
          <code className={styles.code}>aria-hidden</code> quando for decorativo.
        </p>
        <ul className={styles.iconList}>
          {SAMPLE_ICONS.map(({ name, Icon }) => (
            <li key={name}>
              <Icon className="icon" aria-hidden="true" />
              <span className={styles.iconName}>{name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
