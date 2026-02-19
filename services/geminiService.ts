import { HLDTopic } from "../types";

const API_BASE = "/api";

/**
 * Fetches the HLDTopic for a given topic from the backend.
 * The backend checks Supabase cache first, calls Gemini on a miss.
 */
export const generateTopicDetails = async (
  topicId: string,
  refresh = false
): Promise<HLDTopic> => {
  const url = new URL(`${API_BASE}/topics/${encodeURIComponent(topicId)}`, window.location.origin);
  if (refresh) {
    url.searchParams.set("refresh", "true");
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.text();
    console.error("Backend error:", error);
    throw new Error("System Blueprint Synthesis Failed.");
  }

  return response.json();
};

/**
 * Sends a chat message to the backend which proxies it to Gemini.
 */
export const chatWithAi = async (
  message: string,
  context: HLDTopic | null
): Promise<string> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context_title: context?.title ?? null,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Chat error:", error);
    throw new Error("Chat request failed.");
  }

  const data = await response.json();
  return data.reply;
};
