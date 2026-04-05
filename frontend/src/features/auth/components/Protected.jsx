import { useAuth } from "../hooks/useAuth"
import { Navigate, useLocation } from "react-router"


const Protected = ({ children }) => {
    const { loading, user } = useAuth()
    const location = useLocation()


    if (loading) {
        // ✅ Inline style hata diya — global.scss ka class use karo
        return (
            <main className="loading-screen">
                <div className="spinner" />
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }

    return children
}

export default Protected