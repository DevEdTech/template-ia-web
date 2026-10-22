import { createBrowserRouter, type RouteObject } from 'react-router';
import { StyleguidePage } from '@vitru/styleguide/showcase';
import { App } from '@/app/App';
import { AuthCallbackRoute, AuthGate } from '@/app/components/AuthGate';
import { NotFound, RouteErrorFallback } from '@/app/components/RouteErrorFallback';
import { HomePage } from '@/features/home';
import { NoteList } from '@/features/notes';
import { env } from '@/shared/config/env';

/**
 * Definicao das rotas, separada do router para permitir montar a mesma
 * arvore com um router de memoria nos testes.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    // O provedor de autenticacao envolve o layout: as telas protegidas e o
    // retorno do provedor precisam do mesmo estado de sessao.
    element: (
      <AuthGate>
        <App />
      </AuthGate>
    ),
    // Captura erros do layout e de qualquer rota filha sem errorElement proprio.
    errorElement: <RouteErrorFallback />,
    children: [
      {
        index: true,
        element: <HomePage example={<NoteList />} />,
      },
      {
        // Referência viva fornecida pelo pacote compartilhado.
        path: 'styleguide',
        element: <StyleguidePage />,
      },
      {
        // Retorno do provedor de identidade (`redirect_uri`).
        path: 'auth/callback',
        element: <AuthCallbackRoute />,
      },
      {
        // Qualquer endereco desconhecido cai aqui, dentro do layout.
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes, { basename: env.baseUrl });
