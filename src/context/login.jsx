import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { ENDPOINTS } from '../App'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [authError, setAuthError] = useState(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const queryParams = new URLSearchParams(window.location.search)

    return (
      hashParams.get('error_description') ||
      queryParams.get('error_description') ||
      ''
    )
  })

  useEffect(() => {
    // Remove the token saved by the old Joefriends login system.
    localStorage.removeItem('token')

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = useCallback(async () => {
    setAuthError('')

    const { error } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (error) {
      setAuthError(error.message)
      return
    }

    setSession(null)
  }, [])

  const apiFetch = useCallback(async (url, options = {}) => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    const accessToken = data.session?.access_token
    const headers = new Headers(options.headers)

    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const res = await fetch(url, {
      ...options,
      headers,
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message =
        body.error?.message ||
        body.message ||
        (typeof body.error === 'string' ? body.error : null)

      throw new Error(message || `Request failed (${res.status})`)
    }

    return body.data ?? body
  }, [])

  async function login(email, password) {
    setAuthError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) throw error

    setSession(data.session)
  }

  async function loginWithGoogle() {
    setAuthError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) throw error
  }

  async function signup(email, password, username) {
    return apiFetch(ENDPOINTS.signup, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        username,
      }),
    })
  }

  return (
    <AuthContext.Provider
      value={{
        token: session?.access_token ?? null,
        user: session?.user ?? null,
        authLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        apiFetch,
      }}
    >
      {authError && <p role="alert">{authError}</p>}
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}