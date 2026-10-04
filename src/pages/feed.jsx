import DitherVeil from '../components/DitherVeil/DitherVeil'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/login'
import { ENDPOINTS } from '../App'

export default function Feed() {
  const { apiFetch } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState('')
  const [posting, setPosting] = useState(false)

  async function loadPosts() {
    const data = await apiFetch(ENDPOINTS.posts)
    setPosts(Array.isArray(data) ? data : data.posts || [])
  }

  useEffect(() => {
    let ignore = false

    apiFetch(ENDPOINTS.posts)
      .then((data) => {
        if (!ignore) {
          setPosts(Array.isArray(data) ? data : data.posts || [])
        }
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

  async function handlePost(e) {
    e.preventDefault()
    if (posting) return

    setError('')

    if (!title.trim()) return setError('Add a title')
    if (!content.trim()) return setError('Write something first')
    if (!visibility) return setError('Choose Public or Friends only')

    setPosting(true)

    try {
      await apiFetch(ENDPOINTS.createPost, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          visibility,
        }),
      })

      setTitle('')
      setContent('')
      setVisibility('')

      try {
        await loadPosts()
      } catch {
        setError('Your post was saved, but the feed could not refresh. Reload the page.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="feed-page">
      {/* Left interactive panel */}
      <div className="feed-veil feed-veil-left" aria-hidden="true">
        <DitherVeil
          fit="cover"
          pattern="bayer"
          pixelSize={3}
          levels={3}
          inkColor="#070b16"
          paperColor="#8de8f3"
          revealRadius={130}
          softness={0.65}
          linger={1.2}
          rimColor="#8de8f3"
          rim={0.3}
          clickBurst
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Right interactive panel */}
      <div className="feed-veil feed-veil-right" aria-hidden="true">
        <DitherVeil
          fit="cover"
          pattern="bayer"
          pixelSize={3}
          levels={3}
          inkColor="#070b16"
          paperColor="#b5a6ff"
          revealRadius={130}
          softness={0.65}
          linger={1.2}
          rimColor="#b5a6ff"
          rim={0.3}
          clickBurst
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <h1>Feed</h1>

      <form onSubmit={handlePost}>
        <p>
          <input
            aria-label="Post title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
          />
        </p>

        <p>
          <textarea
            aria-label="Post content"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={5000}
            required
          />
        </p>

        <p>
          <label>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={(e) => setVisibility(e.target.value)}
              required
            />{' '}
            Public
          </label>{' '}

          <label>
            <input
              type="radio"
              name="visibility"
              value="friends"
              checked={visibility === 'friends'}
              onChange={(e) => setVisibility(e.target.value)}
            />{' '}
            Friends only
          </label>
        </p>

        <button type="submit" disabled={posting}>
          {posting ? 'Posting...' : 'Post'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <hr />

      {loading && <p role="status">Loading posts...</p>}

      {!loading && !error && posts.length === 0 && (
        <p>No posts yet. Start the conversation!</p>
      )}

      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>

          <small>
            {post.author}
            {' · '}
            {post.visibility === 'friends' ? 'Friends only' : 'Public'}
            {post.created_at &&
              ` · ${new Date(post.created_at).toLocaleString()}`}
          </small>
        </article>
      ))}
    </div>
  )
}