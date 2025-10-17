import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllDirectors, deleteDirector, createDirector, updateDirector } from '../services/directorService'
import apiClient from '../services/apiClient'

vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('directorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllDirectors', () => {
    it('returns directors on successful request', async () => {
      const mockDirectors = [
        { id: 1, nombre: 'Director 1' },
        { id: 2, nombre: 'Director 2' },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: mockDirectors,
      })

      const result = await getAllDirectors()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDirectors)
      expect(apiClient.get).toHaveBeenCalledWith('/personas/directores')
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 500,
        statusText: 'Server Error',
      })

      const result = await getAllDirectors()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Server Error')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      const result = await getAllDirectors()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('deleteDirector', () => {
    it('returns success on successful deletion', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 200,
      })

      const result = await deleteDirector(1)

      expect(result.success).toBe(true)
      expect(apiClient.delete).toHaveBeenCalledWith('/personas/directores/1')
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      })

      const result = await deleteDirector(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))

      const result = await deleteDirector(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('createDirector', () => {
    it('creates director with image successfully', async () => {
      const mockDirector = { id: 1, nombre: 'New Director' }
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: { data: mockDirector },
      })

      const result = await createDirector({ nombre: 'New Director' }, mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDirector)
      expect(apiClient.post).toHaveBeenCalledWith(
        '/personas/directores',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('creates director without image successfully', async () => {
      const mockDirector = { id: 1, nombre: 'New Director' }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 200,
        data: mockDirector,
      })

      const result = await createDirector({ nombre: 'New Director' }, null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDirector)
    })

    it('returns error on non-201/200 status', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        status: 400,
        statusText: 'Bad Request',
      })

      const result = await createDirector({ nombre: 'Invalid' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bad Request')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({
        response: { data: 'Validation error' },
        message: 'Request failed',
      })

      const result = await createDirector({ nombre: 'Test' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation error')
    })
  })

  describe('updateDirector', () => {
    it('updates director with image successfully', async () => {
      const mockDirector = { id: 1, nombre: 'Updated Director' }
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: { data: mockDirector },
      })

      const result = await updateDirector(1, { nombre: 'Updated Director' }, mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDirector)
      expect(apiClient.put).toHaveBeenCalledWith(
        '/personas/directores/1',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('updates director without image successfully', async () => {
      const mockDirector = { id: 1, nombre: 'Updated Director' }

      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: mockDirector,
      })

      const result = await updateDirector(1, { nombre: 'Updated Director' }, null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDirector)
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      })

      const result = await updateDirector(999, { nombre: 'Test' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.put).mockRejectedValue({
        response: { data: 'Update failed' },
        message: 'Request failed',
      })

      const result = await updateDirector(1, { nombre: 'Test' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })
})
