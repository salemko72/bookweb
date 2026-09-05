import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const getPropertiesMock = vi.hoisted(() => vi.fn())

vi.mock('./lib/properties-repository', () => ({
  getProperties: getPropertiesMock,
}))

import { PropertiesPage } from './pages/PropertiesPage'

const priko = {
  id: '1',
  name: 'Priko',
  capacity: 6,
  rooms: 3,
  area_m2: 61,
  check_in_time: '14:00:00',
  check_out_time: '10:00:00',
  cleaning_duration_minutes: 120,
  wifi: true,
  air_conditioning: true,
  is_active: true,
}

describe('PropertiesPage', () => {
  it('shows the available properties', async () => {
    getPropertiesMock.mockResolvedValue([
      priko,
      {
        ...priko,
        id: '2',
        name: 'Nelly',
        capacity: 4,
      },
      {
        ...priko,
        id: '3',
        name: 'Pjaca',
        capacity: 5,
      },
    ])

    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByText('Priko')).toBeInTheDocument()
      expect(screen.getByText('Nelly')).toBeInTheDocument()
      expect(screen.getByText('Pjaca')).toBeInTheDocument()
    })
  })

  it('shows Priko property details', async () => {
    getPropertiesMock.mockResolvedValue([priko])

    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByText(/61 m²/i)).toBeInTheDocument()
      expect(screen.getByText(/capacity 6/i)).toBeInTheDocument()
    })
  })
})