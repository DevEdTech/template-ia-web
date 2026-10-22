import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const hasNotesExample = existsSync('src/features/notes');

test('executa o fluxo de notas e preserva os dados ao recarregar', async ({ page }) => {
  test.skip(!hasNotesExample, 'Demonstração removida pelo setup.');
  await page.goto('/');

  await page.getByRole('textbox', { name: 'Título da nota' }).fill('Nota pelo navegador');
  await page.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByText('Nota pelo navegador')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Nota pelo navegador')).toBeVisible();

  await page.getByRole('button', { name: 'Remover nota: Nota pelo navegador' }).click();
  await expect(page.getByText('Nota pelo navegador')).toBeHidden();
  await expect(page.getByText(/Nenhuma nota ainda/)).toBeVisible();
});

test('preserva a rota de fallback', async ({ page }) => {
  await page.goto('/rota-que-nao-existe');
  await expect(page.getByRole('heading', { name: /pagina nao encontrada/i })).toBeVisible();
});

test('orienta o início e mantém a navegação do guia no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Seu projeto começa aqui' })).toBeVisible();
  await page.getByRole('link', { name: /Ver primeiros passos/ }).click();
  await page.getByText('Explore o que já vem pronto').click();
  if (hasNotesExample) {
    await page.getByRole('link', { name: 'Experimentar as notas' }).click();
    await expect(page.getByRole('textbox', { name: 'Título da nota' })).toBeInViewport();
  } else {
    await expect(page.getByRole('link', { name: 'Experimentar as notas' })).toHaveCount(0);
  }
  await page.getByText('Planeje sua primeira funcionalidade').click();
  await expect(page.getByText(/Quero criar \[descreva a ideia/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('link', { name: 'Abrir o styleguide' }).click();
  await expect(page).toHaveURL(/\/styleguide$/);
  await expect(page.getByRole('link', { name: 'Styleguide', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
