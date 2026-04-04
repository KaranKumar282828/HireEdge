const { Router } = require("express")
const rateLimit = require("express-rate-limit")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()


/**
 * ✅ LESSON 65: Login pe Rate Limiting — Brute Force Attack rokna
 * Bina limit ke koi bhi bot unlimited passwords try kar sakta hai
 * 5 attempts mein sahi password dhundh sakta hai
 * 15 minute mein sirf 10 attempts — brute force practically impossible
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                    // 10 attempts
    keyGenerator: (req) => req.body.email || req.ip,
    // ✅ LESSON 66: IP se nahi, email se track karo
    // Agar IP se track karo toh shared network (office, cafe) ke
    // saare users block ho jaate hain agar ek ne bahut try kiya
    // Email se track karo — sirf us account ke attempts count hon
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again after 15 minutes."
    }
})


/**
 * ✅ LESSON 67: Register pe bhi Rate Limiting
 * Bina limit ke koi bhi bot hazaron fake accounts bana sakta hai
 * Ye spam aur abuse rokta hai
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 5,                     // 1 hour mein sirf 5 accounts ek IP se
    keyGenerator: (req) => req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many accounts created from this IP. Please try again after an hour."
    }
})


/**
 * ✅ LESSON 68: get-me pe bhi limit lagao
 * Ye endpoint bar bar hit hota hai — frontend polling kare toh
 * DB pe load aa sakta hai
 */
const getMeLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1 minute
    max: 30,                // 30 requests per minute
    keyGenerator: (req) => req.user?.id || req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please slow down."
    },
    skip: (req) => !req.user
})


/**
 * ✅ LESSON 69: Logout HTTP method fix
 * Logout GET se nahi hona chahiye — POST hona chahiye
 * GET requests:
 * - Browser history mein save hoti hain
 * - Links se trigger ho sakti hain (CSRF attack)
 * - Accidentally prefetch ho sakti hain
 * POST se logout safe hai
 */


/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post(
    "/register",
    registerLimiter,        // ✅ Fake account spam rokna
    authController.registerUserController
)


/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public
 */
authRouter.post(
    "/login",
    loginLimiter,           // ✅ Brute force rokna
    authController.loginUserController
)


/**
 * @route POST /api/auth/logout
 * @description Clear token from cookie and blacklist it
 * @access Public
 * ✅ GET se POST kiya — security fix
 */
authRouter.post(
    "/logout",
    authController.logoutUserController
)


/**
 * @route GET /api/auth/get-me
 * @description Get current logged in user details
 * @access Private
 */
authRouter.get(
    "/get-me",
    authMiddleware.authUser,
    getMeLimiter,
    authController.getMeController
)


module.exports = authRouter