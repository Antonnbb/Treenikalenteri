import { useState } from "react"
import "./register.css"

export default function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault()

        const res = await fetch("http://localhost:3001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        })

        const data = await res.json()

        if (data) {
            alert("Rekisteröinti onnistui")
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>

            <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

            <button type="submit">Register</button>
        </form>
    )
}