import { useEffect, useState } from "react"
import Navbar from "./navbar.jsx"
import "./dashboard.css"

export default function Dashboard() {
    const [workouts, setWorkouts] = useState([])

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
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json()
        setWorkouts(Array.isArray(data) ? data : [])
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        const res = await fetch("http://localhost:3001/workouts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(form)
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
        } else {
            alert(data.error || "Treenin tallennus epäonnistui")
        }
    }

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token")

        await fetch(`http://localhost:3001/workouts/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        setWorkouts(workouts.filter((w) => w.id !== id))
    }

    const totalMinutes = workouts.reduce(
        (sum, w) => sum + Number(w.duration_minutes || 0),
        0
    )

    const totalDistance = workouts.reduce(
        (sum, w) => sum + Number(w.distance_km || 0),
        0
    )

    const zones = workouts.reduce((acc, w) => {
        if (!w.intensity_zone) return acc
        acc[w.intensity_zone] =
            (acc[w.intensity_zone] || 0) +
            Number(w.duration_minutes || 0)
        return acc
    }, {})

    const sports = workouts.reduce((acc, w) => {
        acc[w.sport] =
            (acc[w.sport] || 0) + Number(w.duration_minutes || 0)
        return acc
    }, {})

    return (
        <>
            <Navbar />

            <main className="dashboard">
                <section className="card">
                    <h2>Lisää treeni</h2>
                    <p>Kirjaa uusi harjoitus</p>

                    <form className="workout-form" onSubmit={handleSubmit}>
                        <label>Päivämäärä</label>
                        <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />

                        <div className="row">
                            <div>
                                <label>Kesto (min)</label>
                                <input
                                    name="duration_minutes"
                                    type="number"
                                    value={form.duration_minutes}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label>Matka (km)</label>
                                <input
                                    name="distance_km"
                                    type="number"
                                    step="0.1"
                                    value={form.distance_km}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <label>Laji</label>
                        <select
                            name="sport"
                            value={form.sport}
                            onChange={handleChange}
                        >
                            <option>Juoksu</option>
                            <option>Pyöräily</option>
                            <option>Uinti</option>
                            <option>Kuntosali</option>
                        </select>

                        <label>Tehoalue (valinnainen)</label>
                        <select
                            name="intensity_zone"
                            value={form.intensity_zone}
                            onChange={handleChange}
                        >
                            <option value="">Ei määritelty</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>

                        <label>Kommentti (valinnainen)</label>
                        <textarea
                            name="comment"
                            placeholder="Lisää muistiinpanoja..."
                            value={form.comment}
                            onChange={handleChange}
                        />

                        <button type="submit">Tallenna treeni</button>
                    </form>
                </section>

                <section className="card">
                    <h2>Viikon yhteenveto</h2>
                    <p>18.5. - 24.5.2026</p>

                    <div className="summary-grid">
                        <div className="summary-box">
                            <span>Kokonaisaika</span>
                            <strong>{totalMinutes} min</strong>
                        </div>

                        <div className="summary-box">
                            <span>Kokonaismatka</span>
                            <strong>{totalDistance.toFixed(1)} km</strong>
                        </div>
                    </div>

                    <div className="summary-section">
                        <h3>Tehoalueet</h3>
                        {Object.entries(zones).map(([zone, minutes]) => (
                            <div className="summary-row" key={zone}>
                                <span>Tehoalue {zone}</span>
                                <strong>{minutes} min</strong>
                            </div>
                        ))}
                    </div>

                    <div className="summary-section">
                        <h3>Lajit</h3>
                        {Object.entries(sports).map(([sport, minutes]) => (
                            <div className="summary-row" key={sport}>
                                <span>{sport}</span>
                                <strong>{minutes} min</strong>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card">
                    <h2>Viikon treenit</h2>

                    {workouts.map((w) => (
                        <div className="workout-item" key={w.id}>
                            <div className="workout-header">
                                <div>
                                    <strong>
                                        {new Date(w.date).toLocaleDateString(
                                            "fi-FI",
                                            {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "numeric",
                                                year: "numeric"
                                            }
                                        )}
                                    </strong>

                                    <span className="sport">
                                        {w.sport}
                                    </span>

                                    {w.intensity_zone && (
                                        <span className="zone">
                                            Tehoalue {w.intensity_zone}
                                        </span>
                                    )}
                                </div>

                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(w.id)}
                                >
                                    🗑
                                </button>
                            </div>

                            <div className="workout-meta">
                                {w.duration_minutes} min{" "}
                                {w.distance_km &&
                                    `• ${w.distance_km} km`}
                            </div>

                            {w.comment && (
                                <p className="workout-comment">
                                    {w.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            </main>
        </>
    )
}