import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../routes'

// Renderiza o app inteiro (mesmas rotas do main.tsx) a partir de uma URL.
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  return { router, user, ...render(<RouterProvider router={router} />) }
}
