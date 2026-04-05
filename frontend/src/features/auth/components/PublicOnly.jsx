import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router"


const PublicOnly = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <main className="loading-screen">
                <div className="spinner" />
            </main>
        )
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return children
}

export default PublicOnly