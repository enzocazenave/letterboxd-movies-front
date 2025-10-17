import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginUser, decodeToken } from '../services/authService'
import apiClient from '../services/apiClient'

vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginUser', () => {
    it('returns success on successful login', async () => {
      const mockResponse = {
        status: 200,
        data: { token: 'test-token' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await loginUser({ username: 'user', password: 'pass' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ token: 'test-token' })
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'user',
        password: 'pass',
      })
    })

    it('returns error on non-200 status', async () => {
      const mockResponse = {
        status: 401,
        statusText: 'Unauthorized',
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await loginUser({ username: 'wrong', password: 'wrong' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))

      const result = await loginUser({ username: 'user', password: 'pass' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('decodeToken', () => {
    it('returns decoded token on success', async () => {
      const mockData = {
        email: 'user@example.com',
        full_name: 'Test User',
        permissions: ['read', 'write'],
      }

      const mockResponse = {
        status: 200,
        data: mockData,
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await decodeToken()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(apiClient.get).toHaveBeenCalledWith('/auth/decode')
    })

    it('returns error on exception', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Token expired'))

      const result = await decodeToken()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Token expired')
    })
  })
})
