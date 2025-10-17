import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import MoviesPage from '../pages/MoviesPage'
import LoginPage from '../pages/LoginPage'
import LoadingPage from '../pages/LoadingPage'

// Mock de servicios
vi.mock('../services/movieService', () => ({
  getAllMovies: vi.fn().mockResolvedValue({
    success: true,
    data: {
      data: [
        {
          id: 1,
          titulo: 'Test Movie',
          sinopsis: 'Test',
          duracionMinutos: 120,
          fechaEstreno: '2024-01-01',
          poster: '/test.jpg',
          activa: true,
          director: { id: 1, nombre: 'Director' },
          generos: [],
          plataformas: [],
          elenco: []
        }
      ]
    }
  })
}))

// Mock del AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['create_movie', 'edit_movie', 'delete_movie'],
    user: { profile: { full_name: 'Test User' } },
    login: vi.fn(),
    logout: vi.fn(),
    status: 'authenticated'
  })
}))

describe('MoviesPage', () => {
  it('renders welcome message', async () => {
    render(
      <BrowserRouter>
        <MoviesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
    })
  })

  it('renders search input', () => {
    render(
      <BrowserRouter>
        <MoviesPage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText(/buscar película/i)).toBeInTheDocument()
  })

  it('renders create movie button for authorized users', () => {
    render(
      <BrowserRouter>
        <MoviesPage />
      </BrowserRouter>
    )

    // El botón contiene el texto "Película"
    const buttons = screen.getAllByRole('link')
    const createButton = buttons.find(button => button.textContent?.includes('Película'))
    expect(createButton).toBeDefined()
  })

  it('displays movies grid', async () => {
    render(
      <BrowserRouter>
        <MoviesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })
  })
})

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText(/contraseña/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })
})

describe('LoadingPage', () => {
  it('renders loading indicator', () => {
    const { container } = render(<LoadingPage />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays loading animation', () => {
    const { container } = render(<LoadingPage />)
    
    // Verifica que exista el SVG de loading
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('animate-spin')
  })
})
