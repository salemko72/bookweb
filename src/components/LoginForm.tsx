import { FormEvent, useState } from 'react'
import { getLoginValidationError } from '../lib/auth'
import { signInWithPassword } from '../lib/auth-supabase'

type LoginFormProps = {
  onAuthenticated: () => void
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextEmailError = !email.trim()
      ? 'Email is required.'
      : null

    const nextPasswordError = !password
      ? 'Password is required.'
      : null

    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    setAuthError(null)

    if (nextEmailError || nextPasswordError) {
      return
    }

    const { error } = await signInWithPassword(email, password)

    if (error) {
      setAuthError(error.message)
      return
    }

    onAuthenticated()
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

      {authError && <p>{authError}</p>}

      <button type="submit">Sign in</button>
    </form>
  )
}
