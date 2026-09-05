import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from './pages/HomePage'

describe('HomePage', () => {
  it('shows the daily operational overview', () => {
    render(<HomePage />)

    expect(screen.getByText(/good morning, kate/i)).toBeInTheDocument()

    expect(
      screen.getByText('Check-ins', { exact: true }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Check-outs', { exact: true }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Cleanings', { exact: true }),
    ).toBeInTheDocument()
  })
})
