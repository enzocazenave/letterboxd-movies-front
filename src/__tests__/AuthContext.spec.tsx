import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../contexts/AuthContext'
import * as authService from '../services/authService'

vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  decodeToken: vi.fn(),
}))

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('AuthProvider', () => {
    it('initializes and validates token on mount', async () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      // Initially checking or not-authenticated
      expect(['checking', 'not-authenticated']).toContain(result.current.status)
      
      await waitFor(() => {
        expect(result.current.status).toBe('not-authenticated')
      })
    })

    it('sets status to not-authenticated when no user in localStorage', async () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.status).toBe('not-authenticated')
      })
    })

    it('loads user from localStorage on mount', async () => {
      const mockUser = {
        access_token: 'test-token',
        profile: {
          email: 'test@example.com',
          expiresAt: new Date(Date.now() + 10000).toISOString(),
          full_name: 'Test User',
          permissions: ['read', 'write'],
          role: 'admin',
          user_id: 1,
        },
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.status).toBe('authenticated')
      })
    })

    it('logs out user when token is expired', async () => {
      const mockUser = {
        access_token: 'test-token',
        profile: {
          email: 'test@example.com',
          expiresAt: new Date(Date.now() - 10000).toISOString(), // Expired
          full_name: 'Test User',
          permissions: ['read'],
          role: 'user',
          user_id: 1,
        },
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.status).toBe('not-authenticated')
        expect(result.current.user).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
      })
    })

    it('provides empty permissions array when user is null', () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      expect(result.current.permissions).toEqual([])
    })

    it('provides user permissions when user exists', async () => {
      const mockUser = {
        access_token: 'test-token',
        profile: {
          email: 'test@example.com',
          expiresAt: new Date(Date.now() + 10000).toISOString(),
          full_name: 'Test User',
          permissions: ['create_movie', 'edit_movie', 'delete_movie'],
          role: 'admin',
          user_id: 1,
        },
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.permissions).toEqual(['create_movie', 'edit_movie', 'delete_movie'])
      })
    })
  })

  describe('login', () => {
    it('successfully logs in user', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          token: JSON.stringify({
            access_token: 'new-token',
          }),
        },
      }

      const mockDecodedToken = {
        success: true,
        data: {
          email: 'user@example.com',
          expiresAt: new Date(Date.now() + 10000).toISOString(),
          full_name: 'New User',
          permissions: ['read'],
          role: 'user',
          user_id: 2,
        },
      }

      vi.mocked(authService.loginUser).mockResolvedValue(mockLoginResponse)
      vi.mocked(authService.decodeToken).mockResolvedValue(mockDecodedToken)

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.login({ username: 'user', password: 'pass' })
      })

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated')
        expect(result.current.user?.access_token).toBe('new-token')
        expect(result.current.user?.profile?.email).toBe('user@example.com')
      })
    })

    it('logs out user when login fails', async () => {
      const mockLoginResponse = {
        success: false,
        error: 'Invalid credentials',
      }

      vi.mocked(authService.loginUser).mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.login({ username: 'wrong', password: 'wrong' })
      })

      await waitFor(() => {
        expect(result.current.status).toBe('not-authenticated')
        expect(result.current.user).toBeNull()
      })
    })

    it('logs out user when token decode fails', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          token: JSON.stringify({
            access_token: 'new-token',
          }),
        },
      }

      const mockDecodedToken = {
        success: false,
        error: 'Token decode failed',
      }

      vi.mocked(authService.loginUser).mockResolvedValue(mockLoginResponse)
      vi.mocked(authService.decodeToken).mockResolvedValue(mockDecodedToken)

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.login({ username: 'user', password: 'pass' })
      })

      await waitFor(() => {
        expect(result.current.status).toBe('not-authenticated')
        expect(result.current.user).toBeNull()
      })
    })
  })

  describe('logout', () => {
    it('clears user data and sets status to not-authenticated', async () => {
      const mockUser = {
        access_token: 'test-token',
        profile: {
          email: 'test@example.com',
          expiresAt: new Date(Date.now() + 10000).toISOString(),
          full_name: 'Test User',
          permissions: ['read'],
          role: 'user',
          user_id: 1,
        },
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated')
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.status).toBe('not-authenticated')
      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('useAuthContext', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuthContext())
      }).toThrow('useAuthContext must be used within an AuthProvider')
    })
  })
})
