import { FormEvent, useState } from 'react'
import { getLoginValidationError } from '../lib/auth'

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextEmailError = !email.trim()
      ? 'Email is required.'
      : null

    const nextPasswordError = !password
      ? 'Password is required.'
      : null

    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) {
      return
    }

    setEmailError(getLoginValidationError(email, password))
    setPasswordError(null)

    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      {emailError && <p>{emailError}</p>}

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {passwordError && <p>{passwordError}</p>}

      <button type="submit">Sign in</button>
    </form>
  )
}
