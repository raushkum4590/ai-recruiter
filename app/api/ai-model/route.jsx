import { QUESTION_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Fallback question generation based on job type and duration
const generateFallbackQuestions = (jobPosition, jobDescription, duration, type) => {
  // Convert duration to number if it's a string
  const durationNum = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  
  const questionTypes = ['Technical', 'Behavioral', 'Problem Solving', 'Experience'];
  const numQuestions = Math.min(Math.max(Math.floor(durationNum / 5), 3), 10); // 3-10 questions based on duration
  
  const fallbackQuestions = [
    {
      question: `Tell me about your background and experience relevant to the ${jobPosition} role.`,
      type: 'Behavioral'
    },
    {
      question: `What specific skills and technologies mentioned in this job description are you most proficient in?`,
      type: 'Technical'
    },
    {
      question: `Describe a challenging project you worked on. What was your approach and what was the outcome?`,
      type: 'Problem Solving'
    },
    {
      question: `How do you stay updated with the latest trends and developments in your field?`,
      type: 'Experience'
    },
    {
      question: `Walk me through how you would approach a typical day in this ${jobPosition} position.`,
      type: 'Behavioral'
    },
    {
      question: `What interests you most about this opportunity and our company?`,
      type: 'Behavioral'
    },
    {
      question: `Describe a time when you had to learn a new technology or skill quickly. How did you approach it?`,
      type: 'Experience'
    },
    {
      question: `How do you handle working under pressure and tight deadlines?`,
      type: 'Behavioral'
    },
    {
      question: `What's your approach to collaborating with team members and stakeholders?`,
      type: 'Behavioral'
    },
    {
      question: `Where do you see your career progressing in the next 2-3 years?`,
      type: 'Experience'
    }
  ];
  
  return fallbackQuestions.slice(0, numQuestions);
};

export async function POST(req) {
  let body;
  
  try {
    // Step 1: Parse request body
    try {
      body = await req.json();
      if (!body) {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
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
    console.log("[API] Extracted body:", { jobPosition, jobDescription, duration, type });

    // Validate inputs
    if (!jobPosition || typeof jobPosition !== 'string' || jobPosition.trim() === '') {
      console.warn("[API] Invalid jobPosition");
      return NextResponse.json(
        { error: "Invalid jobPosition - must be a non-empty string" },
        { status: 400 }
      );
    }
    
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
      console.warn("[API] Invalid jobDescription");
      return NextResponse.json(
        { error: "Invalid jobDescription - must be a non-empty string" },
        { status: 400 }
      );
    }
    
    if (!duration) {
      console.warn("[API] Missing duration");
      return NextResponse.json(
        { error: "Duration is required" },
        { status: 400 }
      );
    }
    
    if (!type || typeof type !== 'string' || type.trim() === '') {
      console.warn("[API] Invalid type");
      return NextResponse.json(
        { error: "Invalid type - must be a non-empty string" },
        { status: 400 }
      );
    }
    
    console.log("[API] Validation passed:", { jobPosition, jobDescription, duration, type });

    // Step 3: Generate prompt
    let FINAL_PROMPT;
    try {
      FINAL_PROMPT = QUESTION_PROMPT
        .replace(/\{jobPosition\}/g, jobPosition)
        .replace(/\{jobDescription\}/g, jobDescription)
        .replace(/\{duration\}/g, String(duration))
        .replace(/\{type\}/g, type);
      console.log("[API] Prompt generated successfully");
    } catch (promptError) {
      console.error("[API] Failed to generate prompt:", promptError);
      throw new Error(`Prompt generation failed: ${promptError.message}`);
    }

    // Step 4: Check API key
    if (!process.env.OPEN_ROUTER_API_KEY) {
      console.warn("[API] OPEN_ROUTER_API_KEY not set, returning fallback");
      try {
        const fallbackQuestions = generateFallbackQuestions(jobPosition, jobDescription, duration, type);
        return NextResponse.json({ 
          questions: fallbackQuestions.map(q => q.question),
          warning: "Generated using fallback questions - API key not configured"
        });
      } catch (fallbackError) {
        console.error("[API] Fallback generation failed:", fallbackError);
        return NextResponse.json(
          { error: "Question generation failed", details: fallbackError.message },
          { status: 500 }
        );
      }
    }

    // Step 5: Call OpenRouter API
    try {
      console.log("[API] Calling OpenRouter API...");
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPEN_ROUTER_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          { 
            role: "system", 
            content: "You are an expert interview designer who creates engaging, modern interview questions. Always respond with plain text questions, one per line, without any JSON formatting, numbers, or special characters." 
          },
          { role: "user", content: FINAL_PROMPT },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        headers: {
          "data-prompt-training": "disable"
        }
      });
      
      console.log("[API] OpenRouter API call successful");

      // Parse the response - now expecting plain text format
      if (!completion?.choices?.[0]?.message?.content) {
        throw new Error("Invalid response from OpenRouter API - no content");
      }

      const message = completion.choices[0].message;
      console.log("[API] AI Response received, length:", message.content.length);
      
      let questions = [];
      if (message && message.content) {
        // Split the content by lines and filter out empty lines
        questions = message.content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && !line.startsWith('Question') && !line.startsWith('#')) // Filter out headers and short lines
          .map(line => {
            // Remove any numbering or bullet points
            return line
              .replace(/^\d+[\.\)]\s*/, '') // Remove "1. " or "1) "
              .replace(/^[-\*•]\s*/, '') // Remove "- ", "* ", or "• "
              .replace(/^Question\s*\d*\s*:?\s*/i, '') // Remove "Question 1:" etc.
              .trim();
          })
          .filter(question => question.length > 0); // Filter out empty questions after cleaning
        
        console.log("[API] Parsed questions count:", questions.length);
      }
      
      // Ensure we have at least some questions - convert fallback to plain text
      if (questions.length === 0) {
        console.log("[API] No questions from API, using fallback");
        const fallbackQuestions = generateFallbackQuestions(jobPosition, jobDescription, duration, type);
        questions = fallbackQuestions.map(q => q.question);
      }
      
      console.log("[API] Returning", questions.length, "questions");
      return NextResponse.json({ questions });
    } catch (apiError) {
      console.error("[API] OpenRouter API Error:", {
        message: apiError?.message,
        status: apiError?.status,
        type: apiError?.type
      });
      
      // For any API errors, return fallback questions instead of failing completely
      console.log("[API] Returning fallback due to API error");
      try {
        const fallbackQuestions = generateFallbackQuestions(jobPosition, jobDescription, duration, type);
        return NextResponse.json({ 
          questions: fallbackQuestions.map(q => q.question),
          warning: "Generated using fallback questions due to API issue",
          originalError: apiError?.message 
        });
      } catch (fallbackError) {
        console.error("[API] Fallback also failed:", fallbackError);
        throw fallbackError;
      }
    }
  } catch (e) {
    console.error("[API] FATAL ERROR:", {
      message: e?.message,
      stack: e?.stack,
      type: e?.constructor?.name
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: e?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}