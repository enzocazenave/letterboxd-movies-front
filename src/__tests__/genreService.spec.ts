import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllGenres, deleteGenre, createGenre, updateGenre } from '../services/genreService'
import apiClient from '../services/apiClient'

vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('genreService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllGenres', () => {
    it('returns genres on successful request', async () => {
      const mockGenres = [
        { id: 1, nombre: 'Action' },
        { id: 2, nombre: 'Drama' },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: { data: mockGenres },
      })

      const result = await getAllGenres()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGenres)
      expect(apiClient.get).toHaveBeenCalledWith('/generos')
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 500,
        statusText: 'Server Error',
      })

      const result = await getAllGenres()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Server Error')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      const result = await getAllGenres()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('deleteGenre', () => {
    it('returns success on successful deletion', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 200,
      })

      const result = await deleteGenre(1)

      expect(result.success).toBe(true)
      expect(apiClient.delete).toHaveBeenCalledWith('/generos/1')
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      })

      const result = await deleteGenre(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))

      const result = await deleteGenre(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('createGenre', () => {
    it('creates genre successfully with status 201', async () => {
      const mockGenre = { id: 1, nombre: 'Comedy' }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: { data: mockGenre },
      })

      const result = await createGenre({ nombre: 'Comedy' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGenre)
      expect(apiClient.post).toHaveBeenCalledWith('/generos', { nombre: 'Comedy' })
    })

    it('creates genre successfully with status 200', async () => {
      const mockGenre = { id: 1, nombre: 'Thriller' }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 200,
        data: mockGenre,
      })

      const result = await createGenre({ nombre: 'Thriller' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGenre)
    })

    it('returns error on non-201/200 status', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        status: 400,
        statusText: 'Bad Request',
      })

      const result = await createGenre({ nombre: 'Invalid' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bad Request')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({
        response: { data: 'Validation error' },
        message: 'Request failed',
      })

      const result = await createGenre({ nombre: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation error')
    })
  })

  describe('updateGenre', () => {
    it('updates genre successfully', async () => {
      const mockGenre = { id: 1, nombre: 'Updated Genre' }

      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: { data: mockGenre },
      })

      const result = await updateGenre(1, { nombre: 'Updated Genre' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGenre)
      expect(apiClient.put).toHaveBeenCalledWith('/generos/1', { nombre: 'Updated Genre' })
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      })

      const result = await updateGenre(999, { nombre: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.put).mockRejectedValue({
        response: { data: 'Update failed' },
        message: 'Request failed',
      })

      const result = await updateGenre(1, { nombre: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })
})
