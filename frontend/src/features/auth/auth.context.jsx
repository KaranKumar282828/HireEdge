import { createContext, useState, useCallback } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    // ✅ LESSON 94: Error state — useAuth ka error system ab kaam karega
    const [error, setError] = useState(null)


    /**
     * ✅ LESSON 95: clearError helper
     * Jab user koi naya action kare — manually error clear karne ke liye
     * Jaise form dobara submit kare ya page change kare
     */
    const clearError = useCallback(() => {
        setError(null)
    }, [])


    /**
     * ✅ LESSON 96: clearUser helper
     * Sirf logout ke liye nahi — token expire hone pe bhi
     * ek jagah se user clear karo
     */
    const clearUser = useCallback(() => {
        setUser(null)
    }, [])


    return (
        <AuthContext.Provider value={{
            // States
            user, setUser,
            loading, setLoading,
            error, setError,    // ✅ Error state add kiya

            // Helpers
            clearError,         // ✅ Manual error clear
            clearUser           // ✅ Manual user clear
        }}>
            {children}
        </AuthContext.Provider>
    )
}