import { useState } from "react"
import { login } from "/pages/api.js"
import { Link } from "react-router-dom"
import "./login.css"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()

        const data = await login(email, password)

        if (data.token) {
            localStorage.setItem("token", data.token)
            alert("Login onnistui")
        } else {
            alert("Virhe loginissa")
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
            <p>
                Ei tiliä? <Link to="/register">Rekisteröidy</Link>
            </p>
        </form>
    )
}