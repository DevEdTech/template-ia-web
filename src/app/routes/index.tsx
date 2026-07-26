import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/app/App';
import { HomePage } from '@/features/home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
