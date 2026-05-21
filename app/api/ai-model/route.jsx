import { QUESTION_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getOpenRouterKey() {
  const fromEnv = process.env.OPENROUTER_API_KEY;
  console.log("[KEY] from process.env:", fromEnv ? `set (${fromEnv.length} chars)` : "undefined");
  if (fromEnv) return fromEnv;
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    console.log("[KEY] reading file:", envPath);
    const content = fs.readFileSync(envPath, "utf8");
    console.log("[KEY] file lines:", content.split(/\r?\n/).length);
    for (const line of content.split(/\r?\n/)) {
      if (line.startsWith("OPENROUTER_API_KEY=")) {
        const val = line.slice("OPENROUTER_API_KEY=".length).trim();
        console.log("[KEY] found in file:", val ? `set (${val.length} chars)` : "empty");
        return val || null;
      }
    }
    console.log("[KEY] key not found in file");
  } catch (e) {
    console.log("[KEY] file read error:", e.message);
  }
  return null;
}

export const dynamic = 'force-dynamic';

// Fallback question generation based on job type and duration
const generateFallbackQuestions = (jobPosition, jobDescription, duration, type) => {
  const durationNum = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  const numQuestions = Math.min(Math.max(Math.floor(durationNum / 5), 3), 10);
  
  const fallbackQuestions = [
    `Tell me about your background and experience relevant to the ${jobPosition} role.`,
    `What specific skills and technologies mentioned in this job description are you most proficient in?`,
    `Describe a challenging project you worked on. What was your approach and what was the outcome?`,
    `How do you stay updated with the latest trends and developments in your field?`,
    `Walk me through how you would approach a typical day in this ${jobPosition} position.`,
    `What interests you most about this opportunity and our company?`,
    `Describe a time when you had to learn a new technology or skill quickly. How did you approach it?`,
    `How do you handle working under pressure and tight deadlines?`,
    `What's your approach to collaborating with team members and stakeholders?`,
    `Where do you see your career progressing in the next 2-3 years?`,
  ];
  
  return fallbackQuestions.slice(0, numQuestions);
};

// Parse AI response into clean question list
function parseQuestions(responseText, maxQuestions = 10) {
  if (!responseText) return [];
  
  const questions = responseText
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (line.length < 20) return false;
      if (/^(#{1,3}\s|---|\*{2,}|Role:|Job |Interview |Goal:|Constraints?:|Target |Note:|Selection|Final |Must |Category|Self-Correction|Okay|Plain text|One per line|No preamble|Relevant to|No JSON|Question Categories)/i.test(line)) return false;
      if (/^(\*.*\*:?|✅|📝|🎯|Example format:?)$/i.test(line)) return false;
      if (/:\s*$/.test(line) && line.length < 80) return false;
      if (/\?\s*(Yes|No|Check|Done|Correct)[\.!\s]/i.test(line)) return false;
      if (/^(This is|I should|I will|I need|Let me|Here are|Below are|The following|Now |Since |Given |Based on |For a |A |Note:|Constraint)/i.test(line)) return false;
      if (line.endsWith('?')) return true;
      if (line.includes('?') && !line.match(/\?\s*(Yes|No|and|or|\d)/i)) return true;
      if (/^(Tell|Describe|Explain|Walk|Share|Discuss)/i.test(line)) return true;
      return false;
    })
    .map(line => {
      return line
        .replace(/^\d+[\\.\\)]\s*/, '')
        .replace(/^[-\*•]+\s*/, '')
        .replace(/^\*+\s*/, '')
        .replace(/^Question\s*\d*\s*(\([^)]*\))?\s*:?\s*\*{0,2}\s*/i, '')
        .replace(/^\(?(Technical|Behavioral|Problem Solving|Experience|Leadership|Professionalism|Growth|Teamwork|Frontend|Backend|Full.?Stack|CSS|Styling)[^:)]*[\/\)]:?\s*\*?\s*/i, '')
        .replace(/^Draft\s*\d*\s*:?\s*\*?\s*/i, '')
        .replace(/^\([^)]{3,40}\):?\s*\*?\s*/i, '')
        .replace(/^["']|["']$/g, '')
        .replace(/\s*->.*$/, '')
        .trim();
    })
    .filter(q => q.length > 20)
    .filter((q, i, arr) => {
      const prefix = q.substring(0, 50).toLowerCase();
      return arr.findIndex(other => other.substring(0, 50).toLowerCase() === prefix) === i;
    });
  
  return questions.slice(0, maxQuestions);
}

const MODEL_NAME = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

export async function POST(req) {
  let body;
  
  try {
    // Step 1: Parse request body
    try {
      body = await req.json();
      if (!body) {
        return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
      }
    } catch (parseError) {
      console.error("[API] Failed to parse request JSON:", parseError.message);
      return NextResponse.json(
        { error: "Invalid request body", details: parseError.message },
        { status: 400 }
      );
    }

    // Step 2: Extract and validate inputs
    const { jobPosition, jobDescription, duration, type } = body || {};
    console.log("[API] Request:", { jobPosition, jobDescription, duration, type });

    if (!jobPosition || typeof jobPosition !== 'string' || jobPosition.trim() === '') {
      return NextResponse.json({ error: "Invalid jobPosition - must be a non-empty string" }, { status: 400 });
    }
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
      return NextResponse.json({ error: "Invalid jobDescription - must be a non-empty string" }, { status: 400 });
    }
    if (!duration) {
      return NextResponse.json({ error: "Duration is required" }, { status: 400 });
    }
    if (!type || typeof type !== 'string' || type.trim() === '') {
      return NextResponse.json({ error: "Invalid type - must be a non-empty string" }, { status: 400 });
    }

    // Step 3: Generate prompt
    const durationNum = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    const targetQuestionCount = Math.min(Math.max(Math.floor(durationNum / 2), 3), 10);
    
    const FINAL_PROMPT = QUESTION_PROMPT
      .replace(/\{jobPosition\}/g, jobPosition)
      .replace(/\{jobDescription\}/g, jobDescription)
      .replace(/\{duration\}/g, String(duration))
      .replace(/\{type\}/g, type) + 
      `\n\nCRITICAL INSTRUCTIONS:\n- Generate exactly ${targetQuestionCount} questions\n- Output ONLY the questions, one per line\n- Do NOT include any thinking, analysis, categories, labels, prefixes, or commentary\n- Do NOT number the questions\n- Start your response directly with the first question`;
    
    console.log("[API] Prompt generated successfully");

    // Step 4: Check API key
    const apiKey = getOpenRouterKey();
    if (!apiKey) {
      console.warn("[API] OPENROUTER_API_KEY not set, returning fallback");
      return NextResponse.json({ 
        questions: generateFallbackQuestions(jobPosition, jobDescription, duration, type),
        warning: "Generated using fallback questions - API key not configured"
      });
    }

    // Step 5: Call OpenRouter API
    try {
      console.log(`[API] Calling ${MODEL_NAME}...`);

      let responseText;
      let lastApiError;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "AI Recruiter",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL_NAME,
              messages: [
                {
                  role: "system",
                  content: "You are an expert interviewer. Generate interview questions exactly as instructed. Output ONLY the questions, one per line. No numbering, no labels, no commentary."
                },
                {
                  role: "user",
                  content: FINAL_PROMPT
                }
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const statusCode = response.status;
            
            if (statusCode === 429 && attempt < 2) {
              const delay = 3000 * Math.pow(2, attempt);
              console.log(`[API] Rate limited (429). Retry ${attempt + 1}/2 in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            throw new Error(`OpenRouter API error ${statusCode}: ${errorData?.error?.message || response.statusText}`);
          }

          const data = await response.json();
          responseText = data.choices?.[0]?.message?.content;
          
          if (!responseText) {
            throw new Error("Empty response from API");
          }
          
          break; // success
        } catch (retryError) {
          lastApiError = retryError;
          if (attempt === 2) {
            throw retryError;
          }
        }
      }

      console.log(`[API] OpenRouter responded, length: ${responseText?.length || 0}`);

      const questions = parseQuestions(responseText, targetQuestionCount);
      console.log(`[API] Parsed ${questions.length} questions (target: ${targetQuestionCount})`);

      if (questions.length === 0) {
        console.warn("[API] No valid questions parsed, using fallback");
        return NextResponse.json({
          questions: generateFallbackQuestions(jobPosition, jobDescription, duration, type),
          warning: "Could not parse AI response - using fallback questions"
        });
      }

      return NextResponse.json({ questions, model: MODEL_NAME });

    } catch (apiError) {
      console.error("[API] API error:", apiError?.message?.substring(0, 300));
      return NextResponse.json({
        questions: generateFallbackQuestions(jobPosition, jobDescription, duration, type),
        warning: "OpenRouter API error - using fallback questions",
        originalError: apiError?.message || "API call failed"
      });
    }

  } catch (e) {
    console.error("[API] FATAL ERROR:", e?.message);
    
    return NextResponse.json({
      questions: generateFallbackQuestions(
        body?.jobPosition || "this",
        body?.jobDescription || "",
        body?.duration || 30,
        body?.type || "General"
      ),
      warning: "Fatal error occurred - using fallback questions",
      error: e?.message
    });
  }
}