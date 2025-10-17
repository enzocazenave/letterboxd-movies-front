import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllPlatforms, deletePlatform, createPlatform, updatePlatform } from '../services/platformService'
import apiClient from '../services/apiClient'

vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('platformService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPlatforms', () => {
    it('returns platforms on successful request', async () => {
      const mockPlatforms = [
        { id: 1, nombre: 'Netflix' },
        { id: 2, nombre: 'Prime Video' },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: { data: mockPlatforms },
      })

      const result = await getAllPlatforms()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPlatforms)
      expect(apiClient.get).toHaveBeenCalledWith('/plataformas')
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 500,
        statusText: 'Server Error',
      })

      const result = await getAllPlatforms()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Server Error')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      const result = await getAllPlatforms()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('deletePlatform', () => {
    it('returns success on successful deletion', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 200,
      })

      const result = await deletePlatform(1)

      expect(result.success).toBe(true)
      expect(apiClient.delete).toHaveBeenCalledWith('/plataformas/1')
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      })

      const result = await deletePlatform(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))

      const result = await deletePlatform(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('createPlatform', () => {
    it('creates platform with logo successfully', async () => {
      const mockPlatform = { id: 1, nombre: 'Disney+' }
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' })

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: { data: mockPlatform },
      })

      const result = await createPlatform({ nombre: 'Disney+' }, mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPlatform)
      expect(apiClient.post).toHaveBeenCalledWith(
        '/plataformas',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('creates platform without logo successfully', async () => {
      const mockPlatform = { id: 1, nombre: 'HBO Max' }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 200,
        data: mockPlatform,
      })

      const result = await createPlatform({ nombre: 'HBO Max' }, null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPlatform)
    })

    it('returns error on non-201/200 status', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        status: 400,
        statusText: 'Bad Request',
      })

      const result = await createPlatform({ nombre: 'Invalid' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bad Request')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({
        response: { data: 'Validation error' },
        message: 'Request failed',
      })

      const result = await createPlatform({ nombre: 'Test' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation error')
    })
  })

  describe('updatePlatform', () => {
    it('updates platform with logo successfully', async () => {
      const mockPlatform = { id: 1, nombre: 'Updated Platform' }
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' })

      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: { data: mockPlatform },
      })

      const result = await updatePlatform(1, { nombre: 'Updated Platform' }, mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPlatform)
      expect(apiClient.put).toHaveBeenCalledWith(
        '/plataformas/1',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('updates platform without logo successfully', async () => {
      const mockPlatform = { id: 1, nombre: 'Updated Platform' }

      vi.mocked(apiClient.put).mockResolvedValue({
        status: 200,
        data: mockPlatform,
      })

      const result = await updatePlatform(1, { nombre: 'Updated Platform' }, null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPlatform)
    })

    it('returns error on non-200 status', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      })

      const result = await updatePlatform(999, { nombre: 'Test' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not Found')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.put).mockRejectedValue({
        response: { data: 'Update failed' },
        message: 'Request failed',
      })

      const result = await updatePlatform(1, { nombre: 'Test' }, null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })
})
