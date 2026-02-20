
import { GoogleGenAI, Type } from "@google/genai";
import { Tone, Language, GeneratedResponse, TextStyle, GhostingResponse, ConflictProfile, ConflictResolutionResponse } from "../types";

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

// --- PROMPT HELPERS ---

const getStyleInstructions = (style: TextStyle): string => {
  switch (style) {
    case TextStyle.SHORT:
      return `
      **STYLE: SHORT / TXT (Gen Z Casual)**
      - **Formatting:** Strictly lowercase. No periods at end of lines.
      - **Grammar:** Drop pronouns where possible ("Coming?" instead of "Are you coming?").
      - **Abbreviations:** Use 'u' (you), 'r' (are), 'rn' (right now), 'bc' (because), 'idk' (I don't know), 'tho' (though).
      - **Vibe:** Low effort, chill, busy, cool.
      - **Examples:**
        * "I am not sure about that." -> "idk bout that tho"
        * "Where are you?" -> "wya"
        * "That is actually really funny." -> "lol thats funny"
      `;
    case TextStyle.CUTE:
      return `
      **STYLE: CUTE / SOFT**
      - **Formatting:** Softer punctuation (~, ...). Lowercase or Sentence case.
      - **Spelling:** Elongate vowels for emphasis ("heyyy", "yesss", "pleaseee", "nooo").
      - **Vibe:** Warm, bubbly, affectionate, soft, approachable.
      - **Vocabulary:** Use words like 'literally', 'kinda', 'super'.
      - **Examples:**
        * "Okay, I will be there." -> "okieee coming rn!"
        * "I miss you." -> "miss u sm :("
        * "Can we go?" -> "can we go pleaseee?"
      `;
    case TextStyle.LONG:
      return `
      **STYLE: LONG / DEEP**
      - **Formatting:** Complete sentences. Proper capitalization and punctuation.
      - **Content:** Express full thoughts. engaging and articulate.
      - **Vibe:** Thoughtful, invested, intelligent, charming.
      - **Structure:** Use compound sentences to add flow.
      - **Examples:**
        * "It was good." -> "It was actually really good, I didn't expect to enjoy it that much tbh."
        * "What are you doing?" -> "Just caught up with some work, finally relaxing. How's your day going?"
      `;
    case TextStyle.STANDARD:
    default:
      return `
      **STYLE: STANDARD**
      - **Formatting:** Balanced. Optional capitalization (can be lowercase if casual).
      - **Grammar:** Standard casual English/Hinglish.
      - **Vibe:** Normal text messaging, not too stiff, not too slangy.
      - **Examples:**
        * "Where are you?" -> "Where you at?" or "Where are you?"
        * "That sounds fun." -> "That sounds actually fun."
      `;
  }
};

export const generateReplies = async (
  inputText: string,
  imageData: string | null,
  tone: Tone,
  language: Language,
  useEmojis: boolean,
  textStyle: TextStyle
): Promise<GeneratedResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Formatting instructions
  const emojiInstruction = useEmojis 
    ? "Requirement: Include 1-2 relevant emojis naturally per reply. Do not overuse." 
    : "Requirement: STRICTLY NO EMOJIS. Text only.";

  const styleGuide = getStyleInstructions(textStyle);

  // System instructions for SWAY persona
  const systemInstruction = `
You are SWAY, an AI dating assistant specifically for the Indian market.
Your goal is to help users reply confidently, respectfully, and naturally.

**Core Principles:**
1. **Indian Cultural Nuance:** Use natural Indian English or Hinglish used by urban youth (Delhi/Mumbai/Bangalore slang is acceptable if Tone is Casual/Playful).
2. **Respect & Safety:** No aggression, creepiness, or manipulation.
3. **Tone Enforcement:**
   - If tone is *Sarcastic*: Be witty, dry, slightly mean but funny.
   - If tone is *Flirty*: Be bold but calibrated.
   - If tone is *Polite*: Be formal but warm.

**STRICT FORMATTING RULES:**
1. ${emojiInstruction}
2. Apply the following Text Style rules RIGIDLY:
${styleGuide}

**Task:**
1. Analyze the input (Text or Image).
2. Identify the intent and context.
3. Generate exactly 3 reply options varying in boldness (Safe, Balanced, Bold).
4. Output strict JSON.
`;

  const prompt = `
User Context:
- Target Tone: ${tone}
- Language: ${language}
- Selected Style: ${textStyle}

Input Content:
${inputText ? `Text Message: "${inputText}"` : 'Image: See attached screenshot.'}

Output Format (JSON Only):
{
  "analysis": {
    "stage": "String (e.g., Talking Stage, Dating, Strangers)",
    "intent": "String (e.g., They are teasing you)",
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
      const modelId = "gemini-2.5-flash-latest"; 
      
      const mimeType = imageData.substring(imageData.indexOf(':') + 1, imageData.indexOf(';'));
      const base64Data = imageData.split(',')[1];

      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          {
            parts: [
              {
                text: systemInstruction + "\n" + prompt
              },
              {
                inlineData: {
                  mimeType: mimeType, 
                  data: base64Data 
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.85, 
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
          temperature: 0.85,
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

export const recoverFromGhosting = async (
  partnerGender: string,
  details: string,
  language: Language,
  textStyle: TextStyle,
  useEmojis: boolean
): Promise<GhostingResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-flash-preview";

  const emojiInstruction = useEmojis 
    ? "Include relevant emojis naturally." 
    : "STRICTLY NO EMOJIS.";

  const styleGuide = getStyleInstructions(textStyle);

  const systemInstruction = `
You are an expert dating psychologist and ghosting recovery specialist.
Your goal is to help the user re-engage a romantic interest who has stopped replying (ghosted).

**Strategy:**
You must generate 3 distinct types of text messages to break the silence:
1. **Low Pressure:** Casual, funny, or unrelated to the silence. Removes guilt.
2. **Curiosity Gap:** A message that compels them to ask "What?".
3. **Direct/Vulnerable:** Calling out the silence confidently but without anger.

**Context Configuration:**
- Language: ${language} (Ensure it sounds natural for Indian context)
- Emojis: ${emojiInstruction}

**STYLE ENFORCEMENT:**
Apply the following style rules to the recovery texts:
${styleGuide}

For each reply, estimate a "Recovery Chance" percentage (0-100%) based on psychological effectiveness for the given context.
`;

  const prompt = `
Context:
- Partner Gender: ${partnerGender}
- Situation Details: "${details}"

Task:
Generate 3 recovery texts.
Output Format (JSON Only):
{
  "analysis": "Brief analysis of why they might have ghosted based on details (max 20 words).",
  "replies": [
    { 
      "id": "1", 
      "text": "Message content", 
      "strategy": "Strategy Name (e.g., The Pattern Break)", 
      "recoveryChance": 85,
      "explanation": "Why this works"
    },
    ... (total 3)
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: systemInstruction + "\n" + prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      }
    });

    const cleanedJson = cleanJsonString(response.text || "");
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Ghosting API Error:", error);
    throw new Error("Failed to analyze ghosting situation.");
  }
};

export const resolveConflict = async (
  profile: ConflictProfile
): Promise<ConflictResolutionResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-flash-preview";

  const systemInstruction = `
You are SWAY's "Talk It Out" mode, an emotionally intelligent relationship-resolution AI trained for Indian couples.
Your goal is to help users de-escalate conflicts, communicate calmly, and suggest respectful replies.

**Core Principles:**
1. **Indian Context:** Value long-term harmony, respect, and emotional safety.
2. **Neutrality:** Do not assign blame. Focus on understanding.
3. **Safety:** If signs of abuse appear, suggest taking space.

**Tone:** Calm, mature, empathetic, grounding.

**Task:**
1. Analyze the conflict profile (identities, feelings, reason).
2. Provide a 1-2 line insight (non-blaming).
3. Give one clear immediate guidance instruction (e.g., "Reply now" or "Wait").
4. Generate 3 distinct reply options in **${profile.language}**:
   - **Soft Repair:** Focuses on understanding & calm.
   - **Balanced Honest:** Expresses feelings without blame using "I" statements.
   - **Boundary + Care:** Sets a limit but reassures the relationship.
5. Provide 2-3 practical non-text tips (e.g., "Take a walk").

**Formatting:**
- Output strict JSON.
`;

  const prompt = `
Conflict Profile:
- User: ${profile.userGender} (${profile.userFeeling})
- Partner: ${profile.partnerGender} (${profile.partnerFeeling})
- Relationship: ${profile.relationshipType}, ${profile.duration}
- Main Reason: ${profile.reason}
- Language: ${profile.language}
- User's Description/Chat: "${profile.description}"

Output Format (JSON Only):
{
  "insight": "Brief, neutral analysis of the situation (max 30 words).",
  "guidance": "Immediate advice (e.g., 'It is best to reply now while calm.')",
  "replies": [
    { 
      "id": "1", 
      "text": "Reply text...", 
      "type": "Soft Repair", 
      "whyItWorks": "Brief explanation" 
    },
    { 
      "id": "2", 
      "text": "Reply text...", 
      "type": "Balanced Honest", 
      "whyItWorks": "Brief explanation" 
    },
    { 
      "id": "3", 
      "text": "Reply text...", 
      "type": "Boundary + Care", 
      "whyItWorks": "Brief explanation" 
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: systemInstruction + "\n" + prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, // Lower temperature for calmer, more stable output
      }
    });

    const cleanedJson = cleanJsonString(response.text || "");
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Conflict Resolution API Error:", error);
    throw new Error("Failed to resolve conflict.");
  }
};
