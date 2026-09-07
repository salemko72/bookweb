const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file.'
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be smaller than 2 MB.'
  return null
}

export function readImageFile(file: File): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) return Promise.reject(new Error(validationError))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}
