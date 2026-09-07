import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DatePicker, buildMonthCells } from './DatePicker'

describe('DatePicker', () => {
  it('opens a month grid with Monday-first weeks and European date display', () => {
    render(<DatePicker label="Check-in" value="2026-09-10" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Check-in' }))
    expect(screen.getByText('September 2026')).toBeInTheDocument()
    expect(screen.getAllByText('10.09.2026')).not.toHaveLength(0)
    expect(screen.getByText('Mo')).toBeInTheDocument()
    expect(screen.getByText('Su')).toBeInTheDocument()
  })

  it('selects a date from the calendar', () => {
    const onChange = vi.fn()
    render(<DatePicker label="Check-in" value="2026-09-10" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Check-in' }))
    fireEvent.click(screen.getAllByRole('button', { name: '18' })[0])
    expect(onChange).toHaveBeenCalledWith('2026-09-18')
  })

  it('builds a complete six-week month grid', () => {
    const cells = buildMonthCells(new Date(2026, 8, 1, 12))
    expect(cells).toHaveLength(42)
  })
})
