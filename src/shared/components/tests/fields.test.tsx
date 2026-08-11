import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../../test/render';
import { Input, Select, Textarea } from '../index';

describe('campos do kit', () => {
  it('liga rótulo, dica e erro ao controle', () => {
    renderWithProviders(
      <Input label="Título" hint="Até 60 caracteres" error="Informe um título" />,
    );

    const input = screen.getByLabelText('Título');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Até 60 caracteres Informe um título');
    expect(screen.getByText('Informe um título')).toBeInTheDocument();
  });

  it('não marca o campo como inválido quando não há erro', () => {
    renderWithProviders(<Input label="Título" hint="Até 60 caracteres" />);

    const input = screen.getByLabelText('Título');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('Até 60 caracteres');
  });

  it('gera identificadores distintos para cada campo', () => {
    renderWithProviders(
      <>
        <Input label="Primeiro" />
        <Input label="Segundo" />
      </>,
    );

    expect(screen.getByLabelText('Primeiro').id).not.toBe(screen.getByLabelText('Segundo').id);
  });

  it('digita no campo de texto longo', async () => {
    const { user } = renderWithProviders(<Textarea label="Observações" />);

    await user.type(screen.getByLabelText('Observações'), 'nota');

    expect(screen.getByLabelText('Observações')).toHaveValue('nota');
  });

  it('lista as opções do select com o texto vazio inicial', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <Select
        label="Situação"
        placeholder="Selecione..."
        onChange={onChange}
        options={[
          { value: 'aberta', label: 'Aberta' },
          { value: 'fechada', label: 'Fechada' },
        ]}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Situação'), 'fechada');

    expect(screen.getByRole('option', { name: 'Selecione...' })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('Situação')).toHaveValue('fechada');
  });
});
