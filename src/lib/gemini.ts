import { GoogleGenAI, Type } from "@google/genai";

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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        `Analyze this product ingredient label. Identify the ingredients. Categorize them into 'safe', 'caution', and 'avoid' based on general health guidelines for everyday consumption. Also evaluate the ingredients for Halal compliance based on Islamic dietary laws. Provide a brief summary of what this product actually is based on its ingredients, and a final recommendation. Return ONLY a JSON object. ${languagePrompt}`,
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A brief, plain-English summary of what this product is based on its ingredients.",
            },
            recommendation: {
              type: Type.STRING,
              description: "A clear recommendation on whether this product is generally safe for everyday consumption.",
            },
            safetyScore: {
              type: Type.NUMBER,
              description: "An overall safety score from 0 to 100, where 100 is perfectly safe/healthy and 0 is very unhealthy/dangerous.",
            },
            halalScore: {
              type: Type.NUMBER,
              description: "An overall Halal score from 0 to 100, where 100 is strictly Halal, and 0 is strictly Haram.",
            },
            halalStatus: {
              type: Type.STRING,
              description: "Must be exactly 'halal', 'doubtful', or 'haram'.",
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "The name of the ingredient.",
                  },
                  category: {
                    type: Type.STRING,
                    description: "Must be exactly 'safe', 'caution', or 'avoid'.",
                  },
                  halalStatus: {
                    type: Type.STRING,
                    description: "Must be exactly 'halal', 'doubtful', or 'haram'.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A short, simple explanation of what this ingredient is and why it received this category.",
                  },
                },
                required: ["name", "category", "halalStatus", "explanation"],
              },
              description: "List of identified ingredients and their analysis.",
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
