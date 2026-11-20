import { NavLink, useNavigate } from "react-router-dom"
import "./navbar.css"

export default function Navbar() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token")
        window.location.href = "/"
    }

    return (
        <nav className="navbar">
            <h1>Treenikalenteri</h1>

            <div className="nav-links">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                    Etusivu
                </NavLink>

                <NavLink to="/analysis" className={({ isActive }) => isActive ? "active" : ""}>
                    Analyysi
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                    Profiili
                </NavLink>

                <NavLink to="/shared" className={({ isActive }) => isActive ? "active" : ""}>
                    Jaetut
                </NavLink>
                <button className="logout-btn" onClick={handleLogout}>
                    Kirjaudu ulos
                </button>
            </div>
        </nav>
    )
}