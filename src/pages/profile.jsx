import { useEffect, useState } from 'react'
import { useAuth } from '../context/login'
import { ENDPOINTS } from '../App'

export default function Profile() {
    const { token } = useAuth()
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
                const res = await fetch(ENDPOINTS.profile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.message || 'Could not load your profile.')
                }

                setProfile(data)
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadProfile()

        return () => controller.abort()
    }, [token])

    if (loading) return <p>Loading your profile...</p>
    if (error) return <p role="alert">{error}</p>
    if (!profile) return <p>Profile not found.</p>

    return (
        <main>
            <h1>My Runner Profile</h1>

            <section className="profile-card">
                <h2>{profile.username}</h2>
                <p>
                    <strong>Email:</strong> {profile.email}
                </p>
                <p>
                    <strong>Joined:</strong>{' '}
                    {new Date(profile.created_at).toLocaleDateString()}
                </p>
                <p>Keep moving. Keep Joegging.</p>
            </section>
        </main>
    )
}