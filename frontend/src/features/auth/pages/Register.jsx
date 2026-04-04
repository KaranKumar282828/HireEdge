import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "../hooks/useAuth"


const Register = () => {

    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()

    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ confirmPassword, setConfirmPassword ] = useState("")
    // ✅ LESSON 75: Confirm password field add kiya
    // User se password confirm karwao — typo se bachao

    const [ errors, setErrors ] = useState({})
    const [ serverError, setServerError ] = useState(null)


    const validate = () => {
        const newErrors = {}

        if (!username.trim()) {
            newErrors.username = "Username is required."
        } else if (username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters."
        } else if (username.trim().length > 30) {
            newErrors.username = "Username must be at most 30 characters."
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password."
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError(null)

        if (!validate()) return

        const result = await handleRegister({ username, email, password })

        if (result) {
            navigate("/")
        }
    }


    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                {serverError && (
                    <div className="error-banner">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => {
                                setUsername(e.target.value)
                                if (errors.username) setErrors(prev => ({ ...prev, username: null }))
                            }}
                            value={username}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            disabled={loading}
                            className={errors.username ? "input-error" : ""}
                        />
                        {errors.username && <span className="field-error">{errors.username}</span>}
                    </div>

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

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }))
                            }}
                            value={confirmPassword}
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            disabled={loading}
                            className={errors.confirmPassword ? "input-error" : ""}
                        />
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                    </div>

                    <button
                        className="button primary-button"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                </form>

                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </main>
    )
}

export default Register