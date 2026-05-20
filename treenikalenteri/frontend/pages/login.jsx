import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import "./login.css"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [captchaValue, setCaptchaValue] = useState(null)

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!captchaValue) {
            alert("Vahvista että et ole robotti")
            return
        }

        const res = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                captcha: captchaValue
            })
        })

        const data = await res.json()

        if (data.token) {
            localStorage.setItem("token", data.token)
            navigate("/dashboard")
        } else {
            alert(data.error || "Login epäonnistui")
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

            <ReCAPTCHA
                sitekey="6LckVvMsAAAAAPgP69Cc7ZTJ4vg7Ksv6iy_nGRT1"
                onChange={(value) => setCaptchaValue(value)}
            />

            <button type="submit">Login</button>

            <p>
                Ei tiliä? <Link to="/register">Rekisteröidy</Link>
            </p>
        </form>
    )
}