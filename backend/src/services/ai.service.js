const Groq = require("groq-sdk")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const htmlPdf = require("html-pdf-node")  // ✅ Puppeteer ki jagah


if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in environment variables.")
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

const AI_MODEL = "llama-3.3-70b-versatile"
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


// ✅ Puppeteer hata diya — html-pdf-node use karo
async function generatePdfFromHtml(htmlContent) {
    const file = { content: htmlContent }
    const options = {
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        },
        printBackground: true
    }
    const pdfBuffer = await htmlPdf.generatePdf(file, options)
    return pdfBuffer
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `You are a professional ATS-optimized resume writer. Generate a clean, 1-page resume.

Resume Content: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return a JSON object with EXACTLY this structure:
{
    "html": "<complete HTML resume>"
}

STRICT REQUIREMENTS for the HTML resume:

DESIGN:
- Clean, minimal, professional design
- Single column layout — NO multi-column
- White background, black text
- Font: Arial or Helvetica, 10-11px body, 14px name
- Margins: 15mm all sides
- Must fit in exactly 1 page when printed

ATS RULES:
- NO tables, NO columns, NO text boxes
- NO images, NO icons, NO graphics
- NO headers/footers
- Standard section headings: SUMMARY, EDUCATION, EXPERIENCE, PROJECTS, SKILLS, ACHIEVEMENTS
- Plain bullet points using • character only

HTML STRUCTURE:
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10.5px; color: #000; padding: 15mm; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 2px; }
  .contact { text-align: center; font-size: 9.5px; margin-bottom: 8px; }
  .section { margin-bottom: 8px; }
  .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 4px; padding-bottom: 1px; letter-spacing: 0.5px; }
  .job-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10.5px; }
  .job-subtitle { font-style: italic; font-size: 10px; margin-bottom: 2px; }
  ul { padding-left: 12px; margin: 2px 0; }
  li { margin-bottom: 1px; line-height: 1.3; }
  .skills-row { margin-bottom: 2px; }
</style>
</head>
<body>
  <!-- Name -->
  <!-- Contact -->
  <!-- Summary -->
  <!-- Education -->
  <!-- Experience -->
  <!-- Projects -->
  <!-- Skills -->
  <!-- Achievements -->
</body>
</html>

CONTENT RULES:
- Use REAL data from Resume Content and Self Description
- Tailor content for the Job Description
- Quantify achievements where possible
- Keep bullet points concise — max 1.5 lines each
- Max 3-4 bullets per job/project
- Skills in single line per category
- Summary: 2 lines max

Return ONLY the JSON object, no other text.`

    const response = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,  // ✅ Lower temperature — more consistent output
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