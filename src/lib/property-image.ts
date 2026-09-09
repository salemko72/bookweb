// Images are stored as Base64 text in the property row. Keep the complete
// request comfortably below gateway limits, including JSON overhead.
const MAX_IMAGE_PAYLOAD_BYTES = 900 * 1024
const MAX_IMAGE_DIMENSION = 1600
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52, 0.42]

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file.'
  return null
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}

function dataUrlPayloadBytes(dataUrl: string): number {
  // A data URL contains ASCII only, so its string length is its UTF-8 payload
  // size. Measuring decoded image bytes would under-count Base64 by ~33%.
  return dataUrl.length
}

async function compressImage(dataUrl: string): Promise<string> {
  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    throw new Error('This device cannot compress the image automatically.')
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('Could not decode the image.'))
    element.src = dataUrl
  })

  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  if (!width || !height) throw new Error('Could not determine the image size.')

  const canvas = document.createElement('canvas')
  const maxDimension = Math.max(width, height)
  for (const dimension of [MAX_IMAGE_DIMENSION, 1400, 1200, 1000, 800]) {
    const scale = Math.min(1, dimension / maxDimension)
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('This device cannot compress the image automatically.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of QUALITY_STEPS) {
      const webp = canvas.toDataURL('image/webp', quality)
      const candidate = webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality)
      if (dataUrlPayloadBytes(candidate) <= MAX_IMAGE_PAYLOAD_BYTES) return candidate
    }
  }

  throw new Error('Image could not be reduced to a safe upload size. Please choose a smaller photo.')
}

export async function readImageFile(file: File): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) return Promise.reject(new Error(validationError))
  const dataUrl = await readFileAsDataUrl(file)
  // The database receives the Base64 data URL, which is roughly one third
  // larger than the original file. Check the actual payload rather than the
  // source file size so a 1.8 MB phone photo cannot exceed the 2 MB limit.
  return dataUrlPayloadBytes(dataUrl) <= MAX_IMAGE_PAYLOAD_BYTES ? dataUrl : compressImage(dataUrl)
}
