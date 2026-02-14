
import { GoogleGenAI, Type } from "@google/genai";
import { HLDTopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates structured HLD/LLD blueprints. 
 * Includes explicit design pattern mapping with Why/Benefit analysis.
 */
export const generateTopicDetails = async (topicId: string): Promise<HLDTopic> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a Distinguished Software Architect. Generate an exhaustive system design for: "${topicId}".

    YOU MUST RETURN VALID JSON. STICK TO THE SCHEMA.
    
    1. REQUIREMENTS: Provide 5 Functional (fr) and 5 Non-Functional (nfr) requirements.
    2. DESIGN PATTERNS: Identify 3-4 key Architectural or Design Patterns used (e.g., CQRS, Publisher-Subscriber, Circuit Breaker).
       - For each: Name, WHY it was chosen, and the BENEFIT it provides to the system.
    3. HLD Rationale: Provide 5 structured phases (fullExplanation).
    4. Simulation: Define 6-8 component nodes with (x,y) coordinates and 3 traffic scenarios (useCases).
    5. LLD Implementations: Provide 3 high-quality implementations (TypeScript, Go, and Java). Focus on Clean Architecture.
    6. DIAGRAMS: Provide valid Mermaid.js strings for HLD and Sequence diagrams.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          shortDescription: { type: Type.STRING },
          fr: { type: Type.ARRAY, items: { type: Type.STRING } },
          nfr: { type: Type.ARRAY, items: { type: Type.STRING } },
          designPatterns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                why: { type: Type.STRING },
                benefit: { type: Type.STRING }
              },
              required: ["name", "why", "benefit"]
            }
          },
          fullExplanation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepTitle: { type: Type.STRING },
                description: { type: Type.STRING },
                realTimeExample: { type: Type.STRING },
                tradeOff: { type: Type.STRING }
              }
            }
          },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              }
            }
          },
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
          },
          mermaidHLD: { type: Type.STRING },
          mermaidSequence: { type: Type.STRING }
        },
        required: ["id", "title", "fr", "nfr", "designPatterns", "fullExplanation", "nodes", "useCases", "llds", "mermaidHLD", "mermaidSequence"]
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (e) {
    console.error("Critical: Failed to generate or parse blueprint", e);
    throw new Error("System Blueprint Synthesis Failed.");
  }
};

export const chatWithAi = async (message: string, context: HLDTopic | null) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are ArchMaster Mentor for ${context?.title || 'System Design'}. 
      Help the user understand HLD/LLD trade-offs. Always mention design patterns where relevant.`
    }
  });
  const res = await chat.sendMessage({ message });
  return res.text;
};
