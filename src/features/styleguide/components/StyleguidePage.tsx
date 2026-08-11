import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Download,
  Info,
  Palette,
  Pencil,
  Ruler,
  Search,
  Settings,
  Trash2,
  TriangleAlert,
  Type,
} from 'lucide-react';
import { Button } from '@/shared/components';
import {
  COLOR_GROUPS,
  RADIUS_TOKENS,
  SPACE_TOKENS,
  TEXT_TOKENS,
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
        <h3>Componentes</h3>
        <div className={styles.row}>
          <Button>Ação primária</Button>
          <Button variant="secondary">Ação secundária</Button>
          <Button variant="danger">
            <Trash2 className="icon icon-sm" aria-hidden="true" />
            Ação destrutiva
          </Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <div className={styles.field}>
          <label htmlFor="styleguide-field">Campo de texto</label>
          <input id="styleguide-field" type="text" placeholder="Digite aqui..." readOnly />
        </div>
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
