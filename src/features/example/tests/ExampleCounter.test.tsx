import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { ExampleCounter } from '../components/ExampleCounter';

describe('ExampleCounter', () => {
  it('inicia a contagem em zero', () => {
    renderWithProviders(<ExampleCounter />);
    expect(screen.getByTestId('count-value')).toHaveTextContent('0');
  });

  it('incrementa ao clicar em "Aumentar"', async () => {
    const { user } = renderWithProviders(<ExampleCounter />);

    await user.click(screen.getByRole('button', { name: 'Aumentar' }));
    await user.click(screen.getByRole('button', { name: 'Aumentar' }));

    expect(screen.getByTestId('count-value')).toHaveTextContent('2');
  });

  it('não decrementa abaixo de zero', async () => {
    const { user } = renderWithProviders(<ExampleCounter />);

    await user.click(screen.getByRole('button', { name: 'Diminuir' }));

    expect(screen.getByTestId('count-value')).toHaveTextContent('0');
  });
});
