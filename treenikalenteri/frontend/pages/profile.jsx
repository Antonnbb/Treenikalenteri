import { useState } from "react"
import Navbar from "./navbar.jsx"
import "./profile.css"

export default function Profile() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [sharedEmail, setSharedEmail] = useState("")
    const [sharedUsers, setSharedUsers] = useState([])

    const handleSave = () => {
        alert("Tallennettu (tee backend myöhemmin)")
    }

    const handleAddUser = () => {
        if (!sharedEmail) return

        setSharedUsers([...sharedUsers, sharedEmail])
        setSharedEmail("")
    }

    return (
        <>
            <Navbar />

            <main className="dashboard">
                {/* PROFIILI */}
                <section className="card">
                    <h2>Profiilitiedot</h2>
                    <p>Hallinnoi käyttäjätietojasi</p>

                    <div className="profile-form">
                        <label>Nimi</label>
                        <input
                            placeholder="Nimi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label>Sähköposti</label>
                        <input
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button onClick={handleSave}>
                            Tallenna muutokset
                        </button>
                    </div>
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
                        <button onClick={handleAddUser}>Lisää</button>
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