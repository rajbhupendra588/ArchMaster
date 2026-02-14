import { GoogleGenAI, Type } from '@google/genai';
import { HLDTopic } from '../types';
import { generateLocalTopic } from '../data/topicBlueprints';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const createPrompt = (topicId: string) => `You are a World-Class Software Architect. Generate a complete, production-ready system design package for "${topicId}".

The response must be in valid JSON format.

STRICT SIMULATION REQUIREMENTS:
- You MUST use ONLY these IDs for 'from' and 'to' fields in sunnySteps and rainySteps: "client", "lb", "api", "cache", "db", "queue".

CONTENT REQUIREMENTS:
1. fullExplanation: Provide 5-8 distinct architectural steps, each starting with "Step X: [Title]" and separated by a blank line.
2. roleInsights: Array of exactly 3 objects for Senior, Staff, Principal.
3. useCases: At least 3 scenarios with sunnySteps and rainySteps.
4. llds: Full LLD snippets in Java (Spring), Python (FastAPI), and TypeScript (NestJS/Express).
5. mermaidHLD & mermaidSequence: Mermaid syntax only.`;

export const generateTopicDetails = async (topicId: string): Promise<HLDTopic> => {
  if (!ai) {
    return generateLocalTopic(topicId);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createPrompt(topicId),
      config: {
        responseMimeType: 'application/json',
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
          required: ['id', 'title', 'fullExplanation', 'roleInsights', 'useCases', 'llds', 'mermaidHLD', 'mermaidSequence']
        }
      }
    });

    const text = response.text;
    if (!text) {
      return generateLocalTopic(topicId);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('AI generation failed, using local fallback.', error);
    return generateLocalTopic(topicId);
  }
};

export const chatWithAi = async (message: string, context: HLDTopic | null) => {
  if (!ai) {
    const contextTitle = context?.title || 'system design';
    return `You are in offline mode (no VITE_GEMINI_API_KEY configured). For ${contextTitle}, start by clarifying functional requirements, then define SLOs, draw read/write sequence diagrams, and validate failure handling (timeouts, retries, idempotency, and observability). Your question was: "${message}".`;
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are ArchMaster AI, an expert software architect mentor.
Current context system: ${context ? context.title : 'None selected'}.
Explain HLD/LLD trade-offs, sequence flows, and code patterns.
Keep responses practical and production-oriented.`
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text || 'I can help break this down by requirements, architecture, and implementation trade-offs.';
  } catch (error) {
    console.error('Chat failed, using local fallback.', error);
    return `I could not reach the AI backend. For "${context?.title || 'this topic'}", evaluate throughput targets, consistency model, failure domains, and rollout strategy before finalizing LLD.`;
  }
};
