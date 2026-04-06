import { useAuth } from "../features/auth/hooks/useAuth"
import { useNavigate } from "react-router"


const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate("/login")
    }

    return (
        <nav className="navbar">
            <div className="navbar__logo">
                🎯 HireEdge
            </div>
            <div className="navbar__right">
                <span className="navbar__user">
                    👤 {user?.username}
                </span>
                <button onClick={onLogout} className="navbar__logout">
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default Navbar