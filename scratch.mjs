import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const apiKey = "AIzaSyCrm9aihDJ2diLWicuK7UrOrvLAgN7G5so";
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Initializing model gemma-4-26b-a4b-it...");
    const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" });
    
    console.log("Generating content...");
    const result = await model.generateContent("Hello, world!");
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("API Error Object:");
    console.error({
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
    });
  }
}

run();
