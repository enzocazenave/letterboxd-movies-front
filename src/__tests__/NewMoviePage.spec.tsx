import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import NewMoviePage from '../pages/NewMoviePage'
import apiClient from '../services/apiClient'

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

describe('NewMoviePage', () => {
  const mockGenres = [
    { id: 1, nombre: 'Action' },
    { id: 2, nombre: 'Drama' }
  ]

  const mockPlatforms = [
    { id: 1, nombre: 'Netflix', logoUrl: '/netflix.jpg' },
    { id: 2, nombre: 'Prime Video', logoUrl: '/prime.jpg' }
  ]

  const mockActors = [
    { id: 1, nombre: 'Actor One' },
    { id: 2, nombre: 'Actor Two' }
  ]

  const mockDirectors = [
    { id: 1, nombre: 'Director One' },
    { id: 2, nombre: 'Director Two' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
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

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <NewMoviePage />
      </MemoryRouter>
    )
  }

  it('renders the page title and description', () => {
    renderComponent()
    
    expect(screen.getByText('Nueva película')).toBeInTheDocument()
    expect(screen.getByText(/Completá todos los campos/)).toBeInTheDocument()
  })

  it('renders all form fields', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Título de la película/i)).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText(/Duración en minutos/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Fecha de estreno/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Sinopsis de película/i)).toBeInTheDocument()
  })

  it('displays image preview when file is selected', async () => {
    const user = userEvent.setup()
    renderComponent()

    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Imagen/i) as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/Seleccionada: test.png/)).toBeInTheDocument()
    })
  })

  it('clears image when clear button is clicked', async () => {
    const user = userEvent.setup()
    renderComponent()

    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Imagen/i) as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/Seleccionada: test.png/)).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /Quitar/i })
    await user.click(clearButton)

    expect(screen.queryByText(/Seleccionada: test.png/)).not.toBeInTheDocument()
  })

  it('handles text input changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Título de la película/i)).toBeInTheDocument()
    })

    const titleInput = screen.getByPlaceholderText(/Título de la película/i) as HTMLInputElement
    await user.type(titleInput, 'Test Movie')

    expect(titleInput.value).toBe('Test Movie')
  })

  it('handles duration input changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Duración en minutos/i)).toBeInTheDocument()
    })

    const durationInput = screen.getByPlaceholderText(/Duración en minutos/i) as HTMLInputElement
    await user.type(durationInput, '120')

    expect(durationInput.value).toBe('120')
  })

  it('submit button is disabled when form is incomplete', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    expect(submitButton).toBeDisabled()
  })

  it('displays cancel link', () => {
    renderComponent()
    
    const cancelLink = screen.getByRole('link', { name: /Cancelar/i })
    expect(cancelLink).toBeInTheDocument()
    expect(cancelLink).toHaveAttribute('href', '/movies')
  })

  it('shows "Nuevo director" button', () => {
    renderComponent()
    
    expect(screen.getByRole('button', { name: /Nuevo director/i })).toBeInTheDocument()
  })

  it('shows "Nuevo actor" button', () => {
    renderComponent()
    
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
})
