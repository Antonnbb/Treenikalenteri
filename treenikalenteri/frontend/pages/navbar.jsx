import { Link, useNavigate } from "react-router-dom"
import "./navbar.css"

export default function Navbar() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/")
    }

    return (
        <nav className="navbar">
            <h2 className="logo">Treenikalenteri</h2>

            <div className="links">
                <Link to="/dashboard">Kalenteri</Link>
                <Link to="/analysis">Analyysi</Link>
                <Link to="/profile">Profiili</Link>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    )
}