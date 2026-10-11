import { GoogleGenAI } from '@google/genai';

/**
 * Gemini AI Model Configuration
 * Model set to: gemini-2.5-flash
 */
export const GEMINI_MODEL = 'gemini-2.5-flash';

export interface GeminiConfig {
  model: string;
  apiKey?: string;
}

export const geminiConfig: GeminiConfig = {
  model: GEMINI_MODEL,
  apiKey:
    typeof process !== 'undefined' && process.env?.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY
      : (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
};

/**
 * Creates and initializes a GoogleGenAI client with gemini-2.5-flash
 */
export const createGeminiClient = (apiKey?: string) => {
  const key = apiKey || geminiConfig.apiKey || '';
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Helper to generate content using the configured gemini-2.5-flash model
 */
export const generateWithGemini = async (prompt: string, apiKey?: string) => {
  const ai = createGeminiClient(apiKey);
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return response.text;
};
