/**
 * Catalogo dos tokens exibidos na pagina do styleguide.
 *
 * Os valores nao sao duplicados aqui: cada item guarda apenas o nome do
 * custom property, e a pagina renderiza `var(--nome)`. A fonte de verdade
 * continua sendo `src/shared/styles/tokens.css`.
 */
export interface TokenEntry {
  readonly name: string;
  readonly usage: string;
}

export interface TokenGroup {
  readonly title: string;
  readonly entries: readonly TokenEntry[];
}

export const COLOR_GROUPS: readonly TokenGroup[] = [
  {
    title: 'Superfícies e texto',
    entries: [
      { name: '--paper', usage: 'Fundo padrão da aplicação' },
      { name: '--paper-2', usage: 'Fundo de blocos e listas' },
      { name: '--ink', usage: 'Texto principal' },
      { name: '--ink-soft', usage: 'Texto secundário e legendas' },
      { name: '--line', usage: 'Bordas e divisores' },
    ],
  },
  {
    title: 'Marca e ação',
    entries: [
      { name: '--accent', usage: 'Ação primária, links e foco' },
      { name: '--navy', usage: 'Títulos e áreas de marca' },
      { name: '--navy-strong', usage: 'Estado hover da ação primária' },
      { name: '--on-accent', usage: 'Texto sobre a cor de ação' },
    ],
  },
  {
    title: 'Estados',
    entries: [
      { name: '--success', usage: 'Confirmação e status positivo' },
      { name: '--danger', usage: 'Erro e ação destrutiva' },
      { name: '--danger-line', usage: 'Borda de área com erro' },
      { name: '--danger-bg', usage: 'Fundo de área com erro' },
      { name: '--danger-bg-hover', usage: 'Hover da área com erro' },
    ],
  },
  {
    title: 'Formulários',
    entries: [
      { name: '--field-bg', usage: 'Fundo de campo' },
      { name: '--field-border', usage: 'Borda de campo' },
    ],
  },
  {
    title: 'Destaques e sobreposição',
    entries: [
      { name: '--week-today-bg', usage: 'Marcação de destaque (ex.: hoje)' },
      { name: '--week-today-fill', usage: 'Preenchimento suave do destaque' },
      { name: '--shadow', usage: 'Cor das sombras' },
      { name: '--backdrop', usage: 'Fundo de modal e overlay' },
      { name: '--bar-edge', usage: 'Borda sutil sobre superfícies coloridas' },
    ],
  },
  {
    title: 'Eventos',
    entries: [
      { name: '--event-ferias-bg', usage: 'Férias (fundo)' },
      { name: '--event-ferias-ink', usage: 'Férias (texto)' },
      { name: '--event-viagem-bg', usage: 'Viagem (fundo)' },
      { name: '--event-viagem-ink', usage: 'Viagem (texto)' },
      { name: '--event-evento-bg', usage: 'Evento (fundo)' },
      { name: '--event-evento-ink', usage: 'Evento (texto)' },
    ],
  },
];

export const TEXT_TOKENS: readonly TokenEntry[] = [
  { name: '--text-2xl', usage: 'Título da página' },
  { name: '--text-xl', usage: 'Título de seção' },
  { name: '--text-lg', usage: 'Subtítulo' },
  { name: '--text-md', usage: 'Texto padrão' },
  { name: '--text-sm', usage: 'Apoio e legendas' },
  { name: '--text-xs', usage: 'Metadados' },
];

export const SPACE_TOKENS: readonly TokenEntry[] = [
  { name: '--space-1', usage: '4px' },
  { name: '--space-2', usage: '8px' },
  { name: '--space-3', usage: '12px' },
  { name: '--space-4', usage: '16px' },
  { name: '--space-5', usage: '24px' },
  { name: '--space-6', usage: '32px' },
  { name: '--space-7', usage: '40px' },
  { name: '--space-8', usage: '48px' },
];

export const RADIUS_TOKENS: readonly TokenEntry[] = [
  { name: '--radius-sm', usage: 'Campos e blocos densos' },
  { name: '--radius-md', usage: 'Botões e cartões' },
  { name: '--radius-lg', usage: 'Áreas grandes' },
  { name: '--radius-pill', usage: 'Etiquetas e chips' },
];
