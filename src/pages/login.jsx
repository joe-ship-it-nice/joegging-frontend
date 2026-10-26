import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/login'

export default function Login() {
  const { token, authLoading, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoError, setVideoError] = useState(false)

  const busy = loading || googleLoading || authLoading

  // Redirect after the authentication context recognises the session.
  useEffect(() => {
    if (!authLoading && token) {
      navigate('/feed', { replace: true })
    }
  }, [token, authLoading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return

    setError('')
    setLoading(true)

    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    if (busy) return

    setError('')
    setGoogleLoading(true)

    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message || 'Unable to open Google login.')
      setGoogleLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-labelledby="hero-title">
        <video
          className="hero-video"
          src="/videos/running-track.mp4"
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Runner training on an outdoor track"
          onError={() => setVideoError(true)}
        />

        <div className="hero-shade" aria-hidden="true" />

        <div className="hero-copy">
          <span className="eyebrow">YOUR JOEGS. YOUR JOY.</span>

          <h1 id="hero-title">
            JOEG
            <br />
            <span>TOGETHER.</span>
          </h1>

          <p>
            Let's joeg joeyfully.
            <br />
            Joein the joegging joemmunity.
          </p>

          {videoError && (
            <p role="status">
              The running video is currently unavailable.
            </p>
          )}
        </div>
      </section>

      <form className="login-panel" onSubmit={handleSubmit}>
        <div className="login-heading">
          <span className="eyebrow">WELCOME TO THE CLUB</span>
          <h2>Let’s joeg.</h2>
          <p>Your next run starts here.</p>
        </div>

        {authLoading && (
          <p role="status">Checking your session...</p>
        )}

        <button
          className="login-submit"
          type="button"
          onClick={handleGoogleLogin}
          disabled={busy}
        >
          {googleLoading ? 'Opening Google...' : 'Continue with Google'}
        </button>

        <p style={{ textAlign: 'center', margin: '22px 0' }}>
          or sign in with email
        </p>

        <div className="login-field">
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Password</label>

          <div className="password-field">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              required
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              aria-controls="login-password"
              disabled={busy}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && <p role="alert">{error}</p>}

        <button
          className="login-submit"
          type="submit"
          disabled={busy}
        >
          {loading ? 'Signing in…' : 'Start joegging →'}
        </button>

        <p className="login-footer">
          New to Joegging? <Link to="/signup">Join the club</Link>
        </p>
      </form>
    </main>
  )
}