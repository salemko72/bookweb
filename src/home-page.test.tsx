import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './pages/HomePage'

const { getDailyOperationalDataMock, getPropertiesMock } = vi.hoisted(() => ({
  getDailyOperationalDataMock: vi.fn(),
  getPropertiesMock: vi.fn(),
}))

vi.mock('./lib/operational-repository', () => ({
  getDailyOperationalData: getDailyOperationalDataMock,
}))

vi.mock('./lib/properties-repository', () => ({
  getProperties: getPropertiesMock,
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getDailyOperationalDataMock.mockResolvedValue({
      reservations: [],
      cleanings: [],
    })

    getPropertiesMock.mockResolvedValue([])
  })

  it('shows the daily operational overview', async () => {
    render(<HomePage />)

    expect(await screen.findByText(/good morning, kate/i)).toBeInTheDocument()
    expect(screen.getByText('Check-ins')).toBeInTheDocument()
    expect(screen.getByText('Check-outs')).toBeInTheDocument()
    expect(screen.getByText('Cleanings')).toBeInTheDocument()

    await waitFor(() => {
      expect(getDailyOperationalDataMock).toHaveBeenCalled()
      expect(getPropertiesMock).toHaveBeenCalled()
    })
  })
})
