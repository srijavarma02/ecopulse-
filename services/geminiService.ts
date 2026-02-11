
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEnergyInsights = async (data: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this campus energy data and provide 3-4 professional, actionable insights for energy optimization. 
      Format as JSON list.
      Data: ${JSON.stringify(data.slice(-10))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'One of: prediction, anomaly, action' },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: { type: Type.STRING, description: 'One of: low, medium, high' }
            },
            required: ['type', 'title', 'description', 'severity']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error: any) {
    console.error("Gemini Insight Error:", error);
    // Propagate the quota error so the UI can show a specialized message
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("API Quota exceeded. Please try again later.");
    }
    return [];
  }
};

export const getSmartOptimizationPlan = async (campusState: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: A university campus energy manager needs to reduce load by 15% due to a peak grid price event.
      Current Situation: ${campusState}.
      Provide a strategic optimization plan with 5 concrete steps.`,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Plan Error:", error);
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("API Quota exceeded. Strategy generation failed.");
    }
    return "Plan unavailable. Please check system connection.";
  }
};
