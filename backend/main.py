import json
import os
from datetime import datetime

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, ConfigDict, Field

load_dotenv()

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

genai_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

GEMINI_MODEL = "gemini-3-flash-preview"

# ---------------------------------------------------------------------------
# Pydantic models (used as Gemini response schema + type hints)
# ---------------------------------------------------------------------------

class DataFlow(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    from_node: str = Field(alias="from")
    to: str
    label: str
    status: str


class UseCase(BaseModel):
    id: str
    title: str
    description: str
    sunnySteps: list[DataFlow]
    rainySteps: list[DataFlow]


class ComponentNode(BaseModel):
    id: str
    name: str
    type: str
    x: float
    y: float


class LLD(BaseModel):
    language: str
    code: str
    explanation: str


class DesignPattern(BaseModel):
    name: str
    why: str
    benefit: str


class HLDStep(BaseModel):
    stepTitle: str
    description: str
    realTimeExample: str
    tradeOff: str


class HLDTopic(BaseModel):
    id: str
    title: str
    shortDescription: str
    fr: list[str]
    nfr: list[str]
    designPatterns: list[DesignPattern]
    fullExplanation: list[HLDStep]
    nodes: list[ComponentNode]
    useCases: list[UseCase]
    llds: list[LLD]
    mermaidHLD: str
    mermaidSequence: str


class ChatRequest(BaseModel):
    message: str
    context_title: str | None = None


class ChatResponse(BaseModel):
    reply: str


# ---------------------------------------------------------------------------
# Prompt (mirrors the original JS prompt)
# ---------------------------------------------------------------------------
TOPIC_PROMPT_TEMPLATE = """Act as a Distinguished Software Architect. Generate an exhaustive system design for: "{topic_id}".

YOU MUST RETURN VALID JSON. STICK TO THE SCHEMA.

1. REQUIREMENTS: Provide 5 Functional (fr) and 5 Non-Functional (nfr) requirements.
2. DESIGN PATTERNS: Identify 3-4 key Architectural or Design Patterns used (e.g., CQRS, Publisher-Subscriber, Circuit Breaker).
   - For each: Name, WHY it was chosen, and the BENEFIT it provides to the system.
3. HLD Rationale: Provide 5 structured phases (fullExplanation).
4. Simulation: Define 6-8 component nodes with (x,y) coordinates and 3 traffic scenarios (useCases).
5. LLD Implementations: Provide 3 high-quality implementations (TypeScript, Go, and Java). Focus on Clean Architecture.
6. DIAGRAMS: Provide valid Mermaid.js strings for HLD and Sequence diagrams."""


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="ArchMaster API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Supabase helpers (using plain HTTP via httpx)
# ---------------------------------------------------------------------------
def _get_cached_topic(topic_id: str) -> dict | None:
    """Fetch a cached topic from Supabase. Returns None on miss."""
    resp = requests.get(
        f"{SUPABASE_REST_URL}/topic_cache",
        headers=SUPABASE_HEADERS,
        params={"topic_id": f"eq.{topic_id}", "select": "data"},
    )
    if resp.status_code == 200:
        rows = resp.json()
        if rows:
            return rows[0]["data"]
    return None


def _save_to_cache(topic_id: str, data: dict) -> None:
    """Upsert topic data into Supabase cache."""
    requests.post(
        f"{SUPABASE_REST_URL}/topic_cache",
        headers={**SUPABASE_HEADERS, "Prefer": "resolution=merge-duplicates"},
        json={
            "topic_id": topic_id,
            "data": data,
            "created_at": datetime.now().isoformat(),
        },
    )


# ---------------------------------------------------------------------------
# Gemini helper
# ---------------------------------------------------------------------------
def _generate_from_gemini(topic_id: str) -> dict:
    """Call Gemini to generate a full HLDTopic for the given topic."""
    response = genai_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=TOPIC_PROMPT_TEMPLATE.format(topic_id=topic_id),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=HLDTopic,
        ),
    )
    text = response.text
    if not text:
        raise HTTPException(status_code=502, detail="Gemini returned empty response")
    return json.loads(text)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/api/topics/{topic_id}")
def get_topic(topic_id: str, refresh: bool = Query(False)):
    """
    Return the HLDTopic for the given topic.
    - Checks Supabase cache first.
    - On cache miss (or refresh=true), calls Gemini and stores the result.
    """
    if not refresh:
        cached = _get_cached_topic(topic_id)
        if cached:
            return cached

    data = _generate_from_gemini(topic_id)
    _save_to_cache(topic_id, data)
    return data


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Send a message to Gemini and return the reply."""
    chat_session = genai_client.chats.create(
        model=GEMINI_MODEL,
        config=types.GenerateContentConfig(
            system_instruction=(
                f"You are ArchMaster Mentor for {req.context_title or 'System Design'}. "
                "Help the user understand HLD/LLD trade-offs. "
                "Always mention design patterns where relevant."
            ),
        ),
    )
    res = chat_session.send_message(req.message)
    return ChatResponse(reply=res.text or "")
