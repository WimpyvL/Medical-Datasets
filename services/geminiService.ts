
import { GoogleGenAI } from "@google/genai";

// Prefer Vite env in browser, fall back to Node env if present
const API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_API_KEY) ||
  process?.env?.VITE_GOOGLE_API_KEY ||
  process?.env?.API_KEY;

export const summarizeWithGemini = async (data: any, context: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured. Please set VITE_GOOGLE_API_KEY in a .env file.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    You are an expert medical data analyst. Your task is to provide a concise, easy-to-digest summary of the provided data.
    
    Context: The data is from "${context}".
    
    Data:
    \`\`\`json
    ${JSON.stringify(data, null, 2)}
    \`\`\`
    
    Based on this data, provide a brief summary highlighting the most important insights.
    Format your response in clear, readable markdown.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return (response as any).text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error summarizing data: ${error.message}`;
    }
    return "An unknown error occurred while summarizing data.";
  }
};
