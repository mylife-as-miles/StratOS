
import { GoogleGenAI, Type } from "@google/genai";
import { Ticket, AIStrategy } from "../types";

export async function getRaceStrategy(tickets: Ticket[]): Promise<AIStrategy> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this engineering team's current "race" (sprint).
    Tickets: ${JSON.stringify(tickets)}
    
    Convert this into a F1 race strategy briefing. 
    Identify "mechanical failures" (blocked tickets), "tyre degradation" (old tickets), and "lap times" (velocity).
    Provide a priority level (CRITICAL, STABLE, OPTIMAL) and clear recommendations.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            priorityLevel: { 
              type: Type.STRING,
              enum: ['CRITICAL', 'STABLE', 'OPTIMAL']
            }
          },
          required: ["analysis", "recommendations", "priorityLevel"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AIStrategy;
  } catch (error) {
    console.error("Race strategy analysis failed", error);
    return {
      analysis: "COMMUNICATION BREAKDOWN. THE PIT WALL IS OFFLINE. PROCEED WITH CAUTION.",
      recommendations: ["Check manual logs", "Awaiting telemetry restoration"],
      priorityLevel: "CRITICAL"
    };
  }
}
