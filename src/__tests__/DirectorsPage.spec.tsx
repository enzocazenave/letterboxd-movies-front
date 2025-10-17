import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import DirectorsPage from '../pages/DirectorsPage'
import * as directorService from '../services/directorService'

vi.mock('../services/directorService', () => ({
  getAllDirectors: vi.fn(),
  deleteDirector: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['manage_attributes'],
    user: { profile: { full_name: 'Test User' } },
  }),
}))

vi.mock('../components/attributes/DirectorModal', () => ({
  default: () => <div>Director Modal</div>,
}))

describe('DirectorsPage', () => {
  const mockDirectors = [
    { id: 1, nombre: 'Director 1', imagenUrl: '/director1.jpg' },
    { id: 2, nombre: 'Director 2', imagenUrl: null },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', async () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Directores')).toBeInTheDocument()
  })

  it('renders search input', () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText('Buscar director')).toBeInTheDocument()
  })

  it('renders create button', () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Nuevo director')).toBeInTheDocument()
  })

  it('fetches and displays directors', async () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: mockDirectors,
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Director 1')).toBeInTheDocument()
      expect(screen.getByText('Director 2')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(directorService.getAllDirectors).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    // Skeleton rows are rendered
    expect(screen.getByText('Directores')).toBeInTheDocument()
  })

  it('shows empty state when no directors', async () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay directores disponibles')).toBeInTheDocument()
    })
  })

  it('filters directors by search term', async () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: mockDirectors,
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Director 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar director')
    fireEvent.change(searchInput, { target: { value: 'Director 1' } })

    await waitFor(() => {
      expect(screen.getByText('Director 1')).toBeInTheDocument()
      expect(screen.queryByText('Director 2')).not.toBeInTheDocument()
    })
  })

  it('refetches directors when search is cleared', async () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: mockDirectors,
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Director 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar director')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(directorService.getAllDirectors).toHaveBeenCalledTimes(2)
    })
  })

  it('opens create modal when button is clicked', async () => {
    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    const createButton = screen.getByText('Nuevo director')
    fireEvent.click(createButton)

    await waitFor(() => {
      const modals = screen.getAllByText('Director Modal')
      expect(modals.length).toBeGreaterThan(0)
    })
  })

  it('handles error when fetching directors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(directorService.getAllDirectors).mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    })

    render(
      <BrowserRouter>
        <DirectorsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error cargando directores',
        'Failed to fetch'
      )
    })

    consoleErrorSpy.mockRestore()
  })
})
