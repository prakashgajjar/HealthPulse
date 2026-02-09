import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();

    console.log(message)

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use official model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // System + user prompt (Gemini best practice)
    const prompt = `
You are HealthPulse, a friendly and professional AI health assistant.

Rules:
- Calm, caring, professional tone
- Use max 1–2 light emojis
- Provide general health guidance only
- Do NOT diagnose diseases
- Do NOT prescribe medicines
- Encourage consulting a qualified doctor for serious symptoms
- Be clear, responsible, and supportive

User question:
${message}
`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;

    const reply = response.text();
    console.log(reply)

    return NextResponse.json({
      assistant: "HealthPulse",
      reply,
    });
  } catch (error) {
    console.error("Gemini HealthPulse Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
