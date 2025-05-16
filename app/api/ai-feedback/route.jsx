import { FEEDBACK_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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
    
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPEN_ROUTER_API_KEY,
    });
    
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [
        { role: "user", content: FINAL_PROMPT },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000",
        "X-Title": "AI Recruiter App",
        "data-prompt-training": "disable"
      }
    });
    
    // Get the raw content from the response
    const rawContent = completion.choices[0].message.content;
    
    // Try to parse the content as JSON
    try {
      // Find JSON content - sometimes models wrap JSON in code blocks or explanatory text
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedbackData = JSON.parse(jsonMatch[0]);
        
        return NextResponse.json({
          success: true,
          feedback: feedbackData
        });
      } else {
        // If we can't find a JSON pattern, return the raw content for client-side processing
        return NextResponse.json({
          success: false,
          rawContent: rawContent,
          message: "Response didn't contain valid JSON format"
        });
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      return NextResponse.json({
        success: false,
        rawContent: rawContent,
        message: "Failed to parse AI response as JSON",
        error: parseError.message
      }, { status: 200 }); // Still return 200 so client can try to parse
    }
  } catch (e) {
    console.error("API Error:", e);
    
    // Add specific error handling for OpenRouter data policy errors
    if (e.status === 404 && e.error?.message?.includes("data policy")) {
      return NextResponse.json(
        {
          error: true,
          message: "OpenRouter data policy error. Please configure your OpenRouter settings.",
          details: e.error?.message,
          solution: "Go to https://openrouter.ai/settings/privacy and adjust your data privacy settings or add the proper headers to your API requests."
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: true, message: e.message || "Something went wrong" },
      { status: 500 }
    );
  }
}