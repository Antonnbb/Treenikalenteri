import { NavLink, useNavigate } from "react-router-dom"
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
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
    Kalenteri
</NavLink>

<NavLink to="/analysis" className={({ isActive }) => isActive ? "active" : ""}>
    Analyysi
</NavLink>

<NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
    Profiili
</NavLink>
                <button onClick={logout}>Logout</button>
            </div>
        </nav>
    )
}