import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import AttributesPage from '../pages/AttributesPage'

describe('AttributesPage', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AttributesPage />
      </MemoryRouter>
    )
  }

  it('renders page title', () => {
    renderComponent()
    expect(screen.getByText('Atributos')).toBeInTheDocument()
  })

  it('renders page description', () => {
    renderComponent()
    expect(screen.getByText(/En esta sección podrás crear, modificar y eliminar atributos/i)).toBeInTheDocument()
  })

  it('renders Plataformas navigation link', () => {
    renderComponent()
    const link = screen.getByRole('link', { name: /Plataformas/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/platforms')
  })

  it('renders Géneros navigation link', () => {
    renderComponent()
    const link = screen.getByRole('link', { name: /Géneros/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/genres')
  })

  it('renders Directores navigation link', () => {
    renderComponent()
    const link = screen.getByRole('link', { name: /Directores/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/directors')
  })

  it('renders all three navigation links', () => {
    renderComponent()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
  })
})
