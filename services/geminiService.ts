import { GoogleGenAI, Type } from "@google/genai";
import { Tone, Language, GeneratedResponse } from "../types";

// Helper to clean JSON string if it contains markdown code blocks
const cleanJsonString = (str: string): string => {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned;
};

export const generateReplies = async (
  inputText: string,
  imageData: string | null,
  tone: Tone,
  language: Language
): Promise<GeneratedResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // System instructions for SWAY persona
  const systemInstruction = `
You are SWAY, an AI dating assistant specifically for the Indian market.
Your goal is to help users reply confidently, respectfully, and naturally.

**Core Principles:**
1. **Indian Cultural Nuance:** Use natural Indian English or Hinglish used by urban youth. Avoid unnatural Western slang.
2. **Respect & Safety:** No aggression, creepiness, or manipulation. If the input is toxic, advise the user to disengage politely.
3. **Tone System:**
   - Polite: Soft, safe, formal.
   - Friendly: Warm, open, using conversational fillers (arre, yaar, etc. if Hinglish).
   - Confident: Assertive, direct, attractive.
   - Playful: Light teasing, wholesome humor.

**Task:**
1. If an image is provided, OCR the text and identify the last received message from the partner. Ignore UI noise (timestamps, names).
2. If text is provided, treat it as the last message received.
3. Analyze the conversation stage (First message, Ongoing, Reconnect) and intent (Friendly, Flirty, Dry).
4. Generate exactly 3 reply options varying in boldness (Safe, Balanced, Bold).
5. Output strict JSON.
`;

  const prompt = `
User Context:
- Tone: ${tone}
- Language: ${language}

Input Content:
${inputText ? `Text Message: "${inputText}"` : 'Image: See attached screenshot.'}

Output Format (JSON Only):
{
  "analysis": {
    "stage": "String (e.g., First Date, Ghosted)",
    "intent": "String (e.g., Flirty, Neutral)",
    "advice": "Short strategic advice (max 15 words)"
  },
  "replies": [
    { "id": "1", "text": "Reply text here", "style": "Safe" },
    { "id": "2", "text": "Reply text here", "style": "Balanced" },
    { "id": "3", "text": "Reply text here", "style": "Bold" }
  ]
}
`;

  try {
    let responseText = "";

    if (imageData) {
      // Use Vision Model for Screenshot analysis
      const modelId = "gemini-2.5-flash-image"; 
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            {
              text: systemInstruction + "\n" + prompt
            },
            {
              inlineData: {
                mimeType: "image/png", // Assuming PNG/JPEG, API handles generic image types well
                data: imageData.split(',')[1] // Remove data:image/xxx;base64, prefix
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      responseText = response.text || "";

    } else {
      // Text-only model
      const modelId = "gemini-3-flash-preview"; 
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: systemInstruction + "\n" + prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      responseText = response.text || "";
    }

    const cleanedJson = cleanJsonString(responseText);
    const parsed: GeneratedResponse = JSON.parse(cleanedJson);
    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate replies. Please try again.");
  }
};