# ADR 0015 — Autenticação por Authorization Code com PKCE

- Status: aceita
- Data: 2026-10-22

## Contexto

A versão 1 do template declarava autenticação como fora de escopo, com a
justificativa de que segredo exige backend. A conclusão estava certa para o
segredo e errada para a autenticação: o caso comum não é manter base própria de
usuários, é **autenticar contra um provedor de identidade que já existe**
(Entra ID, Auth0, Keycloak, Google) e chamar uma API que também já existe.

Sem orientação no template, cada projeto improvisava — e a improvisação em
autenticação costuma terminar em token no `localStorage` e segredo no bundle.

## Decisão

O template traz a feature `src/features/auth` com:

1. **Authorization Code + PKCE (S256)**, o fluxo para cliente público. Não há
   `client_secret`: o `code_verifier` é gerado por login, guardado em
   `sessionStorage` e enviado somente na troca.
2. **Token de acesso apenas em memória.** Nunca em `localStorage` nem em
   `sessionStorage`: qualquer script injetado na página lê esse armazenamento.
   Uma recarga volta ao estado anônimo e refaz o fluxo, silencioso enquanto a
   sessão no provedor valer.
3. **Renovação com margem** (`REFRESH_MARGIN_MS`), antes de expirar, e
   compartilhada: chamadas simultâneas aguardam uma única renovação.
4. **`state` obrigatório e conferido** na volta; divergência é recusa.
5. **Fronteira respeitada**: HTTP em `services/authClient.ts`, armazenamento em
   `services/handshakeStore.ts`, regra pura em `model/session.ts`. Os
   componentes chamam a fronteira; `npm run check:architecture` garante.
6. **Configuração tudo ou nada**: `VITE_AUTH_ISSUER`, `VITE_AUTH_CLIENT_ID` e
   `VITE_AUTH_REDIRECT_URI` juntas, ou nenhuma. Metade dos valores produziria
   um fluxo que falha com o usuário já no provedor.
7. **Capacidade desligável**: `capabilities.auth` em `.template-state.json`.
   `npm run setup -- --no-auth` remove a feature, a rota e a documentação.

## Consequências

- Um projeto autentica usuários sem backend próprio e sem segredo no bundle.
- O que continua fora de escopo é explícito: **base própria de usuários com
  armazenamento de senha**, que exige servidor, e o template não inclui
  servidor.
- Chamadas autenticadas a API usam `authorizationHeader(session)` dentro dos
  serviços da feature que consome a API, nunca nos componentes.
- `refresh_token` no browser é aceito por simplicidade. Quando o provedor
  oferecer cookie `httpOnly` com rotação, prefira: ajuste
  `services/authClient.ts` e registre em um novo ADR.
