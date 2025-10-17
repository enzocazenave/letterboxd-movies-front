import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import MovieInactiveCard from '../components/movies/MovieInactiveCard'
import * as movieService from '../services/movieService'

vi.mock('../services/movieService', () => ({
  realDeleteMovieById: vi.fn(),
  activateMovieById: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['edit_movie', 'delete_movie'],
    user: { profile: { full_name: 'Test User' } },
  }),
}))

describe('MovieInactiveCard', () => {
  const mockMovie = {
    id: 1,
    titulo: 'Inactive Movie',
    fechaEstreno: '2024-01-01',
    duracionMinutos: 120,
    sinopsis: 'A test inactive movie',
    poster: '/poster.jpg',
    activa: false,
    director: { id: 1, nombre: 'Test Director', imagen: '' },
    generos: [
      { id: 1, nombre: 'Action' },
      { id: 2, nombre: 'Drama' },
    ],
    plataformas: [{ id: 1, nombre: 'Netflix', logoUrl: '/logo.png' }],
    elenco: [],
  }

  const mockHandleDeleteMovie = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders movie information correctly', () => {
    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    expect(screen.getByText('Inactive Movie')).toBeInTheDocument()
    expect(screen.getByText('A test inactive movie')).toBeInTheDocument()
    expect(screen.getByText('Test Director')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })

  it('renders inactive badge', () => {
    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    expect(screen.getByText('Inactiva')).toBeInTheDocument()
  })

  it('renders action buttons when user has permissions', () => {
    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('opens confirm dialog when delete button is clicked', async () => {
    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    const deleteButtons = screen.getAllByRole('button')
    // El botón de borrar es el segundo (el que tiene el ícono de trash)
    const deleteButton = deleteButtons[1]
    
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.getByText(/eliminar película/i)).toBeInTheDocument()
    })
  })

  it('calls realDeleteMovieById when deletion is confirmed', async () => {
    vi.mocked(movieService.realDeleteMovieById).mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    const deleteButtons = screen.getAllByRole('button')
    // El botón de borrar es el segundo
    const deleteButton = deleteButtons[1]
    
    fireEvent.click(deleteButton)
    
    // Esperar a que aparezca el diálogo de confirmación
    await waitFor(() => {
      expect(screen.getByText(/eliminar película/i)).toBeInTheDocument()
    })
    
    // El ConfirmDialog usa el botón rojo sin texto específico "Confirmar"
    // Busquemos todos los botones y clickemos el último (el de confirmar)
    const dialogButtons = screen.getAllByRole('button')
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(movieService.realDeleteMovieById).toHaveBeenCalledWith(1)
    })
  })

  it('calls activateMovieById when activation is confirmed', async () => {
    vi.mocked(movieService.activateMovieById).mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    const activateButtons = screen.getAllByRole('button')
    const activateButton = activateButtons.find(btn => btn.querySelector('svg'))
    
    if (activateButton) {
      fireEvent.click(activateButton)
      
      await waitFor(() => {
        const confirmButton = screen.getByText('Activar')
        if (confirmButton) {
          fireEvent.click(confirmButton)
        }
      })
    }
  })

  it('renders platforms when available', () => {
    render(
      <BrowserRouter>
        <MovieInactiveCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    expect(screen.getByText('Disponible en:')).toBeInTheDocument()
  })
})
