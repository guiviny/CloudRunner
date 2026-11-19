// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from './test/render'

describe('rotas', () => {
  it('endereço desconhecido mostra a página de 404', () => {
    renderRoute('/nao-existe')
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
  })

  it('o menu inicial leva à trilha e ao roadmap', () => {
    renderRoute('/')
    expect(screen.getAllByRole('link', { name: /Roadmap/ })[0]).toHaveAttribute('href', '/roadmap')
    expect(screen.getAllByRole('link', { name: /Trilha/ })[0]).toHaveAttribute('href', '/trilha')
  })
})
