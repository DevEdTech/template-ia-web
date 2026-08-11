import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../../test/render';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Table,
} from '../index';

describe('estrutura de tela', () => {
  it('monta o cabeçalho com título, descrição e ações', () => {
    renderWithProviders(
      <PageHeader
        title="Clientes"
        description="Quem já comprou pelo menos uma vez."
        actions={<Button>Novo cliente</Button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeInTheDocument();
    expect(screen.getByText('Quem já comprou pelo menos uma vez.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Novo cliente' })).toBeInTheDocument();
  });

  it('agrupa conteúdo em um bloco com título', () => {
    renderWithProviders(
      <Card title="Resumo" tone="quiet">
        <p>Conteúdo</p>
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Resumo' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });
});

describe('mensagens de estado', () => {
  it('anuncia erro como alerta e informação como status', () => {
    renderWithProviders(
      <>
        <Alert variant="danger" title="Falhou">
          Tente de novo.
        </Alert>
        <Alert>Salvamos suas alterações.</Alert>
      </>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    expect(screen.getByRole('status')).toHaveTextContent('Salvamos suas alterações.');
  });

  it('mostra etiquetas com texto próprio, sem depender da cor', () => {
    renderWithProviders(<Badge variant="success">Ativo</Badge>);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('cobre carregando, vazio e erro', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <>
        <LoadingState label="Carregando clientes" />
        <EmptyState
          title="Nenhum cliente ainda"
          description="Cadastre o primeiro para começar."
          action={<Button>Cadastrar</Button>}
        />
        <ErrorState action={<Button onClick={onRetry}>Tentar de novo</Button>} />
      </>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Carregando clientes');
    expect(screen.getByText('Nenhum cliente ainda')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

interface Linha {
  id: string;
  nome: string;
}

const COLUNAS = [
  { key: 'nome', header: 'Nome', cell: (linha: Linha) => linha.nome },
  { key: 'acao', header: 'Ação', align: 'end' as const, cell: () => <Badge>Ativo</Badge> },
];

describe('tabela', () => {
  it('mostra legenda, cabeçalhos e linhas', () => {
    renderWithProviders(
      <Table
        caption="Clientes ativos"
        columns={COLUNAS}
        rows={[{ id: '1', nome: 'Ana' }]}
        rowKey={(linha) => linha.id}
      />,
    );

    expect(screen.getByRole('table', { name: 'Clientes ativos' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ana' })).toBeInTheDocument();
  });

  it('mostra o estado vazio quando não há linhas', () => {
    renderWithProviders(
      <Table
        caption="Clientes ativos"
        columns={COLUNAS}
        rows={[]}
        rowKey={(linha: Linha) => linha.id}
      />,
    );

    expect(screen.getByText('Nenhum registro para mostrar.')).toBeInTheDocument();
  });
});

describe('dialog', () => {
  it('abre, fecha pelo botão e mantém o conteúdo acessível', async () => {
    const onClose = vi.fn();
    const { user, rerender } = renderWithProviders(
      <Dialog open title="Confirmar exclusão" onClose={onClose} footer={<Button>Excluir</Button>}>
        Esta ação não pode ser desfeita.
      </Dialog>,
    );

    expect(screen.getByRole('heading', { name: 'Confirmar exclusão' })).toBeInTheDocument();
    expect(screen.getByText('Esta ação não pode ser desfeita.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <Dialog open={false} title="Confirmar exclusão" onClose={onClose}>
        Esta ação não pode ser desfeita.
      </Dialog>,
    );
    // Fechado, o conteúdo sai da árvore de acessibilidade.
    expect(screen.queryByRole('heading', { name: 'Confirmar exclusão' })).toBeNull();
  });
});
