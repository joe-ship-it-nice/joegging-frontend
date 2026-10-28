import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/login'
import { ENDPOINTS } from '../App'

export default function Friends() {
  const { apiFetch } = useAuth()

  const [users, setUsers] = useState([])
  const [friendships, setFriendships] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadFriends = useCallback(async (shouldIgnore = () => false) => {
    const [usersData, friendsData] = await Promise.all([
      apiFetch(ENDPOINTS.users),
      apiFetch(ENDPOINTS.friends),
    ])

    if (shouldIgnore()) return

    setUsers(usersData)
    setFriendships(friendsData)
  }, [apiFetch])

  useEffect(() => {
    let ignore = false

    // loadFriends updates state only after awaiting the API requests.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFriends(() => ignore)
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [loadFriends])

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
      <h1>Joegging Friends</h1>
      <p>Find joeggers and manage your friend requests.</p>

      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading friends...</p>}

      {!loading && !error && users.length === 0 && (
        <p>No other joeggers yet.</p>
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