import { useEffect, useState } from "react"
import "./profile.css"

export default function Profile() {
    const [user, setUser] = useState({
        username: "",
        email: ""
    })

    const [coachEmail, setCoachEmail] = useState("")
    const [isPublic, setIsPublic] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const token = localStorage.getItem("token")

        const res = await fetch("http://localhost:3001/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json()

        if (res.ok) {
            setUser(data)
            setCoachEmail(data.coach_email || "")
            setIsPublic(data.is_public || false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        const res = await fetch("http://localhost:3001/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                username: user.username,
                coach_email: coachEmail,
                is_public: isPublic
            })
        })

        const data = await res.json()

        if (res.ok) {
            alert("Tallennettu!")
        } else {
            alert(data.error || "Virhe")
        }
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Profiili</h2>
                <p>Hallitse käyttäjätietojasi</p>

                <form className="profile-form" onSubmit={handleSave}>
                    <label>Käyttäjänimi</label>
                    <input
                        value={user.username}
                        onChange={(e) =>
                            setUser({ ...user, username: e.target.value })
                        }
                    />

                    <label>Email</label>
                    <input value={user.email} disabled />

                    <label>Valmentajan sähköposti</label>
                    <input
                        placeholder="esim. coach@gmail.com"
                        value={coachEmail}
                        onChange={(e) => setCoachEmail(e.target.value)}
                    />

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        Julkinen profiili (kaikki näkee treenit)
                    </label>

                    <button type="submit">Tallenna muutokset</button>
                </form>
            </div>
        </div>
    )
}