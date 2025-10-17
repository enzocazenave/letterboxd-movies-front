import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getAllInactiveMovies, 
  realDeleteMovieById, 
  createMovie, 
  activateMovieById 
} from '../services/movieService'
import apiClient from '../services/apiClient'

vi.mock('../services/apiClient')

describe('movieService - Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllInactiveMovies', () => {
    it('returns inactive movies on success', async () => {
      const mockMovies = [
        { id: 1, titulo: 'Movie 1', activo: false },
        { id: 2, titulo: 'Movie 2', activo: false }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: mockMovies,
        statusText: 'OK',
        headers: {},
        config: {} as any
      })

      const result = await getAllInactiveMovies()

      expect(apiClient.get).toHaveBeenCalledWith('/peliculas/inactivas')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMovies)
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 500,
        data: null,
        statusText: 'Server Error',
        headers: {},
        config: {} as any
      })

      const result = await getAllInactiveMovies()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Server Error')
    })

    it('handles network errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      const result = await getAllInactiveMovies()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('realDeleteMovieById', () => {
    it('permanently deletes movie on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 200,
        data: {},
        statusText: 'OK',
        headers: {},
        config: {} as any
      })

      const result = await realDeleteMovieById(1)

      expect(apiClient.delete).toHaveBeenCalledWith('/peliculas/1/eliminarCompleto')
      expect(result.success).toBe(true)
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 404,
        data: null,
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      })

      const result = await realDeleteMovieById(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('handles deletion errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))

      const result = await realDeleteMovieById(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('createMovie', () => {
    it('creates movie with image', async () => {
      const movieData = {
        titulo: 'New Movie',
        sinopsis: 'Great movie',
        duracionMinutos: 120,
        fechaEstreno: '2024-01-01',
        directorId: 1,
        generosIds: [1, 2],
        plataformasIds: [1],
        elenco: [{ personaId: 1, personaje: 'Hero', orden: 1 }]
      }

      const imageFile = new File(['image'], 'poster.jpg', { type: 'image/jpeg' })

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: { id: 1, ...movieData },
        statusText: 'Created',
        headers: {},
        config: {} as any
      })

      const result = await createMovie(movieData, imageFile)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/peliculas',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      expect(result.success).toBe(true)
    })

    it('creates movie without image', async () => {
      const movieData = {
        titulo: 'New Movie',
        sinopsis: 'Great movie',
        duracionMinutos: 120,
        fechaEstreno: '2024-01-01',
        directorId: 1,
        generosIds: [1],
        plataformasIds: [1],
        elenco: []
      }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: { id: 1, ...movieData },
        statusText: 'Created',
        headers: {},
        config: {} as any
      })

      const result = await createMovie(movieData, null)

      expect(result.success).toBe(true)
    })

    it('returns error on non-201 status', async () => {
      const movieData = {
        titulo: 'New Movie',
        sinopsis: 'Great movie',
        duracionMinutos: 120,
        fechaEstreno: '2024-01-01',
        directorId: 1,
        generosIds: [1],
        plataformasIds: [1],
        elenco: []
      }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 400,
        data: null,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      })

      const result = await createMovie(movieData, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bad Request')
    })

    it('handles creation errors', async () => {
      const movieData = {
        titulo: 'New Movie',
        sinopsis: 'Great movie',
        duracionMinutos: 120,
        fechaEstreno: '2024-01-01',
        directorId: 1,
        generosIds: [1],
        plataformasIds: [1],
        elenco: []
      }

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Creation failed'))

      const result = await createMovie(movieData, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Creation failed')
    })
  })

  describe('activateMovieById', () => {
    it('activates movie on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: {},
        statusText: 'OK',
        headers: {},
        config: {} as any
      })

      const result = await activateMovieById(1)

      expect(apiClient.put).toHaveBeenCalledWith('/peliculas/1/activar')
      expect(result.success).toBe(true)
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        status: 404,
        data: null,
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      })

      const result = await activateMovieById(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('handles activation errors', async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Activation failed'))

      const result = await activateMovieById(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Activation failed')
    })
  })
})
