import { createBrowserRouter, Navigate } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/Interview"
import { useAuth } from "./features/auth/hooks/useAuth"


/**
 * ✅ PublicOnly — sirf logged out users ke liye
 * Agar already logged in hai toh home pe bhejo
 * Jaise Protected logged out users ko login pe bhejta hai
 * PublicOnly logged in users ko home pe bhejta hai
 */
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


export const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <PublicOnly>   {/* ✅ Logged in user login page pe nahi ja sakta */}
                <Login />
            </PublicOnly>
        )
    },
    {
        path: "/register",
        element: (
            <PublicOnly>   {/* ✅ Logged in user register page pe nahi ja sakta */}
                <Register />
            </PublicOnly>
        )
    },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "*",
        element: (
            <main className="loading-screen">
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontSize: "3rem", color: "#ff2d78" }}>404</h1>
                    <p style={{ color: "#7d8590", marginTop: "0.5rem" }}>Page not found.</p>
                    <a href="/" style={{ color: "#ff2d78", marginTop: "1rem", display: "inline-block", textDecoration: "none" }}>
                        Go back home →
                    </a>
                </div>
            </main>
        )
    }
])