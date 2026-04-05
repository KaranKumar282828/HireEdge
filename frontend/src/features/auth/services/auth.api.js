import axios from "axios"


/**
 * ✅ LESSON 97: BaseURL environment variable se lo
 * Development mein localhost, production mein real URL
 * .env mein likho: VITE_API_BASE_URL=http://localhost:3000
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
    // ✅ LESSON 98: Timeout — agar server respond na kare
    // Bina timeout ke request hamesha pending rahegi
    timeout: 15000  // 15 seconds
})


/**
 * ✅ LESSON 99: Axios Interceptor — ek jagah se saari errors handle karo
 * Har function mein alag catch likhne ki zaroorat nahi
 * Interceptor har response pe chalega automatically
 */
api.interceptors.response.use(
    // ✅ Success response — seedha return karo
    (response) => response,

    // ✅ Error response — yahan handle karo
    (error) => {
        // ✅ LESSON 100: 401 — token expire hua — page reload karo
        // User automatically login page pe chala jayega
        if (error.response?.status === 401) {
            // Sirf logout page pe nahi hain toh redirect karo
            if (!window.location.pathname.includes("/login")) {
                const pathname = window.location.pathname
                 // ✅ Login aur Register dono check karo
                const isPublicPage = pathname.includes("/login") ||
                                 pathname.includes("/register")

                if (!isPublicPage) {
                    window.location.href = "/login"
                }
            }
        }

        /**
         * ✅ LESSON 101: Error throw karo — mat swallow karo!
         * Ye sabse important fix hai
         * Agar yahan throw nahi kiya toh:
         * - useAuth ka catch block kabhi nahi chalega
         * - extractErrorMessage kabhi kaam nahi karega
         * - User ko kabhi error nahi dikhega
         */
        return Promise.reject(error)
    }
)


export async function register({ username, email, password }) {
    /**
     * ✅ LESSON 102: Try-catch bilkul mat lagao API functions mein
     * Interceptor handle kar raha hai common errors
     * useAuth ka extractErrorMessage handle kar raha hai messages
     * Yahan catch lagane se error swallow ho jaata hai
     * Seedha await karo aur throw hone do
     */
    const response = await api.post("/api/auth/register", {
        username,
        email,
        password
    })
    return response.data
}


export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email,
        password
    })
    return response.data
}


export async function logout() {
    // ✅ LESSON 103: GET se POST — security fix (route bhi fix kar chuke hain)
    const response = await api.post("/api/auth/logout")
    return response.data
}


export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}