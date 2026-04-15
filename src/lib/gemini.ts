import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Initialize the Gemini API client
// The API key is automatically injected by AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Ingredient {
  name: string;
  category: 'safe' | 'caution' | 'avoid';
  halalStatus: 'halal' | 'doubtful' | 'haram';
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  recommendation: string;
  safetyScore: number;
  halalScore: number;
  halalStatus: 'halal' | 'doubtful' | 'haram';
  ingredients: Ingredient[];
}

export async function analyzeLabel(base64Image: string, mimeType: string, language: 'en' | 'id' = 'en'): Promise<AnalysisResult> {
  const languagePrompt = language === 'id' ? "Respond entirely in Indonesian." : "Respond entirely in English.";
  
  const systemInstruction = `You are an expert food scientist and Halal auditor. 
Analyze the provided ingredient label image.
1. Identify all ingredients.
2. Categorize each: 'safe', 'caution', or 'avoid' (health-based).
3. Determine Halal status for each: 'halal', 'doubtful', or 'haram'.
4. Provide a 1-sentence product summary.
5. Provide a clear consumption recommendation.
Return ONLY a JSON object. ${languagePrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A brief summary of what this product is.",
            },
            recommendation: {
              type: Type.STRING,
              description: "Safety recommendation.",
            },
            safetyScore: {
              type: Type.NUMBER,
              description: "Score 0-100.",
            },
            halalScore: {
              type: Type.NUMBER,
              description: "Score 0-100.",
            },
            halalStatus: {
              type: Type.STRING,
              description: "'halal', 'doubtful', or 'haram'.",
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  halalStatus: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["name", "category", "halalStatus", "explanation"],
              },
            },
          },
          required: ["summary", "recommendation", "safetyScore", "halalScore", "halalStatus", "ingredients"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing label:", error);
    throw new Error("Failed to analyze the ingredient label. Please try again with a clearer image.");
  }
}
