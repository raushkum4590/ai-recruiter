import { QUESTION_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  const { jobPosition, jobDescription, duration, type } = await req.json();

  const FINAL_PROMPT = QUESTION_PROMPT
    .replace("{jobPosition}", jobPosition)
    .replace("{jobDescription}", jobDescription)
    .replace("{duration}", duration)
    .replace("{type}", type);

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPEN_ROUTER_API_KEY,
    
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [
        { role: "user", content: FINAL_PROMPT },

      ],
     
      // Add additional parameters to provide more control
      temperature: 0.7,
      max_tokens: 1000,
      headers: {
        // You can also add the header here if the above doesn't work
        "data-prompt-training": "disable"
      }
    });

    // Parse the response to ensure it's in the expected format
    const message = completion.choices[0].message;
    
    // Try to parse the content as JSON if it's a string that looks like JSON
    let questions = [];
    if (message && message.content) {
      try {
        // Check if the content is JSON string
        if (typeof message.content === 'string' && 
            (message.content.trim().startsWith('[') || message.content.trim().startsWith('{'))) {
          questions = JSON.parse(message.content);
        } else {
          // Set the raw content as the response
          return NextResponse.json({ questions: [{ question: message.content }] });
        }
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        // Return the raw content if parsing fails
        return NextResponse.json({ questions: [{ question: message.content }] });
      }
    }
    
    return NextResponse.json({ questions });
  } catch (e) {
    console.log("API Error:", e);
    
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