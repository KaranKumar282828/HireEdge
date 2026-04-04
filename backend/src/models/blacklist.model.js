const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "Token is required." ],
        /**
         * ✅ LESSON 63: Token pe index kyun?
         * Auth middleware mein hum har request pe
         * findOne({ token }) karte hain
         * Index ke bina ye bahut slow hoga
         * Jitne zyada logged out users — utna slow
         */
        index: true
    },
    /**
     * ✅ LESSON 64: expiresAt field — TTL Index
         * Blacklisted tokens hamesha ke liye save karte rehna galat hai
         * JWT 1 din mein expire hota hai — uske baad token
         * automatically useless ho jaata hai
         * TTL index MongoDB ko batata hai:
         * "Jab expiresAt time aa jaye toh document khud delete kar do"
         * Isse database ka size control mein rehta hai
     */
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // ✅ 1 din baad expire
    }

}, {
    timestamps: true
})


/**
 * ✅ TTL Index — expiresAt ke baad MongoDB khud document delete karega
 * expireAfterSeconds: 0 matlab — expiresAt time pe hi delete karo
 * Koi cron job ya manual cleanup ki zaroorat nahi
 */
blacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })


const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = tokenBlacklistModel