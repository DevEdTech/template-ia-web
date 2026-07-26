# Testes

## Filosofia

Testamos o **comportamento observável** da aplicação: o que o usuário vê e faz. Não testamos detalhes internos de implementação. Um bom teste continua passando mesmo que você reorganize o código por dentro, desde que o comportamento continue o mesmo.

## Tipos de teste

- **Unidade**: funções e lógica isoladas (ex.: cálculo, formatação).
- **Componente**: renderização e interação de componentes, com Vitest + React Testing Library.
- **Contrato local**: setup transacional, regras arquiteturais, links da documentação e artefato de build.

## Localização

Os testes ficam dentro da feature, na pasta `tests/`:

```
features/minha-feature/
├── components/
├── model/
├── services/
└── tests/        # os testes desta feature
```

## Comandos

```bash
npm run test         # roda os testes uma vez
npm run test:unit    # roda apenas Vitest
npm run test:setup   # testa setup e regras arquiteturais em projetos temporários
npm run test:watch   # roda em modo contínuo enquanto você edita
```

## Exemplo curto

```tsx
import { render, screen } from '../../../test/render';
import { Saudacao } from '../components/Saudacao';

test('mostra o nome informado', () => {
  render(<Saudacao nome="Ana" />);
  expect(screen.getByText('Olá, Ana')).toBeInTheDocument();
});
```

O foco é no que aparece na tela, não em como o componente foi escrito por dentro.

O setup também é comportamento público do template. Seus testes executam dry-run, personalização, repetição idempotente e rollback em pastas temporárias. A persistência testa migração, backup de dados inválidos, conflitos de revisão e sincronização entre abas. O smoke test serve `dist/` em uma porta efêmera e acessa o HTML e seus assets como um navegador faria.

## O que NÃO testar

- Estado interno ou nomes de variáveis do componente.
- Detalhes de implementação de bibliotecas de terceiros.
- Estilos puramente visuais sem impacto no comportamento.
- Casos impossíveis só para "aumentar cobertura".

## Investigar falhas

1. Leia a mensagem de erro: ela costuma indicar o que era esperado e o que aconteceu.
2. Rode em modo contínuo (`npm run test:watch`) e ajuste até passar.
3. Se um teste falha após uma mudança de comportamento intencional, atualize o teste para o novo comportamento esperado.
4. Se a falha for inesperada, corrija o código, não o teste.
