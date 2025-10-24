
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // Here we assume it's set in the environment.
  console.warn("Gemini API key not found. Summarization will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const summarizeWithGemini = async (data: any, context: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured. Please set the API_KEY environment variable.";
  }

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
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error summarizing data: ${error.message}`;
    }
    return "An unknown error occurred while summarizing data.";
  }
};
