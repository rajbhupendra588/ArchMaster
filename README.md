# ArchMaster — HLD & LLD SaaS Learning Platform

ArchMaster is an interactive system-design learning platform focused on **production-ready HLD and LLD learning workflows**.

## What this app now includes

- Detailed, step-by-step HLD explanations for each topic.
- Multiple system use cases with **Sunny Day** and **Rainy Day** simulations.
- Visual architecture and sequence diagrams using Mermaid.
- Predefined LLD starter implementations in:
  - TypeScript (NestJS style)
  - Python (FastAPI style)
  - Java (Spring Boot style)
- Voice mentor panel (voice input/output with Gemini live mode).
- Chat mentor panel for architecture Q&A.
- Built-in offline topic packages so the app works even when AI API keys are unavailable.

## Topic library

The curriculum includes URL shortener, messaging, checkout, video delivery, ride hailing, payments, API gateway/zero-trust, event streaming, recommendation systems, and collaborative docs.

## Local development

### Prerequisites
- Node.js 20+

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Add environment variables in `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_key_here
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

> If `VITE_GEMINI_API_KEY` is not set, the platform automatically runs in offline mode using production-oriented built-in topic templates.

## Build

```bash
npm run build
```
