import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import MoviePage from '../pages/MoviePage'
import * as movieService from '../services/movieService'
import { AuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

vi.mock('../services/movieService')
vi.mock('react-hot-toast')

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockMovie = {
  id: 1,
  titulo: 'Inception',
  sinopsis: 'A thief who steals corporate secrets through dream-sharing technology.',
  poster: '/uploads/inception.jpg',
  fechaEstreno: '2010-07-16',
  duracionMinutos: 148,
  activa: true,
  director: {
    id: 1,
    nombre: 'Christopher Nolan',
    imagenUrl: '/nolan.jpg'
  },
  generos: [
    { id: 1, nombre: 'Sci-Fi' },
    { id: 2, nombre: 'Thriller' }
  ],
  plataformas: [
    { id: 1, nombre: 'Netflix', logoUrl: '/netflix.jpg' }
  ],
  elenco: [
    {
      nombrePersona: 'Leonardo DiCaprio',
      personaje: 'Cobb',
      imagenPersona: '/uploads/leo.jpg'
    }
  ]
}

describe('MoviePage', () => {
  const renderWithRouter = (movieId: string = '1', permissions: string[] = []) => {
    return render(
      <AuthContext.Provider value={{
        user: {
          access_token: 'test-token',
          profile: {
            email: 'test@test.com',
            expiresAt: '2099-12-31',
            full_name: 'Test User',
            permissions,
            role: 'admin',
            user_id: 1
          }
        },
        status: 'authenticated' as const,
        login: vi.fn(),
        logout: vi.fn(),
        permissions
      }}>
        <MemoryRouter initialEntries={[`/movies/${movieId}`]}>
          <Routes>
            <Route path="/movies/:id" element={<MoviePage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carga y muestra los datos de la película', async () => {
    vi.mocked(movieService.getMovieById).mockResolvedValue({
      success: true,
      data: { data: mockMovie }
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    expect(screen.getByText(/A thief who steals corporate secrets/)).toBeInTheDocument()
    expect(screen.getByText(/2010/)).toBeInTheDocument()
    expect(screen.getByText(/148 min/)).toBeInTheDocument()
    expect(screen.getByText(/Christopher Nolan/)).toBeInTheDocument()
  })

  it('muestra los géneros de la película', async () => {
    vi.mocked(movieService.getMovieById).mockResolvedValue({
      success: true,
      data: { data: mockMovie }
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Géneros')).toBeInTheDocument()
    })

    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    expect(screen.getByText('Thriller')).toBeInTheDocument()
  })

  it('muestra las plataformas donde ver', async () => {
    vi.mocked(movieService.getMovieById).mockResolvedValue({
      success: true,
      data: { data: mockMovie }
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Dónde ver')).toBeInTheDocument()
    })

    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('muestra el elenco de la película', async () => {
    vi.mocked(movieService.getMovieById).mockResolvedValue({
      success: true,
      data: { data: mockMovie }
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Elenco')).toBeInTheDocument()
    })

    expect(screen.getByText('Leonardo DiCaprio')).toBeInTheDocument()
    expect(screen.getByText('Cobb')).toBeInTheDocument()
  })

  it('navega a /movies si la película no existe', async () => {
    vi.mocked(movieService.getMovieById).mockRejectedValue(new Error('Not found'))
    vi.mocked(toast.error).mockReturnValue('')

    renderWithRouter()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('La película no existe.')
      expect(mockNavigate).toHaveBeenCalledWith('/movies')
    })
  })
})
