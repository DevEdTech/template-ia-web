import { act, fireEvent, render, screen } from '../../../test/render';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NoteList } from '../components/NoteList';

describe('NoteList', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('adiciona e remove uma nota pelo fluxo visível', async () => {
    const user = userEvent.setup();
    render(<NoteList />);

    await user.type(screen.getByPlaceholderText('Nova nota...'), 'Minha nota');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Minha nota')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remover nota: Minha nota' }));
    expect(screen.queryByText('Minha nota')).not.toBeInTheDocument();
    expect(screen.getByText(/Nenhuma nota ainda/)).toBeInTheDocument();
  });

  it('apresenta erro de validação sem alterar o armazenamento', async () => {
    const user = userEvent.setup();
    render(<NoteList />);
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByText('O título da nota é obrigatório.')).toBeInTheDocument();
    expect(localStorage.getItem('notes:list')).toBeNull();
  });

  it('apresenta dados corrompidos sem sobrescrevê-los', () => {
    localStorage.setItem('notes:list', '{corrompido');
    render(<NoteList />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O conteúdo salvo de notas está corrompido',
    );
    expect(localStorage.getItem('notes:list')).toBe('{corrompido');
  });

  it('não atualiza a tela quando a persistência falha', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    render(<NoteList />);

    fireEvent.change(screen.getByPlaceholderText('Nova nota...'), { target: { value: 'Falha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar');
    expect(screen.queryByText('Falha')).not.toBeInTheDocument();
  });

  it('sincroniza alterações recebidas de outra aba', async () => {
    render(<NoteList />);
    const note = { id: 'externa', title: 'Outra aba', createdAt: 123 };
    localStorage.setItem('notes:list', JSON.stringify({ version: 1, revision: 2, notes: [note] }));
    await act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'notes:list' })));

    expect(screen.getByText('Outra aba')).toBeInTheDocument();
  });
});
