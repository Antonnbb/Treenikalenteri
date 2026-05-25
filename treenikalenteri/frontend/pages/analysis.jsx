import { useState, useEffect } from "react"
import axios from "axios"
import Navbar from "./navbar.jsx"
import "./analysis.css"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts"

export default function Analysis() {
    const [mode, setMode] = useState("year")
    const [workouts, setWorkouts] = useState([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [sportFilter, setSportFilter] = useState("Kaikki lajit")
    const [year, setYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchWorkouts()
    }, [])

    const fetchWorkouts = async () => {
        const token = localStorage.getItem("token")

        try {
            const res = await axios.get("http://localhost:3001/workouts", {
                headers: { Authorization: `Bearer ${token}` }
            })

            setWorkouts(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60

        if (h === 0) return `${m} min`
        if (m === 0) return `${h} h`
        return `${h} h ${m} min`
    }

    const filteredByYear = workouts.filter(
        (w) => new Date(w.date).getFullYear() === Number(year)
    )

    const filteredByRange = workouts.filter((w) => {
        const inDate =
            (!startDate || w.date >= startDate) &&
            (!endDate || w.date <= endDate)

        const inSport =
            sportFilter === "Kaikki lajit" || w.sport === sportFilter

        return inDate && inSport
    })

    const data = mode === "year" ? filteredByYear : filteredByRange

    const totalWorkouts = data.length

    const totalMinutes = data.reduce(
        (sum, w) => sum + Number(w.duration_minutes || 0),
        0
    )

    const totalDistance = data.reduce(
        (sum, w) => sum + Number(w.distance_km || 0),
        0
    )

    const sports = [
        "Kaikki lajit",
        ...new Set(workouts.map((w) => w.sport))
    ]

    const chartData = Array.from({ length: 52 }, (_, i) => {
        const week = i + 1

        const weekWorkouts = data.filter((w) => {
            const d = new Date(w.date)
            const firstDay = new Date(d.getFullYear(), 0, 1)
            const weekNum = Math.ceil(
                ((d - firstDay) / 86400000 + firstDay.getDay() + 1) / 7
            )

            return weekNum === week
        })

        return {
            week: `Vko ${week}`,
            minutes: weekWorkouts.reduce(
                (sum, w) => sum + Number(w.duration_minutes || 0),
                0
            ),
            distance: weekWorkouts.reduce(
                (sum, w) => sum + Number(w.distance_km || 0),
                0
            )
        }
    })

    return (
        <>
            <Navbar />

            <main className="analysis-page">
                <div className="toggle">
                    <button
                        className={mode === "year" ? "active" : ""}
                        onClick={() => setMode("year")}
                    >
                        Vuosianalyysi
                    </button>

                    <button
                        className={mode === "range" ? "active" : ""}
                        onClick={() => setMode("range")}
                    >
                        Aikaväli
                    </button>
                </div>

                {mode === "year" && (
                    <section className="analysis-card">
                        <div className="analysis-header">
                            <div>
                                <h2>Viikoittainen analyysi</h2>
                                <p>Treenimäärät ja kilometrit viikoittain</p>
                            </div>

                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option>2024</option>
                                <option>2025</option>
                                <option>2026</option>
                            </select>
                        </div>

                        <h3 className="chart-title">Treeniaika</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "10px",
                                        border: "1px solid #ccc"
                                    }}
                                    labelStyle={{ color: "#111", fontWeight: "600" }}
                                    itemStyle={{ color: "#333" }}
                                />
                                <Bar dataKey="minutes" fill="#d4d4d4" />
                            </BarChart>
                        </ResponsiveContainer>

                        <h3 className="chart-title">Matka</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "10px",
                                        border: "1px solid #ccc"
                                    }}
                                    labelStyle={{ color: "#111", fontWeight: "600" }}
                                    itemStyle={{ color: "#333" }}
                                />
                                <Bar dataKey="distance" fill="#d4d4d4" />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="analysis-summary">
                            <div>Treenejä: {totalWorkouts}</div>
                            <div>Yhteensä: {formatTime(totalMinutes)}</div>
                            <div>Matka: {totalDistance.toFixed(1)} km</div>
                        </div>
                    </section>
                )}

                {mode === "range" && (
                    <section className="analysis-card">
                        <h2>Aikavälianalyysi</h2>
                        <p>Analysoi treenimääriä valitsemaltasi aikaväliltä</p>

                        <div className="filters">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />

                            <select
                                value={sportFilter}
                                onChange={(e) => setSportFilter(e.target.value)}
                            >
                                {sports.map((sport, i) => (
                                    <option key={i}>{sport}</option>
                                ))}
                            </select>
                        </div>

                        <div className="analysis-summary">
                            <div>Treenejä: {totalWorkouts}</div>
                            <div>Yhteensä: {formatTime(totalMinutes)}</div>
                            <div>Matka: {totalDistance.toFixed(1)} km</div>
                        </div>

                        <div className="range-workouts">
                            <h3>Yksittäiset treenit</h3>

                            {filteredByRange.length === 0 ? (
                                <p>Ei treenejä valitulla aikavälillä</p>
                            ) : (
                                filteredByRange.map((w) => (
                                    <div className="range-workout" key={w.id}>
                                        <div>
                                            <strong>{w.sport}</strong>
                                            <p>
                                                {new Date(w.date).toLocaleDateString("fi-FI")}
                                            </p>
                                        </div>

                                        <div>
                                            <span>
                                                {formatTime(Number(w.duration_minutes || 0))}
                                            </span>
                                            {w.distance_km && (
                                                <span> • {w.distance_km} km</span>
                                            )}
                                        </div>

                                        {w.comment && <p>{w.comment}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}
            </main>
        </>
    )
}