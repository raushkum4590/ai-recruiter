import { FEEDBACK_PROMPT } from "@/services/constants";
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
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[Feedback API] Rate limited. Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

const MODELS = ["gemma-4-31b-it"];

export async function POST(req) {
  try {
    const { conversation } = await req.json();
    
    // Validate conversation data
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Invalid or empty conversation data"
        },
        { status: 400 }
      );
    }
    
    console.log(`Processing conversation with ${conversation.length} messages`);
    
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace('{{conversation}}', JSON.stringify(conversation));
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: true, message: "API key not configured" },
        { status: 500 }
      );
    }

    let lastError = null;

    for (const modelName of MODELS) {
      try {
        console.log(`[Feedback API] Trying model: ${modelName}...`);
        
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
          3,
          2000
        );
        
        const rawContent = result.output?.result || result.output || '';
        console.log(`[Feedback API] ${modelName} responded, length: ${rawContent?.length || 0}`);
        
        // Try to parse the content as JSON
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const feedbackData = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            feedback: feedbackData
          });
        } else {
          return NextResponse.json({
            success: false,
            rawContent: rawContent,
            message: "Response didn't contain valid JSON format"
          });
        }
      } catch (error) {
        console.error(`[Feedback API] ${modelName} failed:`, error?.message?.substring(0, 200));
        lastError = error;
        // Continue to next model
      }
    }

    // All models failed
    return NextResponse.json(
      { error: true, message: lastError?.message || "All models failed" },
      { status: 500 }
    );
  } catch (e) {
    console.error("API Error:", e);
    
    return NextResponse.json(
      { error: true, message: e.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

