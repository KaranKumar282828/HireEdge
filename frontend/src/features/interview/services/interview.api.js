import axios from "axios"


// ✅ Environment variable se baseURL — auth.api.js jaisa
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
    timeout: 60000  // ✅ 60 seconds — AI call time leta hai, 15s kam hai
})


/**
 * ✅ Interceptor — auth.api.js jaisa
 * 401 pe auto redirect
 * Errors throw karo — useInterview ka extractErrorMessage handle karega
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login"
            }
        }

        // ✅ LESSON 131: Timeout error — user ko samajh aane wala message
        if (error.code === "ECONNABORTED") {
            error.message = "Request timed out. AI is taking too long, please try again."
        }

        return Promise.reject(error)
    }
)


/**
 * @description Generate interview report
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)

    // ✅ LESSON 132: resumeFile optional hai — append sirf tab karo jab ho
    // Bina check ke append karne se backend pe empty file jaati hai
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}


/**
 * @description Get interview report by interviewId
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)
    return response.data
}


/**
 * @description Get all interview reports of logged in user
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")
    return response.data
}


/**
 * @description Generate resume PDF
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null,
        { responseType: "blob" }
    )
    return response.data
}