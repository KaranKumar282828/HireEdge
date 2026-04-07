import { useState, useRef, useEffect } from "react"
import { useAuth } from "../features/auth/hooks/useAuth"
import { useNavigate } from "react-router"


const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()
    const [ dropdownOpen, setDropdownOpen ] = useState(false)
    const dropdownRef = useRef(null)

    const onLogout = async () => {
        setDropdownOpen(false)
        await handleLogout()
        navigate("/login")
    }

    // ✅ Bahar click karo toh dropdown band ho
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <nav className="navbar">
            {/* ✅ Logo click → Home page */}
            <div
                className="navbar__logo"
                onClick={() => navigate("/")}
            >
                🎯 HireEdge
            </div>

            <div className="navbar__right">
                {/* ✅ Account dropdown */}
                <div className="navbar__account" ref={dropdownRef}>
                    <button
                        className="navbar__account-btn"
                        onClick={() => setDropdownOpen(o => !o)}
                    >
                        <div className="navbar__avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="navbar__username">{user?.username}</span>
                        <svg
                            className={`navbar__chevron ${dropdownOpen ? "navbar__chevron--open" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            width="14" height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {/* ✅ Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="navbar__dropdown">
                            <div className="navbar__dropdown-header">
                                <div className="navbar__dropdown-avatar">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="navbar__dropdown-info">
                                    <p className="navbar__dropdown-name">{user?.username}</p>
                                    <p className="navbar__dropdown-email">{user?.email}</p>
                                </div>
                            </div>

                            <div className="navbar__dropdown-divider" />

                            <button
                                className="navbar__dropdown-item"
                                onClick={() => { navigate("/"); setDropdownOpen(false) }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Home
                            </button>

                            <button
                                className="navbar__dropdown-item navbar__dropdown-item--logout"
                                onClick={onLogout}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar