import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/auth')

function TestComponent() {
  const { user, isAdmin, isLoading, signIn, signUp, signOut } = useAuth()
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="admin">{isAdmin.toString()}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AuthContext', () => {
    it('should provide authentication state', async () => {
      const mockProfile = { id: '123', email: 'test@example.com', role: 'user' as const, created_at: '' }
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockProfile)
      ;(authService.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('admin')).toHaveTextContent('false')
      })
    })

    it('should handle sign in', async () => {
      const mockProfile = { id: '123', email: 'test@example.com', role: 'user' as const, created_at: '' }
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(null)
      ;(authService.signIn as jest.Mock).mockResolvedValue(undefined)
      ;(authService.getCurrentUser as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProfile)
      ;(authService.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
      const signInButton = screen.getByText('Sign In')
      fireEvent.click(signInButton)
      await waitFor(() => {
        expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password')
      })
    })

    it('should handle sign out', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(null)
      ;(authService.signOut as jest.Mock).mockResolvedValue(undefined)
      ;(authService.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)
      await waitFor(() => {
        expect(authService.signOut).toHaveBeenCalled()
      })
    })
  })
}) 