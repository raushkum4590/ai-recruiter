import { FEEDBACK_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MODEL_NAME = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

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
    
    console.log(`[Feedback API] Processing conversation with ${conversation.length} messages`);
    
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace('{{conversation}}', JSON.stringify(conversation));
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: true, message: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    try {
      console.log(`[Feedback API] Calling ${MODEL_NAME}...`);

      let rawContent;
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
                  content: "You are an expert interview evaluator. Analyze the interview conversation and provide structured feedback in JSON format."
                },
                {
                  role: "user",
                  content: FINAL_PROMPT
                }
              ],
              temperature: 0.5,
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const statusCode = response.status;
            
            if (statusCode === 429 && attempt < 2) {
              const delay = 3000 * Math.pow(2, attempt);
              console.log(`[Feedback API] Rate limited (429). Retry ${attempt + 1}/2 in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            throw new Error(`OpenRouter API error ${statusCode}: ${errorData?.error?.message || response.statusText}`);
          }

          const data = await response.json();
          rawContent = data.choices?.[0]?.message?.content;
          
          if (!rawContent) {
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

      console.log(`[Feedback API] OpenRouter responded, length: ${rawContent?.length || 0}`);

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

    } catch (apiError) {
      console.error(`[Feedback API] API error:`, apiError?.message?.substring(0, 300));
      return NextResponse.json(
        { error: true, message: apiError?.message || "API call failed" },
        { status: 500 }
      );
    }

  } catch (e) {
    console.error("[Feedback API] Error:", e);
    
    return NextResponse.json(
      { error: true, message: e.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
