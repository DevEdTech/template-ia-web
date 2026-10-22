import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { HomePage } from '../components/HomePage';

describe('onboarding do template', () => {
  it('orienta os primeiros passos e permite copiar o comando de personalização', async () => {
    const { user } = renderWithProviders(<HomePage example={<p>Exemplo disponível</p>} />);
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    expect(screen.getByRole('heading', { name: 'Seu projeto começa aqui' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver primeiros passos/ })).toHaveAttribute(
      'href',
      '#primeiros-passos',
    );
    await user.click(screen.getByRole('button', { name: 'Copiar Comando de personalização' }));
    expect(writeText).toHaveBeenCalledWith(
      'npm run setup -- --name="meu-app" --display-name="Meu App"',
    );
    expect(await screen.findByText(/Copiado. Cole/)).toBeInTheDocument();
  });

  it('revela o prompt e orienta a cópia manual quando o navegador nega acesso', async () => {
    const { user } = renderWithProviders(<HomePage />);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permissão negada'));

    await user.click(screen.getByText('Planeje sua primeira funcionalidade'));
    await user.click(screen.getByRole('button', { name: 'Copiar Prompt para começar' }));
    expect(await screen.findByText(/Não foi possível copiar/)).toBeInTheDocument();
    expect(screen.getByText(/Quero criar \[descreva a ideia/)).toBeInTheDocument();
  });

  it('mantém a orientação e o styleguide quando a demonstração foi removida', async () => {
    const { user } = renderWithProviders(<HomePage />);
    await user.click(screen.getByText('Explore o que já vem pronto'));
    expect(screen.getByRole('link', { name: 'Abrir o styleguide' })).toHaveAttribute(
      'href',
      '/styleguide',
    );
    expect(screen.queryByRole('link', { name: 'Experimentar as notas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Exemplo de notas' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copiar Comando de validação' }));
    expect(await navigator.clipboard.readText()).toBe('npm run validate');
  });

  it('direciona para a demonstração e explica como removê-la sem reiniciar tarefas', async () => {
    const { user } = renderWithProviders(<HomePage example={<p>Exemplo disponível</p>} />);
    await user.click(screen.getByText('Explore o que já vem pronto'));
    expect(screen.getByRole('link', { name: 'Experimentar as notas' })).toHaveAttribute(
      'href',
      '#exemplo',
    );
    expect(screen.getByText('Exemplo disponível')).toBeInTheDocument();
    await user.click(screen.getByText('Como usar este exemplo no seu projeto'));
    expect(screen.getByText('--remove-example --keep-tasks')).toBeVisible();
  });
});
