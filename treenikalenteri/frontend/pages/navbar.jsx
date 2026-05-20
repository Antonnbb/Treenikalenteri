import { Link, useNavigate } from "react-router-dom"
import "./navbar.css"

export default function Navbar() {
    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem("token")
        navigate("/")
    }

    return (
        <nav className="navbar">
            <h1>Treenikalenteri</h1>

            <div className="nav-links">
                <Link className="active" to="/dashboard">Kalenteri</Link>
                <Link to="/analysis">Analyysi</Link>
                <Link to="/profile">Profiili</Link>
                <button onClick={logout}>Logout</button>
            </div>
        </nav>
    )
}