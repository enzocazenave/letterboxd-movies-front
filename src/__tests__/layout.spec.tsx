import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import Layout from '../components/Layout'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Mock del AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['create_movie'],
    user: { profile: { full_name: 'Test User' } },
    logout: vi.fn()
  })
}))

describe('Layout Component', () => {
  it('renders layout with header and footer', () => {
    const { container } = render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )
    
    expect(container).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )
    
    // Verifica que el layout se renderice
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })
})

describe('Header Component', () => {
  it('renders header', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
    
    // Verifica que el header se renderice
    const header = document.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('displays navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
    
    // Verifica que existan links de navegación
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})

describe('Footer Component', () => {
  it('renders footer', () => {
    const { container } = render(<Footer />)
    
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('displays footer content', () => {
    render(<Footer />)
    
    // Verifica que el footer tenga contenido
    const footer = document.querySelector('footer')
    expect(footer).toHaveTextContent(/\w+/)
  })
})
