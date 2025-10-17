import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import GenresPage from '../pages/GenresPage'
import * as genreService from '../services/genreService'

vi.mock('../services/genreService', () => ({
  getAllGenres: vi.fn(),
  deleteGenre: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['manage_attributes'],
    user: { profile: { full_name: 'Test User' } },
  }),
}))

vi.mock('../components/attributes/GenreModal', () => ({
  default: () => <div>Genre Modal</div>,
}))

describe('GenresPage', () => {
  const mockGenres = [
    { id: 1, nombre: 'Action' },
    { id: 2, nombre: 'Drama' },
    { id: 3, nombre: 'Comedy' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', async () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Géneros')).toBeInTheDocument()
  })

  it('renders search input', () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText('Buscar géneros')).toBeInTheDocument()
  })

  it('renders create button', () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Nuevo género')).toBeInTheDocument()
  })

  it('fetches and displays genres', async () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: mockGenres,
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Drama')).toBeInTheDocument()
      expect(screen.getByText('Comedy')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(genreService.getAllGenres).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Géneros')).toBeInTheDocument()
  })

  it('shows empty state when no genres', async () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay géneros disponibles')).toBeInTheDocument()
    })
  })

  it('filters genres by search term', async () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: mockGenres,
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar géneros')
    fireEvent.change(searchInput, { target: { value: 'Action' } })

    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.queryByText('Drama')).not.toBeInTheDocument()
    })
  })

  it('refetches genres when search is cleared', async () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: mockGenres,
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar géneros')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(genreService.getAllGenres).toHaveBeenCalledTimes(2)
    })
  })

  it('opens create modal when button is clicked', async () => {
    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    const createButton = screen.getByText('Nuevo género')
    fireEvent.click(createButton)

    await waitFor(() => {
      const modals = screen.getAllByText('Genre Modal')
      expect(modals.length).toBeGreaterThan(0)
    })
  })

  it('handles error when fetching genres', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(genreService.getAllGenres).mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    })

    render(
      <BrowserRouter>
        <GenresPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })
})
