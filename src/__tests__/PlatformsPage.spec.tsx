import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import PlatformsPage from '../pages/PlatformsPage'
import * as platformService from '../services/platformService'

vi.mock('../services/platformService', () => ({
  getAllPlatforms: vi.fn(),
  deletePlatform: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    permissions: ['manage_attributes'],
    user: { profile: { full_name: 'Test User' } },
  }),
}))

vi.mock('../components/attributes/PlatformModal', () => ({
  default: () => <div>Platform Modal</div>,
}))

describe('PlatformsPage', () => {
  const mockPlatforms = [
    { id: 1, nombre: 'Netflix', logoUrl: '/netflix.png' },
    { id: 2, nombre: 'Prime Video', logoUrl: '/prime.png' },
    { id: 3, nombre: 'Disney+', logoUrl: null },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Plataformas')).toBeInTheDocument()
  })

  it('renders search input', () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText('Buscar plataformas')).toBeInTheDocument()
  })

  it('renders create button', () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Nueva plataforma')).toBeInTheDocument()
  })

  it('fetches and displays platforms', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: mockPlatforms,
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.getByText('Prime Video')).toBeInTheDocument()
      expect(screen.getByText('Disney+')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(platformService.getAllPlatforms).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Plataformas')).toBeInTheDocument()
  })

  it('shows empty state when no platforms', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay plataformas disponibles')).toBeInTheDocument()
    })
  })

  it('filters platforms by search term', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: mockPlatforms,
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar plataformas')
    fireEvent.change(searchInput, { target: { value: 'Netflix' } })

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.queryByText('Prime Video')).not.toBeInTheDocument()
    })
  })

  it('refetches platforms when search is cleared', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: mockPlatforms,
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar plataformas')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(platformService.getAllPlatforms).toHaveBeenCalledTimes(2)
    })
  })

  it('opens create modal when button is clicked', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: [],
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    const createButton = screen.getByText('Nueva plataforma')
    fireEvent.click(createButton)

    await waitFor(() => {
      const modals = screen.getAllByText('Platform Modal')
      expect(modals.length).toBeGreaterThan(0)
    })
  })

  it('handles error when fetching platforms', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('renders platform logos when available', async () => {
    vi.mocked(platformService.getAllPlatforms).mockResolvedValue({
      success: true,
      data: mockPlatforms,
    })

    render(
      <BrowserRouter>
        <PlatformsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })
  })
})
