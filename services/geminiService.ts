
import { GoogleGenAI, Type } from "@google/genai";
import { HLDTopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTopicDetails = async (topicId: string): Promise<HLDTopic> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a World-Class Software Architect. Generate a complete, production-ready system design package for "${topicId}".

    The response must be in valid JSON format.

    Strict Requirements for Simulation Consistency:
    - You MUST only use the following IDs for simulation steps (sunnySteps and rainySteps): "client", "lb", "api", "cache", "db", "queue".
    - "client" is the user.
    - "lb" is the Load Balancer.
    - "api" is the Service/Gateway.
    - "cache" is the Redis/Memcached layer.
    - "db" is the Database.
    - "queue" is the Message Broker.

    Content Requirements:
    1. fullExplanation: Deep technical dive including consistency models (Eventual vs Strong), partition tolerance, and resource isolation.
    2. roleInsights: Array of 3 objects (Senior, Staff, Principal). 
       - Senior: Focus on implementation details, API contracts, and observability.
       - Staff: Focus on cross-team dependencies, cost-benefit analysis of tech stack, and migration paths.
       - Principal: Focus on ecosystem impact, 5-year scalability, and global reliability strategies.
    3. mermaidHLD: A high-quality architectural diagram (Mermaid.js).
    4. mermaidSequence: A detailed sequence diagram covering request-response, auth, and DB persistence.
    5. useCases: At least 3 detailed scenarios. Each MUST have distinct sunnySteps and rainySteps using the IDs above.
    6. llds: Production-quality, complete boilerplate code.
       - Java: Use Spring Boot annotations, DTOs, Service, and Repository interfaces.
       - Python: Use FastAPI with Pydantic models and Dependency Injection.
       - TypeScript: Use Express/NestJS style with Interfaces and Decorators.
       - Ensure code is "copy-paste" ready and includes meaningful comments on Design Patterns used (e.g. Strategy, Decorator, Observer).`,
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
                      from: { type: Type.STRING, description: "Must be one of: client, lb, api, cache, db, queue" },
                      to: { type: Type.STRING, description: "Must be one of: client, lb, api, cache, db, queue" },
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
                      from: { type: Type.STRING, description: "Must be one of: client, lb, api, cache, db, queue" },
                      to: { type: Type.STRING, description: "Must be one of: client, lb, api, cache, db, queue" },
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Content generation failed");
  }
};

export const chatWithAi = async (message: string, context: HLDTopic | null) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are ArchMaster AI, an expert software architect mentor.
      Context: ${JSON.stringify(context)}.
      You provide advice tailored to seniority (Senior, Staff, Principal). 
      If asked about simulations, explain the flow from client to DB. 
      If asked about code, break down the class hierarchies and design patterns used.
      Always be technically rigorous and professional.`
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
