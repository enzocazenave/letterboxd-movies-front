import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPerson } from '../services/peopleService'
import apiClient from '../services/apiClient'

vi.mock('../services/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('peopleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPerson', () => {
    it('creates actor with image successfully', async () => {
      const mockActor = { id: 1, nombre: 'Actor Name' }
      const mockFile = new File(['test'], 'actor.jpg', { type: 'image/jpeg' })

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: mockActor,
      })

      const result = await createPerson('Actor Name', 'actor', mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockActor)
      expect(apiClient.post).toHaveBeenCalledWith(
        '/personas/actores',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('creates director with image successfully', async () => {
      const mockDirector = { id: 1, nombre: 'Director Name' }
      const mockFile = new File(['test'], 'director.jpg', { type: 'image/jpeg' })

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: mockDirector,
      })

      const result = await createPerson('Director Name', 'director', mockFile)

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

    it('creates person without image successfully', async () => {
      const mockPerson = { id: 1, nombre: 'Person Name' }

      vi.mocked(apiClient.post).mockResolvedValue({
        status: 201,
        data: mockPerson,
      })

      const result = await createPerson('Person Name', 'actor', null)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPerson)
    })

    it('returns error on non-201 status', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        status: 400,
        statusText: 'Bad Request',
      })

      const result = await createPerson('Invalid', 'actor', null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bad Request')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))

      const result = await createPerson('Test', 'actor', null)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })
})
