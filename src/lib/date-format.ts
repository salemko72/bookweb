export const DEFAULT_DATE_FORMAT = 'DD.MM.YYYY' as const

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()].join('.')
}

export function formatDateShort(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0')].join('.')
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} → ${formatDate(end)}`
}

export function formatDateInput(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  return `${value.slice(8, 10)}.${value.slice(5, 7)}.${value.slice(0, 4)}`
}

export function parseEUDate(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim())
  if (!match) return null
  const [, day, month, year] = match
  const candidate = new Date(Number(year), Number(month) - 1, Number(day), 12)
  if (candidate.getFullYear() !== Number(year) || candidate.getMonth() !== Number(month) - 1 || candidate.getDate() !== Number(day)) return null
  return `${year}-${month}-${day}`
}
