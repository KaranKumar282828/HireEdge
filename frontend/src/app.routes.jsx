import { createBrowserRouter, Navigate } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/Interview"
// ✅ useAuth ko app.routes mein import nahi karna chahiye
// PublicOnly component alag file mein banao


// ✅ PublicOnly ko alag component file mein le jao
// src/features/auth/components/PublicOnly.jsx banao
import PublicOnly from "./features/auth/components/PublicOnly"


export const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <PublicOnly>
                <Login />
            </PublicOnly>
        )
    },
    {
        path: "/register",
        element: (
            <PublicOnly>
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