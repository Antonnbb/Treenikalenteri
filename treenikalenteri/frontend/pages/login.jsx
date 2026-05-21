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
        <div className="auth-container">
            <div className="auth-card">
                <h2>Kirjaudu sisään</h2>
                <p>Tervetuloa takaisin</p>

                <form className="auth-form" onSubmit={handleLogin}>
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <ReCAPTCHA
                        sitekey="6LckVvMsAAAAAPgP69Cc7ZTJ4vg7Ksv6iy_nGRT1"
                        onChange={(value) => setCaptchaValue(value)}
                    />

                    <button type="submit">Kirjaudu</button>

                    <p>
                        Ei tiliä? <Link to="/register">Rekisteröidy</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}