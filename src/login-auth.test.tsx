import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from './components/LoginForm'
import * as authSupabase from './lib/auth-supabase'

describe('login form authentication', () => {
  it('calls Supabase login with the entered credentials', async () => {
    const signIn = vi
      .spyOn(authSupabase, 'signInWithPassword')
      .mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

    const onAuthenticated = vi.fn()

    render(<LoginForm onAuthenticated={onAuthenticated} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'kate@example.com' },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'kate@example.com',
        'secret123'
      )
    })
  })

  it('shows a Supabase authentication error', async () => {
    vi
      .spyOn(authSupabase, 'signInWithPassword')
      .mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
        } as never,
      })

    render(<LoginForm onAuthenticated={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'kate@example.com' },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText('Invalid login credentials')
    ).toBeInTheDocument()
  })
})
