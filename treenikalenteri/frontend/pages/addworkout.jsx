import { useState } from "react"

export default function AddWorkout({ onWorkoutAdded }) {
    const [form, setForm] = useState({
        date: "",
        sport: "",
        duration_minutes: "",
        distance_km: "",
        intensity_zone: "",
        comment: ""
    })

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
            alert("Treeni lisätty")
            onWorkoutAdded(data[0])
            setForm({
                date: "",
                sport: "",
                duration_minutes: "",
                distance_km: "",
                intensity_zone: "",
                comment: ""
            })
        } else {
            alert(data.error || "Virhe treenin lisäämisessä")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Lisää treeni</h2>

            <input name="date" type="date" value={form.date} onChange={handleChange} required />
            <input name="sport" placeholder="Laji" value={form.sport} onChange={handleChange} required />
            <input name="duration_minutes" type="number" placeholder="Kesto min" value={form.duration_minutes} onChange={handleChange} />
            <input name="distance_km" type="number" step="0.1" placeholder="Matka km" value={form.distance_km} onChange={handleChange} />
            <input name="intensity_zone" type="number" placeholder="Tehoalue 1-5" value={form.intensity_zone} onChange={handleChange} />
            <input name="comment" placeholder="Kommentti" value={form.comment} onChange={handleChange} />

            <button type="submit">Lisää treeni</button>
        </form>
    )
}