import { describe, expect, it } from 'vitest'
import { readImageFile, validateImageFile } from './property-image'

describe('property image validation', () => {
  it('accepts a normal image file', () => {
    expect(validateImageFile(new File(['image'], 'house.jpg', { type: 'image/jpeg' }))).toBeNull()
  })

  it('rejects non-image files', () => {
    expect(validateImageFile(new File(['text'], 'notes.txt', { type: 'text/plain' }))).toBe('Please choose an image file.')
  })

  it('accepts large phone images for automatic compression', () => {
    const largeImage = new File([new Uint8Array(3 * 1024 * 1024)], 'phone-photo.jpg', { type: 'image/jpeg' })
    expect(validateImageFile(largeImage)).toBeNull()
  })

  it('does not use the original file when its data URL would exceed the limit', async () => {
    const file = new File([new Uint8Array(1.8 * 1024 * 1024)], 'phone-photo.jpg', { type: 'image/jpeg' })
    const originalFileReader = globalThis.FileReader
    const originalImage = globalThis.Image
    const originalDocument = globalThis.document
    const compressed = 'data:image/webp;base64,' + 'a'.repeat(100)

    class MockFileReader {
      result: string | null = 'data:image/jpeg;base64,' + 'a'.repeat(2_500_000)
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      readAsDataURL() { this.onload?.() }
    }
    Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: MockFileReader })
    Object.defineProperty(globalThis, 'Image', { configurable: true, value: class {
      naturalWidth = 100
      naturalHeight = 100
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) { this.onload?.() }
    } })
    Object.defineProperty(globalThis, 'document', { configurable: true, value: {
      createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage: () => undefined }), toDataURL: () => compressed }),
    } })

    await expect(readImageFile(file)).resolves.toBe(compressed)
    Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: originalFileReader })
    Object.defineProperty(globalThis, 'Image', { configurable: true, value: originalImage })
    Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument })
  })
})
