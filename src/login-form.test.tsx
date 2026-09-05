import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LoginForm } from './components/LoginForm'

describe('login form', () => {
  it('shows required field errors when submitted empty', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  it('submits email and password when both are provided', () => {
    const onSubmit = vi.fn()

    render(<LoginForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'kate@example.com' },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(onSubmit).toHaveBeenCalledWith('kate@example.com', 'secret123')
  })
})
