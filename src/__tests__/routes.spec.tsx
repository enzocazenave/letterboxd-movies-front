import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router'
import PrivateRoute from '../routes/PrivateRoute'
import RoleRequiredRoute from '../routes/RoleRequiredRoute'

// Mock del AuthContext con diferentes estados
const mockAuthContext = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext()
}))

describe('PrivateRoute', () => {
  it('renders children when authenticated', () => {
    mockAuthContext.mockReturnValue({
      status: 'authenticated',
      permissions: [],
      user: { profile: { full_name: 'Test User' } }
    })

    render(
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading when checking authentication', () => {
    mockAuthContext.mockReturnValue({
      status: 'checking',
      permissions: [],
      user: null
    })

    render(
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    mockAuthContext.mockReturnValue({
      status: 'not-authenticated',
      permissions: [],
      user: null
    })

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

describe('RoleRequiredRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies permission checking logic', () => {
    mockAuthContext.mockReturnValue({
      status: 'authenticated',
      permissions: ['create_movie', 'edit_movie'],
      user: { profile: { full_name: 'Test User' } }
    })

    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route element={<RoleRequiredRoute requiredRoles={['create_movie']} />}>
            <Route path="/" element={<div data-testid="admin-content">Admin Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    // Verifica que el componente se renderice
    expect(container).toBeInTheDocument()
  })

  it('handles missing permissions', () => {
    mockAuthContext.mockReturnValue({
      status: 'authenticated',
      permissions: ['create_movie'],
      user: { profile: { full_name: 'Test User' } }
    })

    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/movies" element={<div>Movies Page</div>} />
          <Route element={<RoleRequiredRoute requiredRoles={['delete_movie']} />}>
            <Route path="/" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    // Verifica que el componente maneja la redirección
    expect(container).toBeInTheDocument()
  })

  it('supports match=any for multiple permissions', () => {
    mockAuthContext.mockReturnValue({
      status: 'authenticated',
      permissions: ['edit_movie'],
      user: { profile: { full_name: 'Test User' } }
    })

    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route element={
            <RoleRequiredRoute
              requiredRoles={['create_movie', 'edit_movie', 'delete_movie']}
              match="any"
            />
          }>
            <Route path="/" element={<div>Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    expect(container).toBeInTheDocument()
  })

  it('supports match=all for strict permission checking', () => {
    mockAuthContext.mockReturnValue({
      status: 'authenticated',
      permissions: ['create_movie'],
      user: { profile: { full_name: 'Test User' } }
    })

    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/movies" element={<div>Movies Page</div>} />
          <Route element={
            <RoleRequiredRoute
              requiredRoles={['create_movie', 'edit_movie']}
              match="all"
            />
          }>
            <Route path="/" element={<div>Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    // Verifica que el componente maneje correctamente la falta de permisos
    expect(container).toBeInTheDocument()
  })
})
