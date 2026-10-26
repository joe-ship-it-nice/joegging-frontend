import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/login'
import Signup from './pages/signup'
import Login from './pages/login'
import Feed from './pages/feed'
import Friends from './pages/friends'
import Profile from './pages/profile'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

// eslint-disable-next-line react-refresh/only-export-components
export const ENDPOINTS = {
  signup: `${API_URL}/signup`,
  login: `${API_URL}/login`,
  posts: `${API_URL}/posts`,
  createPost: `${API_URL}/posts`,
  users: `${API_URL}/users`,
  friends: `${API_URL}/friends`,
  profile: `${API_URL}/profile`,
}

function RequireAuth({ children }) {
  const { token, authLoading } = useAuth()
  if (authLoading) return <p>Checking your session...</p>
  return token ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  const { token, authLoading } = useAuth()
  if (authLoading) return <p>Checking your session...</p>
  return token ? <Navigate to="/feed" replace /> : children
}

function Nav() {
  const { token, logout } = useAuth()
  if (!token) {
    return (
      <nav>
        <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link>
      </nav>
    )
  }
  return (
    <nav>
      <Link to="/feed">Feed</Link> |{' '}
      <Link to="/friends">Friends</Link> |{' '}
      <Link to="/profile">Profile</Link> |{' '}
      <button onClick={logout}>Log out</button>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <hr />
        <Routes>
          <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
          <Route path="/friends" element={<RequireAuth><Friends /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
