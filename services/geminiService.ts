
import { GoogleGenAI, Type } from "@google/genai";
import { HLDTopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTopicDetails = async (topicId: string): Promise<HLDTopic> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a World-Class Software Architect. Generate a complete, production-ready system design package for "${topicId}".

    The response must be in valid JSON format.

    STRICT SIMULATION REQUIREMENTS:
    - You MUST use ONLY these IDs for 'from' and 'to' fields in sunnySteps and rainySteps: "client", "lb", "api", "cache", "db", "queue".
    - "client": The end user device.
    - "lb": Load Balancer (Nginx/HAProxy).
    - "api": The primary application service logic.
    - "cache": Distributed cache (Redis/Memcached).
    - "db": Primary persistent storage.
    - "queue": Message broker (RabbitMQ/Kafka).

    CONTENT REQUIREMENTS:
    1. fullExplanation: Provide a deep technical dive. Mention consistency models, CAP theorem trade-offs, and multi-region strategies.
    2. roleInsights: Array of 3 objects (Senior, Staff, Principal).
       - Senior: Focus on clean code, unit testing, and API reliability.
       - Staff: Focus on system boundaries, cross-service communication, and SLOs/SLIs.
       - Principal: Focus on architectural alignment with business goals, cost management at scale, and long-term tech debt strategy.
    3. useCases: Define at least 3 distinct scenarios.
       - Each scenario MUST have a 'sunnySteps' path (success) and a 'rainySteps' path (failure/exception).
       - Describe failures like "Database Timeout", "Cache Miss with DB Overload", or "Queue full".
    4. llds: Provide FULL, EXECUTABLE-looking code for ALL 3 languages (Java, Python, TypeScript).
       - Java: Use Spring Boot style.
       - Python: Use FastAPI/Pydantic style.
       - TypeScript: Use NestJS/Express style.
       - Include boilerplate: Controller, Service, Repository, and DTOs.
    5. mermaidHLD & mermaidSequence: High-quality Mermaid.js code for visualization.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          shortDescription: { type: Type.STRING },
          fullExplanation: { type: Type.STRING },
          roleInsights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                focus: { type: Type.STRING },
                advice: { type: Type.STRING }
              }
            }
          },
          mermaidHLD: { type: Type.STRING },
          mermaidSequence: { type: Type.STRING },
          useCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                sunnySteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      label: { type: Type.STRING },
                      status: { type: Type.STRING }
                    }
                  }
                },
                rainySteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      label: { type: Type.STRING },
                      status: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          llds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                code: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          }
        },
        required: ["id", "title", "fullExplanation", "roleInsights", "useCases", "llds", "mermaidHLD", "mermaidSequence"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Content generation failed: " + e);
  }
};

export const chatWithAi = async (message: string, context: HLDTopic | null) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are ArchMaster AI, an expert software architect mentor.
      Current context system: ${context ? context.title : 'None selected'}.
      Explain HLD/LLD trade-offs, sequence flows, and code patterns. Be concise but deep.
      Tailor responses to Senior, Staff, or Principal engineers depending on the user's focus.`
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
