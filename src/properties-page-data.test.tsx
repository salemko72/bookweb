import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const getPropertiesMock = vi.hoisted(() => vi.fn())

vi.mock('./lib/properties-repository', () => ({
  getProperties: getPropertiesMock,
}))

import { PropertiesPage } from './pages/PropertiesPage'

const properties = [
  {
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
  },
  {
    id: '2',
    name: 'Nelly',
    capacity: 4,
    rooms: 2,
    area_m2: 45,
    check_in_time: '14:00:00',
    check_out_time: '10:00:00',
    cleaning_duration_minutes: 120,
    wifi: true,
    air_conditioning: false,
    is_active: true,
  },
]

describe('PropertiesPage data loading', () => {
  it('loads and displays properties from the repository', async () => {
    getPropertiesMock.mockResolvedValue(properties)

    render(<PropertiesPage />)

    expect(screen.getByText('Loading properties...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Priko')).toBeInTheDocument()
      expect(screen.getByText('Nelly')).toBeInTheDocument()
    })

    expect(getPropertiesMock).toHaveBeenCalledTimes(1)
  })

  it('shows a repository error', async () => {
    getPropertiesMock.mockRejectedValue(new Error('Database unavailable'))

    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByText('Database unavailable')).toBeInTheDocument()
    })
  })

  it('shows an empty state when there are no properties', async () => {
    getPropertiesMock.mockResolvedValue([])

    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByText('No properties yet')).toBeInTheDocument()
    })
  })
})