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

    const prompt = `You are an expert ATS resume writer. Create a STRICTLY 1-PAGE resume.

CANDIDATE DATA:
Resume/Experience: ${resume}
Self Description: ${selfDescription}  
Job Description: ${jobDescription}

OUTPUT: Return ONLY this JSON:
{ "html": "<full HTML here>" }

GENERATE THIS EXACT HTML STRUCTURE:
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: Arial, sans-serif; 
    font-size: 10px; 
    color: #000000; 
    padding: 12mm 15mm;
    line-height: 1.3;
  }
  .name { 
    font-size: 20px; 
    font-weight: bold; 
    text-align: center; 
    margin-bottom: 3px;
    letter-spacing: 1px;
  }
  .contact { 
    text-align: center; 
    font-size: 9px; 
    margin-bottom: 8px; 
    color: #000;
  }
  .section-title { 
    font-size: 10.5px; 
    font-weight: bold; 
    text-transform: uppercase;
    border-bottom: 1.5px solid #000; 
    margin-bottom: 4px;
    margin-top: 7px;
    padding-bottom: 1px;
    letter-spacing: 0.8px;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: bold;
    font-size: 10px;
    margin-bottom: 1px;
  }
  .entry-date {
    font-size: 9px;
    white-space: nowrap;
  }
  .entry-subtitle {
    font-style: italic;
    font-size: 9px;
    margin-bottom: 2px;
    color: #000;
  }
  ul {
    padding-left: 13px;
    margin: 2px 0;
  }
  li {
    margin-bottom: 1px;
    font-size: 9.5px;
    line-height: 1.3;
  }
  .skills-line {
    font-size: 9.5px;
    margin-bottom: 2px;
  }
  .skills-line b {
    font-weight: bold;
  }
</style>
</head>
<body>

<div class="name">CANDIDATE FULL NAME</div>
<div class="contact">City, State | Phone | Email | LinkedIn | GitHub</div>

<div class="section-title">Summary</div>
<p style="font-size:9.5px; line-height:1.3;">2 line professional summary tailored to job description</p>

<div class="section-title">Education</div>
<div class="entry-header">
  <span>University Name, Degree</span>
  <span class="entry-date">Year – Year</span>
</div>
<div class="entry-subtitle">Branch | GPA: X.XX / 10</div>

<div class="section-title">Experience</div>
<div class="entry-header">
  <span>Role — Company</span>
  <span class="entry-date">Month Year – Month Year</span>
</div>
<ul>
  <li>Achievement with metric</li>
  <li>Achievement with metric</li>
  <li>Achievement with metric</li>
</ul>

<div class="section-title">Projects</div>
<div class="entry-header">
  <span>Project Name — Tech Stack</span>
  <span class="entry-date">live-link.com</span>
</div>
<div class="entry-subtitle">github.com/username/repo</div>
<ul>
  <li>What you built and impact</li>
  <li>Technical achievement</li>
  <li>Deployment/scale detail</li>
</ul>

<div class="section-title">Technical Skills</div>
<div class="skills-line"><b>Languages:</b> list here</div>
<div class="skills-line"><b>Web Dev:</b> list here</div>
<div class="skills-line"><b>Tools:</b> list here</div>

<div class="section-title">Achievements</div>
<ul>
  <li>Achievement 1</li>
  <li>Achievement 2</li>
</ul>

</body>
</html>

STRICT RULES:
1. Replace ALL placeholder text with REAL candidate data
2. Include ALL projects from resume — especially recent ones
3. Tailor every bullet point for the job description
4. Keep bullets concise — max 15 words each
5. Max 3 bullets per section entry
6. Skills on single lines only
7. NO tables, NO images, NO icons
8. MUST fit in 1 page — be concise
9. Quantify achievements wherever possible
10. Return ONLY JSON — no explanation text`

    const response = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" },
            max_tokens: 4000
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