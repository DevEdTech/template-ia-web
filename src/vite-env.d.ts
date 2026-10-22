/// <reference types="vite/client" />

/**
 * Variaveis de ambiente expostas ao front-end. Declare aqui cada variavel
 * `VITE_` usada pelo projeto para que o TypeScript acuse erros de digitacao
 * em vez de devolver `any`. A validacao em tempo de execucao fica em
 * `src/shared/config/env.ts`.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Emissor OIDC (ex.: https://login.exemplo.com). */
  readonly VITE_AUTH_ISSUER?: string;
  /** Identificador publico do cliente registrado no provedor. */
  readonly VITE_AUTH_CLIENT_ID?: string;
  /** Endereco de retorno registrado no provedor. */
  readonly VITE_AUTH_REDIRECT_URI?: string;
  /** Escopos separados por espaco. Padrao: "openid profile email". */
  readonly VITE_AUTH_SCOPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
