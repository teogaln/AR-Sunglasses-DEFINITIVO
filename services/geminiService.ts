import { GoogleGenAI } from "@google/genai";

export const tryOnSunglasses = async (
  imageBase64: string,
  stylePrompt: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Missing API configuration. Please ensure the API_KEY environment variable is set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Ensure data is strictly the base64 string
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const prompt = `You are a world-class luxury eyewear fashion AI. 
  Your task is to photorealistically add a pair of ${stylePrompt} onto the face in this image.
  
  Requirements:
  1. Detect the eyes and nose bridge accurately.
  2. Place the frames precisely as if worn naturally.
  3. MATCH LIGHTING: The sunglasses must have reflections and shadows consistent with the ambient light in the original photo.
  4. PRESERVE IDENTITY: Do not alter the person's face, skin, or hair. 
  5. QUALITY: The final output should look like a professional studio portrait.
  6. MODALITY: Return ONLY the modified image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
    });

    // `@google/genai` types can be strict; use `any` to avoid build failures when the response varies.
    const respAny = response as any;
    const candidates = respAny?.candidates as any[] | undefined;
    const firstCandidate = candidates?.[0] as any;
    const parts = (firstCandidate?.content as any)?.parts as any[] | undefined;
    const safeParts = parts ?? [];

    for (const part of safeParts) {
      const data = (part as any)?.inlineData?.data;
      if (data) {
        return `data:image/png;base64,${data}`;
      }
    }

    throw new Error("Unexpected response format from AI. Please try again.");
  } catch (error: any) {
    console.error("Gemini AI Processing Error:", error);
    
    // Friendly error messages for common issues
    if (error.message?.includes("429")) {
      throw new Error("Too many requests. Please wait a moment before trying again.");
    }
    if (error.message?.includes("403")) {
      throw new Error("Invalid API Key. Please check your credentials.");
    }
    
    throw new Error(error.message || "The AI couldn't fit the glasses. Ensure your face is clearly visible.");
  }
};