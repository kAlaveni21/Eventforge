import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export const getGeminiAI = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY is not defined in environment.');
    return null;
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiInstance;
};
