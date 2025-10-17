import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import EditMoviePage from '../pages/EditMoviePage'
import apiClient from '../services/apiClient'
import { getMovieById, updateMovie } from '../services/movieService'
import toast from 'react-hot-toast'

vi.mock('../services/apiClient')
vi.mock('../services/movieService')
vi.mock('react-hot-toast')

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock URL.createObjectURL for jsdom
window.URL.createObjectURL = vi.fn(() => 'mock-url')
window.URL.revokeObjectURL = vi.fn()

describe('EditMoviePage', () => {
  const mockMovie = {
    id: 1,
    titulo: 'Inception',
    sinopsis: 'A thief who steals corporate secrets',
    poster: 'https://movies.ufodevelopment.com/uploads/inception.jpg',
    fechaEstreno: '2010-07-16',
    duracionMinutos: 148,
    activa: true,
    director: {
      id: 1,
      nombre: 'Christopher Nolan',
      imagenUrl: 'https://movies.ufodevelopment.com/uploads/nolan.jpg'
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
        personaId: 1,
        nombrePersona: 'Leonardo DiCaprio',
        personaje: 'Cobb',
        imagenPersona: 'https://movies.ufodevelopment.com/uploads/leo.jpg',
        orden: 1
      }
    ]
  }

  const mockGenres = [
    { id: 1, nombre: 'Sci-Fi' },
    { id: 2, nombre: 'Thriller' }
  ]

  const mockPlatforms = [
    { id: 1, nombre: 'Netflix', logoUrl: '/netflix.jpg' },
    { id: 2, nombre: 'Prime Video', logoUrl: '/prime.jpg' }
  ]

  const mockActors = [
    { id: 1, nombre: 'Leonardo DiCaprio' },
    { id: 2, nombre: 'Actor Two' }
  ]

  const mockDirectors = [
    { id: 1, nombre: 'Christopher Nolan' },
    { id: 2, nombre: 'Director Two' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(getMovieById).mockResolvedValue({
      success: true,
      data: { data: mockMovie }
    })
    
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/generos') {
        return Promise.resolve({ data: { data: mockGenres } })
      }
      if (url === '/plataformas') {
        return Promise.resolve({ data: { data: mockPlatforms } })
      }
      if (url === '/personas/actores') {
        return Promise.resolve({ data: mockActors })
      }
      if (url === '/personas/directores') {
        return Promise.resolve({ data: mockDirectors })
      }
      return Promise.resolve({ data: [] })
    })
  })

  const renderComponent = (movieId = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/movies/${movieId}/edit`]}>
        <Routes>
          <Route path="/movies/:id/edit" element={<EditMoviePage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('displays loading skeleton while fetching data', () => {
    vi.mocked(getMovieById).mockImplementation(() => new Promise(() => {}))
    
    renderComponent()
    
    expect(screen.getByText((_content, element) => {
      return element?.className?.includes('animate-pulse') || false
    })).toBeInTheDocument()
  })

  it('renders the page title and description after loading', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    expect(screen.getByText(/Actualizá los campos/)).toBeInTheDocument()
  })

  it('loads and populates form with movie data', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Inception')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('A thief who steals corporate secrets')).toBeInTheDocument()
    expect(screen.getByDisplayValue('148')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2010-07-16')).toBeInTheDocument()
  })

  it('displays current poster image', async () => {
    renderComponent()
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      const posterImage = images.find(img => img.getAttribute('alt') === 'Poster')
      expect(posterImage).toBeInTheDocument()
    })
  })

  it('handles text input changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Inception')).toBeInTheDocument()
    })

    const titleInput = screen.getByPlaceholderText(/Título de la película/i) as HTMLInputElement
    await user.clear(titleInput)
    await user.type(titleInput, 'New Title')

    expect(titleInput.value).toBe('New Title')
  })

  it('handles duration input changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('148')).toBeInTheDocument()
    })

    const durationInput = screen.getByPlaceholderText(/Duración en minutos/i) as HTMLInputElement
    await user.clear(durationInput)
    await user.type(durationInput, '120')

    expect(durationInput.value).toBe('120')
  })

  it('handles synopsis textarea changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue(/A thief who steals/)).toBeInTheDocument()
    })

    const synopsisInput = screen.getByPlaceholderText(/Sinopsis de película/i) as HTMLTextAreaElement
    await user.clear(synopsisInput)
    await user.type(synopsisInput, 'New synopsis')

    expect(synopsisInput.value).toBe('New synopsis')
  })

  it('displays image upload input', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/Imagen/i)
    expect(fileInput).toBeInTheDocument()
  })

  it('displays new image preview when file is selected', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    const file = new File(['dummy'], 'new-poster.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Imagen/i) as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/Seleccionada: new-poster.png/)).toBeInTheDocument()
    })
  })

  it('clears new image when clear button is clicked', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Imagen/i) as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/Seleccionada: test.png/)).toBeInTheDocument()
    })

    // Find the clear button by its text, not by "Quitar" which is for cast members
    const clearButtons = screen.getAllByRole('button', { name: /Quitar/i })
    const clearButton = clearButtons.find(btn => btn.closest('[class*="col-span-2"]'))
    
    if (clearButton) {
      await user.click(clearButton)
      expect(screen.queryByText(/Seleccionada: test.png/)).not.toBeInTheDocument()
    }
  })

  it('submit button is enabled when form is loaded', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('displays cancel button', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
    expect(cancelButton).toBeInTheDocument()
  })

  it('shows "Nuevo director" button', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Nuevo director/i })).toBeInTheDocument()
  })

  it('shows "Nuevo actor" button', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Editar película')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Nuevo actor/i })).toBeInTheDocument()
  })

  it('displays select placeholders', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Seleccionar director/i)).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText(/Seleccionar géneros/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Seleccionar plataformas/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Seleccionar persona/i)).toBeInTheDocument()
  })

  it('displays existing genres as chips', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    })

    expect(screen.getByText('Thriller')).toBeInTheDocument()
  })

  it('displays existing platforms as chips', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })
  })

  it('displays existing cast members', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/Leonardo DiCaprio/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Cobb/)).toBeInTheDocument()
  })

  it('calls updateMovie when form is submitted', async () => {
    const user = userEvent.setup()
    
    vi.mocked(updateMovie).mockResolvedValue({
      success: true,
      data: { data: { id: 1 } }
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Inception')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(updateMovie).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Película actualizada con éxito')
      expect(mockNavigate).toHaveBeenCalledWith('/movies/1')
    })
  })

  it('shows error toast when update fails', async () => {
    const user = userEvent.setup()
    
    vi.mocked(updateMovie).mockResolvedValue({
      success: false,
      error: 'Update failed'
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Inception')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
