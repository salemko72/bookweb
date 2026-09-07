import { describe, expect, it } from 'vitest'
import { validateImageFile } from './property-image'

describe('property image validation', () => {
  it('accepts a normal image file', () => {
    expect(validateImageFile(new File(['image'], 'house.jpg', { type: 'image/jpeg' }))).toBeNull()
  })

  it('rejects non-image files', () => {
    expect(validateImageFile(new File(['text'], 'notes.txt', { type: 'text/plain' }))).toBe('Please choose an image file.')
  })
})
