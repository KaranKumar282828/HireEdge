const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [ true, "Username is required." ],
        unique: true,
        trim: true,         // ✅ LESSON 57: Auto whitespace remove karo
        minlength: [ 3, "Username must be at least 3 characters long." ],
        maxlength: [ 30, "Username must be at most 30 characters long." ]
    },

    email: {
        type: String,
        required: [ true, "Email is required." ],
        unique: true,
        trim: true,
        lowercase: true,    // ✅ LESSON 58: Email hamesha lowercase save karo
                            // "User@Gmail.com" aur "user@gmail.com" same hain
                            // Bina iske duplicate accounts ban sakte hain
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address."
        ]
    },

    password: {
        type: String,
        required: [ true, "Password is required." ],
        minlength: [ 8, "Password must be at least 8 characters long." ]
    }

}, {
    timestamps: true    // ✅ LESSON 59: createdAt, updatedAt auto add hoga
                        // Pata chalega kab user register hua
})


/**
 * ✅ LESSON 60: Indexes — Queries Fast Karo
 * username aur email pe hum findOne karte hain
 * Index ke bina MongoDB poora collection scan karta hai
 * Index ke saath direct jump karta hai — bahut fast
 * unique: true already index banata hai — explicitly likhna good practice hai
 */
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })


const userModel = mongoose.model("users", userSchema)

module.exports = userModel