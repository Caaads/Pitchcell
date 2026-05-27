import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

function getGeminiClient(keyIndex = 0): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKeys[keyIndex],
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

const PitchcellResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    problem: { type: Type.STRING },
    solution: { type: Type.STRING },
    targetUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
    features: { type: Type.ARRAY, items: { type: Type.STRING } },
    monetization: { type: Type.ARRAY, items: { type: Type.STRING } },
    feasibilityScore: { type: Type.INTEGER },
    executionDifficulty: { type: Type.STRING },
    opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
    skepticFeedback: { type: Type.STRING },
  },
  required: ["title", "problem", "solution", "targetUsers", "features", "monetization", "feasibilityScore", "executionDifficulty", "opportunities", "risks", "skepticFeedback"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { thoughts, isPremium } = req.body;
  if (!thoughts || typeof thoughts !== "string" || thoughts.trim() === "") {
    return res.status(400).json({ error: "Thoughts input cannot be empty." });
  }

  if (apiKeys.length === 0) {
    return res.status(500).json({ error: "No Gemini API keys configured." });
  }

  const modeText = isPremium ? "Premium Enhanced Depth" : "Standard Validation";
  const systemPrompt = `You are an elite startup co-founder, venture capitalist, and expert business analysts.
Your job is to analyze messy thoughts, random ideas, keywords, or raw problems and transform them into a comprehensive, highly-structured startup opportunity report.
Provide realistic, analytical, and actionable insights. Be direct, and avoid hollow marketing fluff. Make sure you complete your analysis according to the configured JSON schema.
Analysis Mode: ${modeText}`;
  const prompt = `Analyze the following messy thoughts and ideas: "${thoughts}".
Reflect on the problem, construct an elegant solution, map target users, features, sustainable revenue channels, feasibility, growth opportunities, risks, and a harsh skeptical co-founder critique.`;

  let lastError: any;
  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const ai = getGeminiClient(i);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: PitchcellResponseSchema,
          temperature: isPremium ? 0.85 : 0.70,
        },
      });

      if (!response.text) throw new Error("Empty response returned from the AI model.");
      return res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("limit");
      if (isQuotaError && i < apiKeys.length - 1) {
        console.warn(`API key ${i + 1} hit quota limit, switching to key ${i + 2}...`);
        continue;
      }
      break;
    }
  }

  console.error("Gemini Generation Error:", lastError);
  return res.status(500).json({
    error: lastError?.message || "An error occurred while generating startup opportunities.",
  });
}
