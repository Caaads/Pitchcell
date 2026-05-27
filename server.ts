import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Load all available API keys
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

if (apiKeys.length === 0) {
  throw new Error("No GEMINI_API_KEY defined. Please add at least GEMINI_API_KEY_1 to your .env.local.");
}

function getGeminiClient(keyIndex = 0): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKeys[keyIndex],
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

// REST API for checking health / status
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// JSON schema for the structured startup opportunity analysis
const PitchcellResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A catchy, short (2-3 words), and highly relevant start-up title or brand name."
    },
    problem: {
      type: Type.STRING,
      description: "A precise, clear problem statement explaining the core pain point or market gap."
    },
    solution: {
      type: Type.STRING,
      description: "The proposed startup solution and how it directly resolves the core problem statement."
    },
    targetUsers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 distinct, highly relevant target user segments."
    },
    features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 core initial MVP features for the startup."
    },
    monetization: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 sustainable monetization channels or pricing structures."
    },
    feasibilityScore: {
      type: Type.INTEGER,
      description: "A feasibility and viability score for the idea from 1 (nearly impossible) to 10 (highly achievable)."
    },
    executionDifficulty: {
      type: Type.STRING,
      description: "The building difficulty rate: Low, Medium, or High."
    },
    opportunities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 unique key expansion opportunities or compounding advantages."
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 major risks, competitive threats, or adoption bottlenecks."
    },
    skepticFeedback: {
      type: Type.STRING,
      description: "AI Skeptic Mode: A constructive, direct, and slightly cynical explanation of why this business might fail and how to avoid it."
    }
  },
  required: [
    "title",
    "problem",
    "solution",
    "targetUsers",
    "features",
    "monetization",
    "feasibilityScore",
    "executionDifficulty",
    "opportunities",
    "risks",
    "skepticFeedback"
  ]
};

// Start generation route
app.post("/api/generate", async (req, res): Promise<any> => {
  const { thoughts, isPremium } = req.body;

  if (!thoughts || typeof thoughts !== "string" || thoughts.trim() === "") {
    return res.status(400).json({ error: "Thoughts input cannot be empty." });
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
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pitchcell backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
