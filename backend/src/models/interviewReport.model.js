const mongoose = require('mongoose')


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required." ],
        trim: true
    },
    intention: {
        type: String,
        required: [ true, "Intention is required." ],
        trim: true
    },
    answer: {
        type: String,
        required: [ true, "Answer is required." ],
        trim: true
    }
}, { _id: false })


const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Behavioral question is required." ],
        trim: true
    },
    intention: {
        type: String,
        required: [ true, "Intention is required." ],
        trim: true
    },
    answer: {
        type: String,
        required: [ true, "Answer is required." ],
        trim: true
    }
}, { _id: false })


const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required." ],
        trim: true
    },
    severity: {
        type: String,
        enum: {
            values: [ "low", "medium", "high" ],
            message: "Severity must be low, medium or high."  // ✅ Better error message
        },
        required: [ true, "Severity is required." ]
    }
}, { _id: false })


const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required." ],
        min: [ 1, "Day must be at least 1." ]
    },
    focus: {
        type: String,
        required: [ true, "Focus is required." ],
        trim: true
    },
    tasks: [ {
        type: String,
        required: [ true, "Task is required." ],
        trim: true
    } ]
}, { _id: false })  // ✅ LESSON 61: _id: false — ye sub-documents hain
                    // Inhe alag se ID ki zaroorat nahi
                    // Storage bachta hai


const interviewReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required." ]  // ✅ Required add kiya
    },
    title: {
        type: String,
        required: [ true, "Job title is required." ],
        trim: true
    },
    jobDescription: {
        type: String,
        required: [ true, "Job description is required." ],
        trim: true
    },
    resume: {
        type: String,
        required: [ true, "Resume is required." ]  // ✅ Required add kiya
    },
    selfDescription: {
        type: String,
        required: [ true, "Self description is required." ]  // ✅ Required add kiya
    },
    matchScore: {
        type: Number,
        min: [ 0, "Match score cannot be less than 0." ],
        max: [ 100, "Match score cannot be more than 100." ],
        required: [ true, "Match score is required." ]  // ✅ Required add kiya
    },
    technicalQuestions: {
        type: [ technicalQuestionSchema ],
        default: []
    },
    behavioralQuestions: {
        type: [ behavioralQuestionSchema ],
        default: []
    },
    skillGaps: {
        type: [ skillGapSchema ],
        default: []
    },
    preparationPlan: {
        type: [ preparationPlanSchema ],
        default: []
    }

}, {
    timestamps: true
})


/**
 * ✅ LESSON 62: Compound Index — user + createdAt
 * Hum hamesha ek user ke reports fetch karte hain sorted by date
 * Ye dono fields ek saath query hoti hain — compound index fast karta hai
 * find({ user: id }).sort({ createdAt: -1 }) — ye query ab bahut fast hogi
 */
interviewReportSchema.index({ user: 1, createdAt: -1 })


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)

module.exports = interviewReportModel