# ADR 0004: Estratégia de Roteamento

## Contexto

Projetos web frequentemente requerem navegação entre múltiplas páginas ou visões. Existem bibliotecas consagradas como React Router, TanStack Router, entre outras. No entanto, muitas aplicações simples ou em fase inicial podem não precisar de uma biblioteca complexa de roteamento logo de início.

## Decisão

Decidimos **não incluir** uma biblioteca de roteamento de terceiros (como `react-router`) por padrão no template.
Para preparar o terreno para uma futura adoção (caso se prove necessária), estruturaremos os componentes de página em placeholders no diretório `app/routes/`.

## Consequências

- **Positivas:** Mantemos as dependências enxutas e reduzimos a complexidade inicial. É fácil integrar qualquer solução de roteamento no futuro sem refatorar a estrutura fundamental, pois as visões já estarão isoladas em `app/routes/`.
- **Negativas:** Navegação inicial precisará ser feita via renderização condicional ou não haverá suporte a URLs profundas out-of-the-box. Quando for necessário, a equipe precisará adicionar e configurar a biblioteca escolhida.
