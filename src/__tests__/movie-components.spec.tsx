import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import MovieCard from '../components/movies/MovieCard'
import { MovieCardSkeleton } from '../components/movies/MovieCardSkeleton'
import MoviesGrid from '../components/movies/MoviesGrid'
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
    nombre: 'Test Director'
  },
  generos: [
    { id: 1, nombre: 'Action' },
    { id: 2, nombre: 'Drama' }
  ],
  plataformas: [
    { id: 1, nombre: 'Netflix', logoUrl: '/netflix.png' }
  ],
  elenco: []
}

describe('MovieCard Component', () => {
  it('renders movie information correctly', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} handleDeleteMovie={() => {}} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('Test Director')).toBeInTheDocument()
  })

  it('displays active badge when movie is active', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} handleDeleteMovie={() => {}} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/activa/i)).toBeInTheDocument()
  })

  it('displays inactive badge when movie is inactive', () => {
    const inactiveMovie = { ...mockMovie, activa: false }
    
    render(
      <BrowserRouter>
        <MovieCard movie={inactiveMovie} handleDeleteMovie={() => {}} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/inactiva/i)).toBeInTheDocument()
  })

  it('renders genres', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} handleDeleteMovie={() => {}} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })
})

describe('MovieCardSkeleton Component', () => {
  it('renders skeleton loading state', () => {
    const { container } = render(<MovieCardSkeleton />)
    
    // Verifica que se renderice el componente
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders multiple skeletons', () => {
    const { container } = render(
      <>
        <MovieCardSkeleton />
        <MovieCardSkeleton />
        <MovieCardSkeleton />
      </>
    )
    
    expect(container.children).toHaveLength(3)
  })
})

describe('MoviesGrid Component', () => {
  it('renders loading skeletons when isLoading=true', () => {
    const { container } = render(
      <BrowserRouter>
        <MoviesGrid
          isLoading={true}
          movies={[]}
          handleDeleteMovie={() => {}}
        />
      </BrowserRouter>
    )
    
    // Verifica que se muestren skeletons (articles con animación)
    const articles = container.querySelectorAll('article')
    expect(articles.length).toBeGreaterThan(0)
  })

  it('renders movies when loaded', () => {
    render(
      <BrowserRouter>
        <MoviesGrid
          isLoading={false}
          movies={[mockMovie]}
          handleDeleteMovie={() => {}}
        />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('renders empty state when no movies', () => {
    const { container } = render(
      <BrowserRouter>
        <MoviesGrid
          isLoading={false}
          movies={[]}
          handleDeleteMovie={() => {}}
        />
      </BrowserRouter>
    )
    
    // Verifica que el grid esté vacío
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid?.children.length).toBe(0)
  })

  it('renders multiple movies', () => {
    const movies = [
      mockMovie,
      { ...mockMovie, id: 2, titulo: 'Movie 2' },
      { ...mockMovie, id: 3, titulo: 'Movie 3' }
    ]
    
    render(
      <BrowserRouter>
        <MoviesGrid
          isLoading={false}
          movies={movies}
          handleDeleteMovie={() => {}}
        />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('Movie 2')).toBeInTheDocument()
    expect(screen.getByText('Movie 3')).toBeInTheDocument()
  })
})
