import { useEffect, useState } from "react"
import Navbar from "./navbar.jsx"
import "./dashboard.css"

export default function Dashboard() {
    const [workouts, setWorkouts] = useState([])
    const [customSport, setCustomSport] = useState("")

    const [form, setForm] = useState({
        date: "",
        duration_minutes: "",
        distance_km: "",
        sport: "Juoksu",
        intensity_zone: "",
        comment: ""
    })

    useEffect(() => {
        fetchWorkouts()
    }, [])

    const fetchWorkouts = async () => {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:3001/workouts", {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setWorkouts(Array.isArray(data) ? data : [])
    }

    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h === 0) return `${m} min`
        if (m === 0) return `${h} h`
        return `${h} h ${m} min`
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        const finalSport =
            form.sport === "Muu" ? customSport : form.sport

        const res = await fetch("http://localhost:3001/workouts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ...form, sport: finalSport })
        })

        const data = await res.json()

        if (res.ok) {
            setWorkouts([...workouts, data[0]])
            setForm({
                date: "",
                duration_minutes: "",
                distance_km: "",
                sport: "Juoksu",
                intensity_zone: "",
                comment: ""
            })
            setCustomSport("")
        }
    }

    const totalMinutes = workouts.reduce(
        (sum, w) => sum + Number(w.duration_minutes || 0),
        0
    )

    const totalDistance = workouts.reduce(
        (sum, w) => sum + Number(w.distance_km || 0),
        0
    )

    return (
        <>
            <Navbar />

            <main className="dashboard">

                <section className="card">
                    <h2>Lisää treeni</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="duration_minutes"
                            type="number"
                            placeholder="Minuutit"
                            value={form.duration_minutes}
                            onChange={handleChange}
                        />

                        <input
                            name="distance_km"
                            type="number"
                            placeholder="Km"
                            value={form.distance_km}
                            onChange={handleChange}
                        />

                        <select
                            name="sport"
                            value={form.sport}
                            onChange={handleChange}
                        >
                            <option>Juoksu</option>
                            <option>Pyöräily</option>
                            <option>Uinti</option>
                            <option>Kuntosali</option>
                            <option value="Muu">Muu</option>
                        </select>

                        {form.sport === "Muu" && (
                            <input
                                placeholder="Kirjoita laji"
                                value={customSport}
                                onChange={(e) =>
                                    setCustomSport(e.target.value)
                                }
                            />
                        )}

                        <button type="submit">Tallenna</button>
                    </form>
                </section>

                <section className="card">
                    <h2>Yhteenveto</h2>

                    <p>Aika: {formatTime(totalMinutes)}</p>
                    <p>Matka: {totalDistance.toFixed(1)} km</p>
                </section>

            </main>
        </>
    )
}