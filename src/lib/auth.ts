export function getLoginValidationError(
  email: string,
  password: string
): string | null {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!password) {
    return 'Password is required.'
  }

  return null
}
