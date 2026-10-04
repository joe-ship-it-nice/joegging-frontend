import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/login'
import Signup from './pages/signup'
import Login from './pages/login'
import Feed from './pages/feed'
import Friends from './pages/friends'

export const ENDPOINTS = {
  // signup: `${API_URL}/signup`, // POST { email, password, username }
  signup: 'http://localhost:3000/signup',
  // login: `${API_URL}/login`, // POST { email, password } -> token
  login: 'http://localhost:3000/login',
  // posts: `${API_URL}/posts`, // GET public + friends' posts
  posts: 'http://localhost:3000/posts',
  // createPost: `${API_URL}/posts`, // POST { title, content, visibility } -> new post
  createPost: 'http://localhost:3000/posts',
  // users: `${API_URL}/users`, // GET all users
  users: 'http://localhost:3000/users',
  // friends: `${API_URL}/friends`, // POST { friend_id } -> follow a user
  friends: 'http://localhost:3000/friends',
}

function RequireAuth({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  const { token } = useAuth()
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
      <Link to="/feed">Feed</Link> | <Link to="/friends">Friends</Link> |{' '}
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
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
