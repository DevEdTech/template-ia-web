import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function Explode(): never {
  throw new Error('falha proposital');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React registra o erro capturado no console; silenciamos para nao
    // poluir a saida dos testes com um stack trace esperado.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza os filhos quando nada falha', () => {
    render(
      <ErrorBoundary>
        <p>conteudo saudavel</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('conteudo saudavel')).toBeInTheDocument();
  });

  it('mostra a mensagem padrao quando um filho lanca erro', () => {
    render(
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /algo deu errado/i })).toBeInTheDocument();
  });

  it('usa o fallback informado no lugar da mensagem padrao', () => {
    render(
      <ErrorBoundary fallback={<p>tente novamente mais tarde</p>}>
        <Explode />
      </ErrorBoundary>,
    );

    expect(screen.getByText('tente novamente mais tarde')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /algo deu errado/i })).not.toBeInTheDocument();
  });

  it('registra o erro capturado para diagnostico', () => {
    render(
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });
});
