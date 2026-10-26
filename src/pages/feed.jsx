import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/login'
import { ENDPOINTS } from '../App'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const PHOTO_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function PostPhoto({ src, title }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <p>Photo could not load. Refresh the page to try again.</p>
  }

  return (
    <img
      src={src}
      alt={`Running photo for: ${title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        display: 'block',
        width: '100%',
        maxHeight: '500px',
        objectFit: 'contain',
        borderRadius: '8px',
        margin: '18px 0',
      }}
    />
  )
}

export default function Feed() {
  const { apiFetch } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedError, setFeedError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState('')
  const [photo, setPhoto] = useState(null)

  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const photoInputRef = useRef(null)
  const uploadedPhotoRef = useRef(null)
  const postingRef = useRef(false)

  async function loadPosts() {
    const data = await apiFetch(ENDPOINTS.posts)
    setPosts(Array.isArray(data) ? data : data.posts || [])
    setFeedError('')
  }

  useEffect(() => {
    let ignore = false

    apiFetch(ENDPOINTS.posts)
      .then((data) => {
        if (!ignore) {
          setPosts(Array.isArray(data) ? data : data.posts || [])
          setFeedError('')
        }
      })
      .catch((err) => {
        if (!ignore) {
          setFeedError(err.message || 'Unable to load posts.')
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [apiFetch])

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]

    setError('')
    setSuccess('')
    setPhoto(null)
    uploadedPhotoRef.current = null

    if (!file) return

    if (!PHOTO_EXTENSIONS[file.type]) {
      setError('Choose a JPG, PNG, or WebP image.')
      e.target.value = ''
      return
    }

    if (file.size === 0 || file.size > MAX_PHOTO_SIZE) {
      setError('Choose a non-empty image no larger than 5 MB.')
      e.target.value = ''
      return
    }

    setPhoto(file)
  }

  async function handlePost(e) {
    e.preventDefault()
    if (postingRef.current) return

    setError('')
    setSuccess('')

    if (!title.trim()) return setError('Add a title.')
    if (!content.trim()) return setError('Write something first.')

    if (visibility !== 'public' && visibility !== 'friends') {
      return setError('Choose Public or Friends only.')
    }

    postingRef.current = true
    setPosting(true)

    let savingPost = false

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw sessionError

      const currentUser = data.session?.user

      if (!currentUser) {
        throw new Error('Please log in again before posting.')
      }

      let imagePath = null

      if (photo) {
        const previousUpload = uploadedPhotoRef.current

        // Reuse an uploaded photo if saving the post previously failed.
        if (
          previousUpload?.file === photo &&
          previousUpload?.userId === currentUser.id
        ) {
          imagePath = previousUpload.path
        } else {
          const extension = PHOTO_EXTENSIONS[photo.type]

          if (
            !extension ||
            photo.size === 0 ||
            photo.size > MAX_PHOTO_SIZE
          ) {
            throw new Error(
              'Choose a non-empty JPG, PNG, or WebP image up to 5 MB.'
            )
          }

          imagePath =
            `${currentUser.id}/${crypto.randomUUID()}.${extension}`

          setUploading(true)

          const { error: uploadError } = await supabase.storage
            .from('running-photos')
            .upload(imagePath, photo, {
              contentType: photo.type,
              upsert: false,
            })

          setUploading(false)

          if (uploadError) throw uploadError

          uploadedPhotoRef.current = {
            file: photo,
            userId: currentUser.id,
            path: imagePath,
          }
        }
      }

      savingPost = true

      await apiFetch(ENDPOINTS.createPost, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          visibility,
          image_path: imagePath,
        }),
      })

      savingPost = false

      setTitle('')
      setContent('')
      setVisibility('')
      setPhoto(null)
      uploadedPhotoRef.current = null

      if (photoInputRef.current) {
        photoInputRef.current.value = ''
      }

      setSuccess('Your post has been shared with the club.')

      try {
        await loadPosts()
      } catch {
        setFeedError(
          'Your post was saved, but the feed could not refresh. Reload the page.'
        )
      }
    } catch (err) {
      const message = err.message || 'Something went wrong.'

      setError(
        savingPost
          ? `${message} Check the feed before retrying in case the post was saved.`
          : message
      )
    } finally {
      setUploading(false)
      setPosting(false)
      postingRef.current = false
    }
  }

  return (
    <main className="feed-page feed-page-video">
      <video
        className="feed-background-video"
        src="/videos/running-track.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      <div className="feed-background-overlay" aria-hidden="true" />

      <button
        className="feed-video-toggle"
        type="button"
        onClick={(e) => {
          const video = e.currentTarget.parentElement.querySelector('video')

          if (video.paused) {
            video.play().catch(() => { })
          } else {
            video.pause()
          }
        }}
      >
        Play / pause background
      </button>
      <header className="feed-heading">
        <span className="eyebrow">
          JOEGGING / THE RUNNING CLUB
        </span>

        <h1>
          Every pace.
          <br />
          A place.
        </h1>

        <p>
          Share your miles, find your gang, celebrate every finish.
        </p>
      </header>

      <form onSubmit={handlePost} aria-labelledby="create-post-title">
        <h2 id="create-post-title">Share your run.</h2>
        <p>A training tip, a favourite route, or a small victory.</p>

        <p>
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            name="title"
            placeholder="Give your run a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            disabled={posting}
            required
          />
        </p>

        <p>
          <label htmlFor="post-content">Your story</label>
          <textarea
            id="post-content"
            name="content"
            placeholder="How was your run? Share it with the club."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={5000}
            disabled={posting}
            required
          />
        </p>

        <div role="group" aria-labelledby="visibility-label">
          <p id="visibility-label">Who can see your post?</p>

          <label>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={posting}
              required
            />{' '}
            Public
          </label>

          {' '}

          <label style={{ marginLeft: '16px' }}>
            <input
              type="radio"
              name="visibility"
              value="friends"
              checked={visibility === 'friends'}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={posting}
            />{' '}
            Friends only
          </label>
        </div>

        <div className="photo-field">
          <label htmlFor="post-photo">
            Running photo (optional)
          </label>

          <input
            ref={photoInputRef}
            id="post-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={posting}
            aria-describedby="photo-help"
          />

          <small id="photo-help">
            JPG, PNG, or WebP. Maximum 5 MB.
          </small>

          {photo && <p>Selected: {photo.name}</p>}
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={posting}>
          {uploading
            ? 'Uploading photo...'
            : posting
              ? 'Saving post...'
              : 'Share with the club →'}
        </button>

        {success && <p role="status">{success}</p>}
      </form>

      <hr />

      <section aria-labelledby="club-feed-title">
        <h2 id="club-feed-title">From the club.</h2>

        {loading && <p role="status">Loading posts...</p>}

        {feedError && <p role="alert">{feedError}</p>}

        {!loading && !feedError && posts.length === 0 && (
          <p>
            No running posts yet. Be the first to share your Joegging journey!
          </p>
        )}

        {posts.map((post) => (
          <article key={post.id}>
            <h3>{post.title}</h3>

            <p style={{ whiteSpace: 'pre-wrap' }}>
              {post.content}
            </p>

            {post.image_url && (
              <PostPhoto
                key={post.image_url}
                src={post.image_url}
                title={post.title}
              />
            )}

            {post.image_unavailable && (
              <p>This post’s photo is temporarily unavailable.</p>
            )}

            <small>
              {post.author || 'Runner'}
              {' · '}
              {post.visibility === 'friends' ? 'Friends only' : 'Public'}

              {post.created_at && (
                <>
                  {' · '}
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleString()}
                  </time>
                </>
              )}
            </small>
          </article>
        ))}
      </section>
    </main>
  )
}