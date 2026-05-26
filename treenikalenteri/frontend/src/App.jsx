import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "/pages/login"
import Register from "/pages/register"
import Home from "/pages/home.jsx"
import Profile from "/pages/profile.jsx"
import Analysis from "/pages/analysis.jsx"
import Shared from "/pages/shared.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/shared" element={<Shared />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App