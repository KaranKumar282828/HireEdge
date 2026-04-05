import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"


export const useAuth = () => {

    const context = useContext(AuthContext)

    // ✅ LESSON 87: Context check — Provider ke bahar use kiya toh clear error
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading, error, setError } = context


    /**
     * ✅ LESSON 88: Error message extract karna
     * Axios error deeply nested hota hai
     * Ek helper se saari jagah consistent error message mile
     */
    const extractErrorMessage = (err) => {
        // Backend ne validation errors array bheja
        if (err?.response?.data?.errors?.length > 0) {
            return err.response.data.errors.join(", ")
        }
        // Backend ne single message bheja
        if (err?.response?.data?.message) {
            return err.response.data.message
        }
        // Network error
        if (err?.message === "Network Error") {
            return "Unable to connect to server. Please check your internet connection."
        }
        // Rate limit
        if (err?.response?.status === 429) {
            return "Too many attempts. Please try again later."
        }
        return "Something went wrong. Please try again."
    }


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        setError(null)  // ✅ Pehle ki error clear karo
        try {
            const data = await login({ email, password })
            setUser(data.user)
            /**
             * ✅ LESSON 89: Return karo — Login.jsx mein
             * if(result) navigate("/") tab kaam karega
             * Return nahi kiya toh navigate hamesha hoga
             * chahe login fail ho ya success
             */
            return data.user
        } catch (err) {
            // ✅ LESSON 90: Error set karo — user ko dikhao
            const message = extractErrorMessage(err)
            setError(message)
            console.error("handleLogin Error:", err)
            return null  // ✅ null return — Login.jsx navigate nahi karega
        } finally {
            setLoading(false)
        }
    }


    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        setError(null)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data.user  // ✅ Success pe user return karo
        } catch (err) {
            const message = extractErrorMessage(err)
            setError(message)
            console.error("handleRegister Error:", err)
            return null
        } finally {
            setLoading(false)
        }
    }


    const handleLogout = async () => {
        setLoading(true)
        setError(null)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            /**
             * ✅ LESSON 91: Logout pe error aaye toh bhi user clear karo
             * Token blacklist fail ho sakta hai backend pe
             * Lekin frontend pe user ko logout karna zaroori hai
             * Security ke liye local state hamesha clear karo
             */
            console.error("handleLogout Error:", err)
            setUser(null)  // ✅ Error aaye tab bhi logout karo
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        let isMounted = true  // ✅ LESSON 92: Component unmount cleanup

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                /**
                 * ✅ LESSON 93: isMounted check
                 * Agar component unmount ho gaya response aane se pehle
                 * toh state update mat karo — memory leak + React warning
                 */
                if (isMounted) {
                    setUser(data.user)
                }
            } catch (err) {
                /**
                 * ✅ 401 error normal hai — user logged out hai
                 * Koi error set karne ki zaroorat nahi — sirf null rakho
                 * Baaki errors ke liye console mein log karo
                 */
                if (err?.response?.status !== 401 && isMounted) {
                    console.error("getMe Error:", err)
                }
                if (isMounted) {
                    setUser(null)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        getAndSetUser()

        return () => {
            isMounted = false  // ✅ Cleanup
        }
    }, [])


    return { user, loading, error, handleRegister, handleLogin, handleLogout }
    //                        ✅ error bhi return karo
}