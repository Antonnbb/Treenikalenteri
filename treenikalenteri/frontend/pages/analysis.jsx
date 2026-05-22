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
    const [year, setYear] = useState(new Date().getFullYear())
    const [sportFilter, setSportFilter] = useState("Kaikki")

    useEffect(() => {
        fetchWorkouts()
    }, [])

    const fetchWorkouts = async () => {
        const token = localStorage.getItem("token")

        try {
            const res = await axios.get("http://localhost:3001/workouts", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setWorkouts(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const filteredByYear = workouts.filter(w =>
        new Date(w.date).getFullYear() === Number(year)
    )

    const filteredByRange = workouts.filter(w => {
        const matchDate =
            (!startDate || w.date >= startDate) &&
            (!endDate || w.date <= endDate)

        const matchSport =
            sportFilter === "Kaikki" || w.sport === sportFilter

        return matchDate && matchSport
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

    const chartData = Array.from({ length: 52 }, (_, i) => {
        const week = i + 1

        const weekWorkouts = data.filter(w => {
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
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>

                        <div className="stats">
                            <div className="stat">
                                <p>Treenejä</p>
                                <h3>{totalWorkouts}</h3>
                            </div>

                            <div className="stat">
                                <p>Yhteensä</p>
                                <h3>{totalMinutes} min</h3>
                            </div>

                            <div className="stat">
                                <p>Matka</p>
                                <h3>{totalDistance.toFixed(1)} km</h3>
                            </div>
                        </div>

                        <h3 className="chart-title">Treeniaika (minuutit)</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="minutes" fill="#d4d4d4" />
                            </BarChart>
                        </ResponsiveContainer>

                        <h3 className="chart-title">Matka (kilometrit)</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="distance" fill="#d4d4d4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </section>
                )}

                {mode === "range" && (
                    <section className="analysis-card">
                        <h2>Aikavälianalyysi</h2>
                        <p>Tarkastele treenejä valitulta aikaväliltä</p>

                        <div className="filters">
                            <div className="filter-group">
                                <label>Alkupäivä</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Loppupäivä</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Laji</label>
                                <select
                                    value={sportFilter}
                                    onChange={(e) => setSportFilter(e.target.value)}
                                >
                                    <option>Kaikki</option>
                                    <option>Juoksu</option>
                                    <option>Pyöräily</option>
                                    <option>Uinti</option>
                                    <option>Kuntosali</option>
                                </select>
                            </div>
                        </div>

                        <div className="stats">
                            <div className="stat">
                                <p>Treenejä</p>
                                <h3>{totalWorkouts}</h3>
                            </div>

                            <div className="stat">
                                <p>Yhteensä</p>
                                <h3>{totalMinutes} min</h3>
                            </div>

                            <div className="stat">
                                <p>Matka</p>
                                <h3>{totalDistance.toFixed(1)} km</h3>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </>
    )
}