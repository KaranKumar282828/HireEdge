const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


async function authUser(req, res, next) {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Please login to continue."
            })
        }

        /**
         * ✅ LESSON 55: JWT pehle verify karo, phir DB hit karo
         * Abhi pehle DB mein blacklist check hota tha
         * Agar token hi invalid hai toh DB query waste hai
         * Pehle JWT verify karo — fast aur free hai
         * Phir blacklist check karo
         */
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            // ✅ LESSON 56: JWT error types alag alag handle karo
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Session expired. Please login again."
                })
            }
            return res.status(401).json({
                message: "Invalid token. Please login again."
            })
        }

        // ✅ JWT valid hai — ab blacklist check karo
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token }).lean()

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Session expired. Please login again."
            })
        }

        req.user = decoded
        next()

    } catch (error) {
        console.error("authUser Middleware Error:", error)
        return res.status(500).json({
            message: "Authentication failed. Please try again.",
            ...(process.env.NODE_ENV === "development" && { error: error.message })
        })
    }
}


module.exports = { authUser }