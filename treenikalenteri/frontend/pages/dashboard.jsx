import { useEffect, useState } from "react"
import Navbar from "/pages/navbar.jsx"

export default function Dashboard() {
    const [workouts, setWorkouts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const token = localStorage.getItem("token")

                const res = await fetch("http://localhost:3001/workouts", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const data = await res.json()
                setWorkouts(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkouts()
    }, [])

    if (loading) return <p>Ladataan...</p>

    return (
        <>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <h1>Dashboard</h1>

                {workouts.length === 0 ? (
                    <p>Ei treenejä vielä</p>
                ) : (
                    workouts.map(workout => (
                        <div
                            key={workout.id}
                            style={{
                                background: "#1e293b",
                                padding: "15px",
                                marginBottom: "10px",
                                borderRadius: "10px"
                            }}
                        >
                            <h3>{workout.sport}</h3>
                            <p>Päivä: {workout.date}</p>
                            <p>Kesto: {workout.duration_minutes} min</p>
                            <p>Matka: {workout.distance_km} km</p>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}