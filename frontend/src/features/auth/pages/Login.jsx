import { useState } from "react"
import { useNavigate, Link } from "react-router"
import "../auth.form.scss"
import { useAuth } from "../hooks/useAuth"


const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    /**
     * ✅ LESSON 70: Frontend Validation
     * Backend pe bhi validation hai lekin
     * frontend pe bhi karo — unnecessary API call bachti hai
     * User ko instant feedback milta hai
     */
    const [ errors, setErrors ] = useState({})  // ✅ Field-wise errors
    const [ serverError, setServerError ] = useState(null)  // ✅ API errors


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
        return Object.keys(newErrors).length === 0  // ✅ true = valid, false = invalid
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError(null)  // ✅ Pehle ki error clear karo

        // ✅ Validate pehle — sahi ho toh API call karo
        if (!validate()) return

        /**
         * ✅ LESSON 71: Navigate sirf success pe karo
         * handleLogin null return kare toh error hai
         * Tab navigate mat karo — user ko error dikhao
         */
        const result = await handleLogin({ email, password })

        if (result) {
            navigate("/")
        }
        // ✅ Agar result null hai — handleLogin ne setServerError call kar diya hoga
        // Ya hum yahan bhi set kar sakte hain
    }


    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {/**
                  * ✅ LESSON 72: Server error prominently dikhao
                  * "Invalid email or password" — user ko pata chale kya galat hua
                  */}
                {serverError && (
                    <div className="error-banner">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {/**
                      * noValidate — browser ki default validation band karo
                      * Hum apni custom validation use kar rahe hain
                      */}

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => {
                                setEmail(e.target.value)
                                // ✅ LESSON 73: User type kare toh error clear ho
                                if (errors.email) setErrors(prev => ({ ...prev, email: null }))
                            }}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            disabled={loading}  // ✅ Loading mein input disable
                            className={errors.email ? "input-error" : ""}
                        />
                        {/* ✅ Field ke neeche error dikhao */}
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

                    {/**
                      * ✅ LESSON 74: Button states
                      * Loading mein — disable karo aur text change karo
                      * Double submit nahi hoga
                      */}
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