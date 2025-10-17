import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import MovieCard from '../components/movies/MovieCard'
import type { Movie } from '../types/Movie'

// Mock del AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['create_movie', 'edit_movie', 'delete_movie'],
    user: { profile: { full_name: 'Test User' } }
  })
}))

const mockMovie: Movie = {
  id: 1,
  titulo: 'Test Movie',
  sinopsis: 'Test synopsis',
  duracionMinutos: 120,
  fechaEstreno: '2024-01-01',
  poster: '/test-poster.jpg',
  activa: true,
  director: {
    id: 1,
    nombre: 'Test Director',
    imagen: '/director.jpg'
  },
  generos: [
    { id: 1, nombre: 'Action' },
    { id: 2, nombre: 'Drama' }
  ],
  plataformas: [
    { id: 1, nombre: 'Netflix', logoUrl: '/netflix.png' }
  ],
  elenco: [
    { 
      id: 1,
      personaId: 1,
      nombre: 'Actor One',
      nombrePersona: 'Actor One',
      personaje: 'Hero',
      imagenUrl: '/actor1.jpg',
      imagenPersona: '/actor1.jpg'
    }
  ]
}

describe('MovieCard - Behavior Tests', () => {
  const mockHandleDeleteMovie = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit link with correct path', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    const editLink = screen.getByRole('link')
    expect(editLink).toHaveAttribute('href', '/movies/1/edit')
  })

  it('displays movie duration correctly', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    // Verifica que se muestre "120 min"
    expect(screen.getByText(/120 min/)).toBeInTheDocument()
  })

  it('displays formatted release date', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} handleDeleteMovie={mockHandleDeleteMovie} />
      </BrowserRouter>
    )

    // La fecha debería estar formateada, verificamos "2023"
    expect(screen.getByText(/2023/)).toBeInTheDocument()
  })
})
