import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image to provide a DSLR-like technical description or scene understanding.
 */
export const analyzeImageScene = async (base64Image: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Act as a professional photographer. Briefly describe this scene, lighting conditions, and suggest optimal DSLR settings (ISO, Shutter, Aperture) in 2 sentences."
          }
        ]
      }
    });

    return response.text || "Could not analyze scene.";
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze image.");
  }
};

/**
 * Edits an image based on a prompt (Color Changing, DSLR Effects).
 * Uses the editing capabilities of Gemini.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Specialized model for image editing/generation tasks
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract the generated image from the response
    let editedImageBase64 = null;
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          editedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!editedImageBase64) {
      throw new Error("No image data returned from AI.");
    }

    return `data:image/jpeg;base64,${editedImageBase64}`;
  } catch (error) {
    console.error("Image editing failed:", error);
    throw error;
  }
};