import { expect, test } from '@playwright/test';

test('executa o fluxo principal e preserva a rota de fallback', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('textbox', { name: 'Título da nota' }).fill('Nota pelo navegador');
  await page.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByText('Nota pelo navegador')).toBeVisible();

  await page.getByRole('button', { name: 'Remover nota: Nota pelo navegador' }).click();
  await expect(page.getByText('Nota pelo navegador')).toBeHidden();
  await expect(page.getByText(/Nenhuma nota ainda/)).toBeVisible();

  await page.goto('/rota-que-nao-existe');
  await expect(page.getByRole('heading', { name: /pagina nao encontrada/i })).toBeVisible();
});

test('publica o styleguide com os tokens aplicados', async ({ page }) => {
  await page.goto('/styleguide');

  await expect(page.getByRole('heading', { name: 'Styleguide' })).toBeVisible();

  // O tema precisa estar ativo: a acao primaria usa --accent (#281352) e a
  // acao destrutiva usa --danger-bg. Se os tokens sumirem, isto quebra.
  await expect(page.getByRole('button', { name: 'Ação primária' })).toHaveCSS(
    'background-color',
    'rgb(40, 19, 82)',
  );
  await expect(page.getByRole('button', { name: 'Ação destrutiva' })).toHaveCSS(
    'background-color',
    'rgb(255, 245, 246)',
  );
});
