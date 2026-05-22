import { useState, useEffect } from "react"
import axios from "axios"
import Navbar from "./navbar.jsx"
import "./profile.css"

export default function Profile() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [sharedEmail, setSharedEmail] = useState("")
    const [sharedUsers, setSharedUsers] = useState([])

    const handleSave = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        try {
            await axios.put(
                "http://localhost:3001/profile",
                {
                    username: name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            alert("Tallennettu!")
        } catch (err) {
            console.error(err)
            alert("Tallennus epäonnistui")
        }
    }

    const handleAddUser = async () => {
        if (!sharedEmail) return

        const token = localStorage.getItem("token")

        try {
            await axios.post(
                "http://localhost:3001/shares",
                { email: sharedEmail },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setSharedUsers([...sharedUsers, sharedEmail])
            setSharedEmail("")

        } catch (err) {
            alert("Käyttäjää ei löytynyt")
        }
    }
    useEffect(() => {
        fetchProfile()
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const token = localStorage.getItem("token")

        try {
            const res = await axios.get("http://localhost:3001/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setName(res.data.username)
            setEmail(res.data.email)

        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchSharedUsers()
    }, [])

    const fetchSharedUsers = async () => {
        const token = localStorage.getItem("token")

        const res = await axios.get("http://localhost:3001/shares", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        setSharedUsers(res.data.map(user => user.email))
    }

    return (
        <>
            <Navbar />

            <main className="dashboard">
                {/* PROFIILI */}
                <section className="card">
                    <h2>Profiilitiedot</h2>
                    <p>Hallinnoi käyttäjätietojasi</p>

                    {/* 👇 MUUTOS: form mukaan */}
                    <form className="profile-form" onSubmit={handleSave}>
                        <label>Nimi</label>
                        <input
                            placeholder="Nimi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label>Sähköposti</label>
                        <input
                            value={email}
                            disabled
                        />

                        <button type="submit">
                            Tallenna muutokset
                        </button>
                    </form>
                </section>

                {/* DATAN JAKAMINEN */}
                <section className="card">
                    <h2>Datan jakaminen</h2>
                    <p>Hallinnoi kuka voi nähdä treenidatasi</p>

                    <div className="share-row">
                        <input
                            placeholder="Käyttäjän sähköposti"
                            value={sharedEmail}
                            onChange={(e) => setSharedEmail(e.target.value)}
                        />
                        <button type="button" onClick={handleAddUser}>
                            Lisää
                        </button>
                    </div>

                    {sharedUsers.length === 0 ? (
                        <p>Et ole jakanut dataasi kenenkään kanssa</p>
                    ) : (
                        <div className="shared-list">
                            {sharedUsers.map((user, i) => (
                                <div key={i} className="shared-user">
                                    {user}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    )
}