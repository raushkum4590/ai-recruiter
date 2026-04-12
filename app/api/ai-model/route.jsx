import { QUESTION_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Retry helper with exponential backoff for rate limits
async function callWithRetry(fn, maxRetries = 3, baseDelay = 2000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('quota');
      
      if (isRateLimit && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // 2s, 4s, 8s
        console.log(`[API] Rate limited (429). Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

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
      // Skip headers, labels, meta-commentary, markdown, and model self-checks
      if (/^(#{1,3}\s|---|\*{2,}|Role:|Job |Interview |Goal:|Constraints?:|Target |Note:|Selection|Final |Must |Category|Self-Correction|Okay|Plain text|One per line|No preamble|Relevant to|No JSON|Question Categories)/i.test(line)) return false;
      // Skip lines that are just labels/markers/emojis
      if (/^(\*.*\*:?|✅|📝|🎯|Example format:?)$/i.test(line)) return false;
      // Skip lines ending with colons (section headers)
      if (/:\s*$/.test(line) && line.length < 80) return false;
      // Skip self-check lines like "Plain text? Yes." or "Constraint Check:* 5 questions? Yes."
      if (/\?\s*(Yes|No|Check|Done|Correct)[\.!\s]/i.test(line)) return false;
      // Skip lines that are pure commentary/meta
      if (/^(This is|I should|I will|I need|Let me|Here are|Below are|The following|Now |Since |Given |Based on |For a |A |Note:|Constraint)/i.test(line)) return false;
      // Must contain a question mark OR start with interview-style action verbs
      // But only if the question mark is at the end (actual question) not mid-sentence meta
      if (line.endsWith('?')) return true;
      if (line.includes('?') && !line.match(/\?\s*(Yes|No|and|or|\d)/i)) return true;
      if (/^(Tell|Describe|Explain|Walk|Share|Discuss)/i.test(line)) return true;
      return false;
    })
    .map(line => {
      return line
        .replace(/^\d+[\.\\)]\s*/, '')         // Remove "1. " or "1) "
        .replace(/^[-\*•]+\s*/, '')            // Remove all leading bullets/asterisks
        .replace(/^\*+\s*/, '')                // Remove remaining asterisks
        .replace(/^Question\s*\d*\s*(\([^)]*\))?\s*:?\s*\*{0,2}\s*/i, '')  // Remove "Question 1 (Category):**"
        .replace(/^\(?(Technical|Behavioral|Problem Solving|Experience|Leadership|Professionalism|Growth|Teamwork|Frontend|Backend|Full.?Stack|CSS|Styling)[^:)]*[\/\)]:?\s*\*?\s*/i, '')
        .replace(/^Draft\s*\d*\s*:?\s*\*?\s*/i, '') // Remove "Draft 1:*" etc.
        .replace(/^\([^)]{3,40}\):?\s*\*?\s*/i, '') // Catch-all: remove any "(Label):*" prefix
        .replace(/^["']|["']$/g, '')           // Remove surrounding quotes
        .replace(/\s*->.*$/, '')               // Remove trailing commentary
        .trim();
    })
    .filter(q => q.length > 20)
    // Deduplicate: remove questions that are near-identical (first 50 chars match)
    .filter((q, i, arr) => {
      const prefix = q.substring(0, 50).toLowerCase();
      return arr.findIndex(other => other.substring(0, 50).toLowerCase() === prefix) === i;
    });
  
  return questions.slice(0, maxQuestions);
}

// Models to try in order of preference - Using valid Google Generative AI models
const MODELS = ["gemma-4-31b-it"];

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
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[API] GEMINI_API_KEY not set, returning fallback");
      return NextResponse.json({ 
        questions: generateFallbackQuestions(jobPosition, jobDescription, duration, type),
        warning: "Generated using fallback questions - API key not configured"
      });
    }

    // Validate API key format
    if (apiKey.length < 20) {
      console.error("[API] GEMINI_API_KEY appears invalid (too short)");
      return NextResponse.json({
        questions: generateFallbackQuestions(jobPosition, jobDescription, duration, type),
        warning: "Generated using fallback questions - Invalid API key format",
        error: "API key validation failed"
      });
    }

    // Step 5: Call API with retry + model fallback
    let lastError = null;

    for (const modelName of MODELS) {
      try {
        console.log(`[API] Trying model: ${modelName}...`);
        
        const result = await callWithRetry(
          () => fetch('https://api.together.xyz/inference', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: modelName,
              prompt: FINAL_PROMPT,
              max_tokens: 2000,
              temperature: 0.7,
              top_p: 0.9,
              top_k: 40,
              repetition_penalty: 1.0
            })
          }).then(r => {
            if (!r.ok) throw new Error(`API Error: ${r.status} ${r.statusText}`);
            return r.json();
          }),
          3,  // max retries
          2000 // base delay 2s
        );
        
        const responseText = result.output?.result || result.output || '';
        console.log(`[API] ${modelName} responded, length: ${responseText?.length || 0}`);
        
        if (!responseText) {
          console.warn(`[API] ${modelName} returned empty response, trying next model...`);
          continue;
        }

        const questions = parseQuestions(responseText, targetQuestionCount);
        console.log(`[API] Parsed ${questions.length} questions from ${modelName} (target: ${targetQuestionCount})`);
        
        if (questions.length === 0) {
          console.warn(`[API] No valid questions parsed from ${modelName}, trying next model...`);
          continue;
        }
        
        return NextResponse.json({ questions, model: modelName });
      } catch (error) {
        const errorMsg = error?.message || "Unknown error";
        console.error(`[API] ${modelName} failed:`, errorMsg.substring(0, 200));
        
        // Log more details for debugging
        if (error?.status) console.error(`[API] Status: ${error.status}`);
        if (error?.code) console.error(`[API] Code: ${error.code}`);
        
        lastError = error;
        // Continue to next model
      }
    }

    // All models failed — return fallback
    console.error("[API] All models failed. Last error:", lastError?.message);
    console.error("[API] Last error details:", {
      status: lastError?.status,
      code: lastError?.code,
      message: lastError?.message,
      fullMessage: lastError?.toString()
    });
    return NextResponse.json({
      questions: generateFallbackQuestions(jobPosition, jobDescription, duration, type),
      warning: "Generated using fallback questions due to API error",
      originalError: lastError?.message || "All models failed",
      debug: {
        modelsAttempted: MODELS,
        errorDetails: lastError?.message?.substring(0, 500)
      }
    });

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