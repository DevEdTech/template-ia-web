# ADR 0004: Estratégia de Roteamento

## Contexto

Projetos web frequentemente requerem navegação entre múltiplas páginas ou visões. Havia uma decisão inicial de manter o template agnóstico e sem roteador padrão para simplificar. No entanto, constatamos que a maioria dos projetos reais precisa rapidamente de um roteador, e a configuração manual atrasa o setup inicial, além de fragmentar padrões de injeção e data loading (loaders/actions).

## Decisão

Decidimos **incluir** a biblioteca `react-router-dom` (v7) por padrão no template.
A configuração será feita utilizando as APIs modernas de Data Router (`createBrowserRouter`) no diretório `app/routes/`, e o layout raiz injetará os componentes através do `<Outlet />`.

## Consequências

- **Positivas:** Temos navegação, deep-linking, e padrões de data loading resolvidos _out-of-the-box_. A estrutura já suporta crescimento orgânico para múltiplas features e páginas. O helper de testes já inclui o roteador.
- **Negativas:** Adicionamos uma dependência pesada de roteamento no bundle base da aplicação, mesmo que o projeto inicial seja de página única. Aumentamos ligeiramente a curva de aprendizado para testar componentes isolados (necessidade do `MemoryRouter`).
