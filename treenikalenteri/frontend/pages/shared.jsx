import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "./navbar.jsx"
import "./shared.css"

export default function Shared() {
    const [workouts, setWorkouts] = useState([])

    useEffect(() => {
        fetchSharedWorkouts()
    }, [])

    const fetchSharedWorkouts = async () => {
        const token = localStorage.getItem("token")

        const res = await axios.get("http://localhost:3001/shared-workouts", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        setWorkouts(res.data)
    }

    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h === 0) return `${m} min`
        if (m === 0) return `${h} h`
        return `${h} h ${m} min`
    }

    const groupedWorkouts = workouts.reduce((acc, workout) => {
        const user = workout.profiles?.username || workout.profiles?.email || "Tuntematon"

        if (!acc[user]) acc[user] = []
        acc[user].push(workout)

        return acc
    }, {})

    return (
        <>
            <Navbar />

            <main className="shared-page">
                <section className="shared-card">
                    <h2>Jaetut treenit</h2>
                    <p>Treenit, jotka muut käyttäjät ovat jakaneet sinulle</p>

                    {workouts.length === 0 ? (
                        <p>Sinulle ei ole jaettu treenejä</p>
                    ) : (
                        Object.entries(groupedWorkouts).map(([user, userWorkouts]) => (
                            <div className="shared-user-group" key={user}>
                                <h3>{user}</h3>

                                {userWorkouts.map((w) => (
                                    <div className="shared-workout" key={w.id}>

                                        {/* YLÄRIVI */}
                                        <div className="workout-top">
                                            <strong>{new Date(w.date).toLocaleDateString("fi-FI")}</strong>
                                            <span className="sport"> {w.sport}</span>

                                            <button className="delete-btn">🗑</button>
                                        </div>

                                        <div className="workout-meta">
                                            {formatTime(Number(w.duration_minutes || 0))}
                                            {w.distance_km && ` • ${w.distance_km} km`}
                                        </div>

                                        {w.workout_zones && w.workout_zones.length > 0 && (
                                            <div className="workout-zones">
                                                {w.workout_zones.map((z, i) => (
                                                    <div key={i}>
                                                        Teho {z.zone}: {z.minutes} min
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {w.comment && (
                                            <div className="workout-comment">
                                                {w.comment}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </section>
            </main>
        </>
    )
}