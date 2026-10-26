import { useEffect, useState } from 'react'
import { useAuth } from '../context/login'
import { ENDPOINTS } from '../App'

export default function Profile() {
    const { apiFetch, user } = useAuth()
    const userId = user?.id

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const controller = new AbortController()

        async function loadProfile() {
            setLoading(true)
            setError('')
            setProfile(null)

            try {
                if (!userId) {
                    throw new Error('Please log in to view your profile.')
                }

                const data = await apiFetch(ENDPOINTS.profile, {
                    signal: controller.signal,
                })

                if (!controller.signal.aborted) {
                    setProfile(data)
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message || 'Could not load your profile.')
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadProfile()

        return () => controller.abort()
    }, [apiFetch, userId])

    if (loading) {
        return <p role="status">Loading your profile...</p>
    }

    if (error) {
        return <p role="alert">{error}</p>
    }

    if (!profile) {
        return <p>Profile not found.</p>
    }

    const joinedDate = profile.created_at
        ? new Date(profile.created_at)
        : null

    const joinedLabel =
        joinedDate && !Number.isNaN(joinedDate.getTime())
            ? joinedDate.toLocaleDateString()
            : 'Not available'

    return (
        <main>
            <h1>My Runner Profile</h1>

            <section className="profile-card">
                <h2>{profile.username || 'Runner'}</h2>

                <p>
                    <strong>Email:</strong> {profile.email}
                </p>

                <p>
                    <strong>Joined:</strong> {joinedLabel}
                </p>

                <p>Keep moving. Keep Joegging.</p>
            </section>
        </main>
    )
}