import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovieById, activateMovieById } from '../services/movieService'
import apiClient from '../services/apiClient'

// Mock de apiClient
vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  BASE_URL: 'https://movies.ufodevelopment.com'
}))

describe('MovieService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllMovies', () => {
    it('returns movies on successful request', async () => {
      const mockMovies = {
        data: [
          { id: 1, titulo: 'Movie 1' },
          { id: 2, titulo: 'Movie 2' }
        ]
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: mockMovies
      })

      const result = await getAllMovies()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMovies)
      expect(apiClient.get).toHaveBeenCalledWith('/peliculas')
    })

    it('returns error on failed request', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      const result = await getAllMovies()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getMovieById', () => {
    it('returns movie on successful request', async () => {
      const mockMovie = { id: 1, titulo: 'Test Movie' }

      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: mockMovie
      })

      const result = await getMovieById(1)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMovie)
      expect(apiClient.get).toHaveBeenCalledWith('/peliculas/1')
    })

    it('returns error when movie not found', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Movie not found'))

      const result = await getMovieById(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Movie not found')
    })
  })

  describe('createMovie', () => {
    it('creates movie successfully', async () => {
      const movieData = {
        titulo: 'New Movie',
        sinopsis: 'Test synopsis',
        duracionMinutos: 120,
        fechaEstreno: '2024-01-01',
        directorId: 1,
        generosIds: [1, 2],
        plataformasIds: [1],
        elenco: []
      }

      const mockResponse = { id: 1, ...movieData }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: mockResponse
      })

      const result = await createMovie(movieData, null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalled()
    })

    it('returns error on failed creation', async () => {
      const movieData = {
        titulo: 'New Movie',
        sinopsis: 'Test',
        duracionMinutos: 120,
        fechaEstreno: '2024-01-01',
        directorId: 1,
        generosIds: [],
        plataformasIds: [],
        elenco: []
      }

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Creation failed'))

      const result = await createMovie(movieData, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Creation failed')
    })
  })

  describe('updateMovie', () => {
    it('updates movie successfully', async () => {
      const movieData = {
        titulo: 'Updated Movie',
        sinopsis: 'Updated synopsis',
        duracionMinutos: 150,
        fechaEstreno: '2024-02-01',
        directorId: 1,
        generosIds: [1],
        plataformasIds: [1],
        elenco: []
      }

      const mockResponse = { id: 1, ...movieData }

      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const result = await updateMovie(1, movieData, null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(apiClient.put).toHaveBeenCalledWith(
        '/peliculas/1',
        expect.any(FormData),
        expect.any(Object)
      )
    })
  })

  describe('deleteMovieById', () => {
    it('deletes movie successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 200,
        data: { message: 'Movie deleted' }
      })

      const result = await deleteMovieById(1)

      expect(result.success).toBe(true)
      expect(apiClient.delete).toHaveBeenCalledWith('/peliculas/1/eliminar')
    })

    it('returns error on failed deletion', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Deletion failed'))

      const result = await deleteMovieById(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Deletion failed')
    })
  })

  describe('activateMovieById', () => {
    it('activates movie successfully', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: { message: 'Movie activated' }
      })

      const result = await activateMovieById(1)

      expect(result.success).toBe(true)
      expect(apiClient.put).toHaveBeenCalledWith('/peliculas/1/activar')
    })

    it('returns error on failed activation', async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Activation failed'))

      const result = await activateMovieById(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Activation failed')
    })
  })
})
