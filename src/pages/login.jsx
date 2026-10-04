import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/login'
import DitherVeil from '../components/DitherVeil/DitherVeil'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/feed')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-labelledby="hero-title">
        <div className="hero-art" aria-hidden="true">
          <DitherVeil
            fit="cover"
            pattern="bayer"
            pixelSize={3}
            levels={3}
            inkColor="#080d20"
            paperColor="#8ce8ef"
            revealRadius={150}
            softness={0.65}
            linger={1.2}
            rimColor="#a78bfa"
            rim={0.3}
            clickBurst
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div className="hero-shade" />

        <div className="hero-copy">
          <span className="eyebrow">YOU ARE JOE.</span>
          <h1 id="hero-title">
            Welcome to
            <br />
            <span>Joefriends.</span>
          </h1>
          <p>Real connections. A little more cup of Joe.</p>
        </div>

        <span className="hero-hint">
          Move your cursor or tap to activate Joe's magic.
        </span>
      </section>

      <form className="login-panel" onSubmit={handleSubmit}>
        <div className="login-heading">
          <span className="eyebrow">JOEFRIENDS / SIGN IN</span>
          <h2>Ready to get Joed?</h2>
          <p>Log in to catch up with Joe, Joe, Joe and Joe.</p>
        </div>

        <div className="login-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Password</label>

          <div className="password-field">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              aria-controls="login-password"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && <p role="alert">{error}</p>}

        <button
          className="login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Enter Joefriends →'}
        </button>

        <p className="login-footer">
          Not Joed yet? <Link to="/signup">Joein the circle</Link>
        </p>
      </form>
    </main>
  )
}