import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import "./register.css"

export default function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [captchaValue, setCaptchaValue] = useState(null)

    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()

        if (!captchaValue) {
            alert("Vahvista että et ole robotti")
            return
        }

        const res = await fetch("http://localhost:3001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password,
                captcha: captchaValue
            })
        })

        const data = await res.json()

        if (data) {
            alert("Rekisteröinti onnistui")
            navigate("/")
        } else {
            alert("Virhe rekisteröinnissä")
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

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

            <button type="submit">Register</button>

            <p>
                Onko jo tili? <Link to="/">Kirjaudu</Link>
            </p>
        </form>
    )
}