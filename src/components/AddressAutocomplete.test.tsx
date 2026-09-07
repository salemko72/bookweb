import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddressAutocomplete } from './AddressAutocomplete'

const searchAddressesMock = vi.hoisted(() => vi.fn())
vi.mock('../lib/address-search', () => ({ searchAddresses: searchAddressesMock }))

vi.mock('../lib/i18n', () => ({ useT: () => (key: string) => key }))

describe('AddressAutocomplete', () => {
  it('fills the selected address, city and coordinates when a result is chosen', async () => {
    searchAddressesMock.mockResolvedValue([{
      label: 'Kralja Tomislava 27, 21460 Stari Grad, Croatia',
      address: 'Kralja Tomislava 27',
      city: 'Stari Grad',
      postcode: '21460',
      country: 'Croatia',
      latitude: 43.184,
      longitude: 16.595,
    }])
    const onChange = vi.fn()
    render(<AddressAutocomplete value={{ address: 'Kralja Tom', city: '', latitude: null, longitude: null }} onChange={onChange} />)
    await waitFor(() => expect(screen.getByRole('option')).toBeInTheDocument())
    fireEvent.pointerDown(screen.getByRole('option'))
    expect(onChange).toHaveBeenCalledWith({ address: 'Kralja Tomislava 27', city: 'Stari Grad', latitude: 43.184, longitude: 16.595 })
  })
})
