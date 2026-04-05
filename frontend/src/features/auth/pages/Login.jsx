import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router"
import "../auth.form.scss"
import { useAuth } from "../hooks/useAuth"


const Login = () => {

    const { loading, handleLogin, error } = useAuth()
    // ✅ Update 1: error ab useAuth se aa raha hai — local serverError nahi chahiye
    // ✅ Update 2: useLocation — login ke baad wapas usi page pe bhejo

    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || "/"  // ✅ Jahan se aaya tha

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ errors, setErrors ] = useState({})


    const validate = () => {
        const newErrors = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email.trim()) {
            newErrors.email = "Email is required."
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address."
        }

        if (!password) {
            newErrors.password = "Password is required."
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) return

        const result = await handleLogin({ email, password })

        if (result) {
            navigate(from)  // ✅ "/" ki jagah from use karo — wapas usi page pe
        }
    }


    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {/* ✅ Error ab useAuth se aa raha hai — context mein store hai */}
                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errors.email) setErrors(prev => ({ ...prev, email: null }))
                            }}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            disabled={loading}
                            className={errors.email ? "input-error" : ""}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.password) setErrors(prev => ({ ...prev, password: null }))
                            }}
                            value={password}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            disabled={loading}
                            className={errors.password ? "input-error" : ""}
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    <button
                        className="button primary-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    )
}

export default Login