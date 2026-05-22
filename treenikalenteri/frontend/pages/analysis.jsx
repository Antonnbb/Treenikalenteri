import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "/pages/navbar.jsx"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import "/pages/analysis.css"

export default function Analysis() {
    const [workouts, setWorkouts] = useState([])
    const [year, setYear] = useState("2026")

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

    const weeklyData = Array.from({ length: 53 }, (_, i) => {
        const week = i + 1

        const weekWorkouts = workouts.filter(w => {
            const date = new Date(w.date)
            const wYear = date.getFullYear()

            const firstDay = new Date(date.getFullYear(), 0, 1)
            const pastDays = Math.floor((date - firstDay) / 86400000)
            const weekNumber = Math.ceil((pastDays + firstDay.getDay() + 1) / 7)

            return wYear.toString() === year && weekNumber === week
        })

        const minutes = weekWorkouts.reduce(
            (sum, w) => sum + Number(w.duration_minutes || 0),
            0
        )

        const distance = weekWorkouts.reduce(
            (sum, w) => sum + Number(w.distance_km || 0),
            0
        )

        return {
            week: `Vko ${week}`,
            minutes,
            distance
        }
    })

    return (
        <>
            <Navbar />

            <main className="analysis">
                <section className="card">
                    <div className="analysis-header">
                        <div>
                            <h2>Viikoittainen analyysi</h2>
                            <p>Treenimäärät ja kilometrit viikoittain</p>
                        </div>

                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>

                    <h3>Treeniaika (minuutit)</h3>
                    <div className="chart">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={weeklyData}>
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="minutes"
                                    stroke="#4ade80"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <h3>Matka (kilometrit)</h3>
                    <div className="chart">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={weeklyData}>
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="distance"
                                    stroke="#60a5fa"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </main>
        </>
    )
}