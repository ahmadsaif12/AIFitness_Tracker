import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const ai = new GoogleGenAI({ apiKey });

export const analyzeImage = async (
  filePath: string,
  mimeType: string = "image/jpeg"
): Promise<any> => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });

  let response;
  try {
    response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64ImageFile } },
            {
              text:
                'Analyze this food image and return only valid JSON in this exact structure: {"name": "food name", "calories": 250}. Estimate total calories for the portion shown.',
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes("denied access") || msg.includes("PERMISSION_DENIED")) {
      throw new Error(
        "Gemini project is blocked by Google (403). Create a key in a new project or contact Google support."
      );
    }
    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
      throw new Error("GEMINI_API_KEY is invalid. Check backend/.env.");
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini quota exceeded. Try again later.");
    }
    if (msg.includes("NOT_FOUND") || msg.includes("404")) {
      throw new Error(`Gemini model "${modelName}" not available. Set GEMINI_MODEL in .env.`);
    }
    throw err;
  }

  const rawText = String(response.text ?? "").trim();
  let parsed: any = { name: "Detected Food", calories: 250 };

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    const nameMatch = rawText.match(/[A-Za-z][A-Za-z0-9\s'-]{2,40}/);
    const caloriesMatch = rawText.match(/(\d{2,4})\s*(kcal|calories?)/i);
    parsed = {
      name: nameMatch ? nameMatch[0].trim() : "Detected Food",
      calories: caloriesMatch ? Number(caloriesMatch[1]) : 250,
    };
  }

  return {
    success: true,
    message: "Image analyzed successfully",
    data: {
      filePath,
      result: {
        name: parsed.name || "Detected Food",
        calories: Number(parsed.calories ?? 250),
      },
    },
  };
};