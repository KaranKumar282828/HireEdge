const Groq = require("groq-sdk")
const { z } = require("zod")
const puppeteer = require("puppeteer")


if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in environment variables.")
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})


const AI_MODEL = "llama-3.3-70b-versatile"  // ✅ Best free model on Groq
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap")
    })).describe("List of skill gaps in the candidate's profile"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day")
    })).describe("A day-wise preparation plan for the candidate"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})


/**
 * ✅ Retry logic — temporary failures handle karo
 */
async function withRetry(fn, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            const isLastAttempt = attempt === retries
            const isRetryable = error.message?.includes("503") ||
                error.message?.includes("429") ||
                error.message?.includes("timeout")

            if (isLastAttempt || !isRetryable) throw error

            const delay = RETRY_DELAY_MS * attempt
            console.warn(`AI API attempt ${attempt} failed. Retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
}


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert interview coach. Generate a detailed interview report for a candidate.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return a JSON object with EXACTLY this structure:
{
    "matchScore": <number 0-100>,
    "title": "<job title>",
    "technicalQuestions": [
        {
            "question": "<question>",
            "intention": "<why interviewer asks this>",
            "answer": "<how to answer>"
        }
    ],
    "behavioralQuestions": [
        {
            "question": "<question>",
            "intention": "<why interviewer asks this>",
            "answer": "<how to answer>"
        }
    ],
    "skillGaps": [
        {
            "skill": "<skill name>",
            "severity": "<low|medium|high>"
        }
    ],
    "preparationPlan": [
        {
            "day": <number>,
            "focus": "<focus area>",
            "tasks": ["<task1>", "<task2>"]
        }
    ]
}

Return ONLY the JSON object, no other text.`


    const response = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            // ✅ Groq JSON mode — clean JSON response guarantee
            response_format: { type: "json_object" }
        })
    )

    let parsed
    try {
        parsed = JSON.parse(response.choices[0].message.content)
    } catch {
        throw new Error("AI returned invalid JSON response.")
    }

    const validated = interviewReportSchema.safeParse(parsed)
    if (!validated.success) {
        console.error("AI response validation failed:", validated.error.flatten())
        throw new Error("AI returned an unexpected response structure.")
    }

    return validated.data
}


async function generatePdfFromHtml(htmlContent) {
    let browser = null
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        })

        const page = await browser.newPage()
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 30000
        })

        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            },
            printBackground: true
        })

        return pdfBuffer

    } finally {
        if (browser) await browser.close()
    }
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `You are a professional resume writer. Generate an ATS-friendly HTML resume.

Resume Content: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return a JSON object with EXACTLY this structure:
{
    "html": "<complete HTML resume>"
}

Requirements for the HTML:
- Professional and clean design
- ATS friendly
- Tailored for the job description
- 1-2 pages when converted to PDF
- Use inline CSS only
- Do not sound AI generated

Return ONLY the JSON object, no other text.`

    const response = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        })
    )

    let parsed
    try {
        parsed = JSON.parse(response.choices[0].message.content)
    } catch {
        throw new Error("AI returned invalid JSON response for resume.")
    }

    if (!parsed.html) {
        throw new Error("AI returned an unexpected response structure for resume.")
    }

    const pdfBuffer = await generatePdfFromHtml(parsed.html)
    return pdfBuffer
}


module.exports = { generateInterviewReport, generateResumePdf }