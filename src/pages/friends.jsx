import { useEffect, useState } from 'react'
import { useAuth } from '../context/login'
import { ENDPOINTS } from '../App'

export default function Friends() {
  const { apiFetch } = useAuth()

  const [users, setUsers] = useState([])
  const [friendships, setFriendships] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function loadFriends() {
    const usersData = await apiFetch(ENDPOINTS.users)
    const friendsData = await apiFetch(ENDPOINTS.friends)

    setUsers(usersData)
    setFriendships(friendsData)
  }

  useEffect(() => {
    let ignore = false

    Promise.all([
      apiFetch(ENDPOINTS.users),
      apiFetch(ENDPOINTS.friends),
    ])
      .then(([usersData, friendsData]) => {
        if (ignore) return

        setUsers(usersData)
        setFriendships(friendsData)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [apiFetch])

  async function sendRequest(userId) {
    setError('')
    setBusy(true)

    try {
      await apiFetch(ENDPOINTS.friends, {
        method: 'POST',
        body: JSON.stringify({ friend_id: userId }),
      })

      await loadFriends()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function acceptRequest(requestId) {
    setError('')
    setBusy(true)

    try {
      await apiFetch(`${ENDPOINTS.friends}/${requestId}/accept`, {
        method: 'PATCH',
      })

      await loadFriends()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function renderAction(user) {
    const friendship = friendships.find(
      (item) =>
        item.user_id === user.id || item.friend_id === user.id
    )

    if (!friendship) {
      return (
        <button
          onClick={() => sendRequest(user.id)}
          disabled={busy}
        >
          Add friend
        </button>
      )
    }

    if (friendship.status === 'accepted') {
      return <span>Friends ✓</span>
    }

    // The other user sent this request to us.
    if (friendship.user_id === user.id) {
      return (
        <button
          onClick={() => acceptRequest(friendship.id)}
          disabled={busy}
        >
          Accept request
        </button>
      )
    }

    return <span>Request sent</span>
  }

  return (
    <div>
      <h1>Joefriends</h1>
      <p>Find people and manage your friend requests.</p>

      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading friends...</p>}

      {!loading && !error && users.length === 0 && (
        <p>No other users yet.</p>
      )}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.username}</strong>{' '}
            {renderAction(user)}
          </li>
        ))}
      </ul>
    </div>
  )
}