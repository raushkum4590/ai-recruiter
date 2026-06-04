import { FEEDBACK_PROMPT } from "@/services/constants";
import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const dynamic = 'force-dynamic';

const MODEL_NAME = "llama-3.3-70b-versatile";

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: true, message: "Groq API key not configured" },
        { status: 500 }
      );
    }

    try {
      console.log(`[Feedback API] Calling Groq model: ${MODEL_NAME}...`);

      const llm = new ChatGroq({
        apiKey,
        model: MODEL_NAME,
        temperature: 0.5,
        maxTokens: 2000,
      });

      let rawContent;
      let lastApiError;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const aiResponse = await llm.invoke([
            new SystemMessage(
              "You are an expert interview evaluator. Analyze the interview conversation and provide structured feedback in JSON format."
            ),
            new HumanMessage(FINAL_PROMPT),
          ]);

          rawContent = aiResponse.content;

          if (!rawContent) {
            throw new Error("Empty response from Groq API");
          }

          break; // success
        } catch (retryError) {
          lastApiError = retryError;
          const isRateLimit =
            retryError?.message?.includes("429") ||
            retryError?.status === 429;

          if (isRateLimit && attempt < 2) {
            const delay = 3000 * Math.pow(2, attempt);
            console.log(`[Feedback API] Rate limited. Retry ${attempt + 1}/2 in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          if (attempt === 2) throw retryError;
        }
      }

      console.log(`[Feedback API] Groq responded, length: ${rawContent?.length || 0}`);

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
      console.error(`[Feedback API] Groq API error:`, apiError?.message?.substring(0, 300));
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
