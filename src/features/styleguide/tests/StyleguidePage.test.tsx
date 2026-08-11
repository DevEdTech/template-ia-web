import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, within } from '../../../test/render';
import { StyleguidePage } from '../components/StyleguidePage';
import { COLOR_GROUPS, RADIUS_TOKENS, SPACE_TOKENS, TEXT_TOKENS } from '../model/tokens';

describe('styleguide', () => {
  it('mostra as seções de tokens e os componentes base', () => {
    renderWithProviders(<StyleguidePage />);

    expect(screen.getByRole('heading', { name: 'Styleguide' })).toBeInTheDocument();
    for (const name of [
      'Cores',
      'Tipografia',
      'Espaçamento e raio',
      'Botões',
      'Cabeçalho de tela',
      'Campos de formulário',
      'Blocos e etiquetas',
      'Avisos',
      'Tabela',
      'Estados de tela',
      'Janela modal',
      'Ícones',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }

    expect(screen.getByRole('button', { name: 'Ação primária' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desabilitado' })).toBeDisabled();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('demonstra o kit inteiro, para que nada saia do padrão sem aparecer aqui', async () => {
    const { user } = renderWithProviders(<StyleguidePage />);

    // Campos: rótulo, dica e erro ligados ao controle.
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('Como aparece no contrato');

    // Tabela com legenda e estados de tela.
    expect(screen.getByRole('table', { name: 'Clientes ativos' })).toBeInTheDocument();
    expect(screen.getByText('Nenhum cliente ainda')).toBeInTheDocument();

    // Modal abre e fecha.
    await user.click(screen.getByRole('button', { name: 'Abrir exemplo' }));
    expect(screen.getByRole('heading', { name: 'Confirmar exclusão' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('heading', { name: 'Confirmar exclusão' })).toBeNull();
  });

  it('documenta cada token do catálogo', () => {
    renderWithProviders(<StyleguidePage />);

    const colorTokens = COLOR_GROUPS.flatMap((group) => group.entries);
    for (const { name } of [...colorTokens, ...TEXT_TOKENS, ...SPACE_TOKENS, ...RADIUS_TOKENS]) {
      expect(screen.getAllByText(new RegExp(`^${name}(\\s|$)`)).length).toBeGreaterThan(0);
    }
  });

  it('usa a cor do token, e não um valor literal, em cada amostra', () => {
    const { container } = renderWithProviders(<StyleguidePage />);

    const chips = container.querySelectorAll<HTMLElement>('[style*="background-color"]');
    expect(chips.length).toBe(COLOR_GROUPS.flatMap((group) => group.entries).length);
    for (const chip of chips) {
      expect(chip.getAttribute('style')).toMatch(/background-color:\s*var\(--[a-z0-9-]+\)/);
    }
  });

  it('renderiza os ícones da lucide-react', () => {
    const { container } = renderWithProviders(<StyleguidePage />);

    const iconList = container.querySelector('ul[class*="iconList"]');
    expect(iconList).not.toBeNull();
    expect(within(iconList as HTMLElement).getByText('Search')).toBeInTheDocument();
    expect(iconList?.querySelectorAll('svg.icon').length).toBeGreaterThan(5);
  });
});
