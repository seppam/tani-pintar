# Tani Pintar - AI Crop Health Advisor

Tani Pintar is an AI-powered agricultural diagnosis and crop health advisor tailored for smallholder farmers. It analyzes crop foliar photos, cross-references real-time microclimate weather data, formulates low-cost integrated pest management (IPM) action plans, and strictly enforces farmer chemical safety protocols.

## What the App Does

- **Multimodal Visual Diagnosis**: Identifies crop species, recognizes fungal/bacterial/pest symptoms, and distinguishes healthy crops from pathological conditions.
- **Regional Microclimate Context**: Connects to Open-Meteo weather sensors to evaluate disease sporulation pressure (humidity, rainfall, temperature) and leverages real Google Search Grounding for localized Indonesian agronomic practices.
- **Organic & Low-Cost First Action Plan**: Builds a prioritized, chronological IPM timeline favoring cultural sanitation, farm-made botanical extracts (e.g. neem leaf, garlic, wood ash), and biological controls before chemical treatments.
- **Strict Farmer Safety & PPL Mandate**: Enforces mandatory PPE advisories, Pre-Harvest Intervals (PHI), environmental precautions (pollinator and waterway protection), and disallows arbitrary pesticide dosage instructions without in-person consultation with a local agricultural extension officer (PPL).
- **Dual-Language Support**: Seamlessly toggles between Bahasa Indonesia (ID) and English (EN).

---

## The 4-Agent Pipeline

The application coordinates four specialized sequential agents:

1. **Agent 1: Vision Diagnostician**
   - Evaluates image quality (`good`, `poor`, `not_a_plant`) and whether the plant is healthy.
   - Diagnoses primary crop issues with Latin binomial pathogen names and ranked confidence hypotheses.
   - Filters out non-plant images or unreadable/blurry photos early to protect farmer time and API resources.
   - Ignores prompt injection attempts in farmer field notes.

2. **Agent 2: Context Agent**
   - Retrieves live field microclimate data (temperature, relative humidity, precipitation, wind speed, 3-day trend) via Open-Meteo geocoding and weather APIs.
   - Performs real Google Search Grounding (`tools: [{ googleSearch: {} }]`) to pull verified regional agronomic advisories and control practices.
   - Analyzes humidity and splash dispersal risks for the diagnosed pathogen.

3. **Agent 3: Action Planner**
   - Designs a 4-step IPM action plan (Day 1 Immediate sanitation, Day 2-3 Botanical extract, Day 4-5 Biological control, Day 7+ Preventative strengthening).
   - Enforces low-cost and organic materials accessible to smallholder farmers.

4. **Agent 4: Safety Checker**
   - Strictly checks: if diagnosis confidence is below 0.60, image quality is not "good", or the action plan contains synthetic chemicals, a prominent warning is mandated.
   - Advises consultation with the local Balai Penyuluhan Pertanian (BPP) / Petugas Penyuluh Pertanian Lapangan (PPL).
   - Never provides raw chemical dosages without verified extension officer oversight.

---

## Models Used & Fallback Reliability Order

All four agents query Google Gemini through the official `@google/genai` TypeScript SDK using an automatic resilience and retry mechanism:

1. **`gemini-3.8-flash`** (Primary default model for low-latency reasoning and search grounding)
2. **`gemini-flash-latest`** (Secondary fallback model)
3. **`gemini-flash-lite-latest`** (Cost-effective resilient fallback model)

### Retry & Recovery Rules
- For transient `503 Unavailable` or `429 Rate Limit / High Demand` errors, the pipeline retries the same model up to twice with exponential backoff (800ms then 1600ms) before falling back.
- Successfully responding models are remembered across pipeline runs in a module-level variable to minimize latency on subsequent analyses.
- `gemini-2.5-flash` has been completely decommissioned.

### Token Usage & Pricing Transparency
- Every Gemini call captures exact token metrics via `response.usageMetadata` (prompt tokens, candidates tokens, and thoughts tokens).
- Per-agent and analysis totals are visible directly inside the Agent Trace audit interface.
- Real-time estimated cost computation is based on official pricing (e.g., $0.75 / $3.75 per 1M tokens for `gemini-3.8-flash`), displaying `"price n/a"` for unlisted model aliases.

---

## External APIs Used

1. **Google Gemini API (`@google/genai`)**: Powers multimodal vision diagnosis, structured JSON reasoning, and Google Search Grounding.
2. **Google Search Grounding (`tools: [{ googleSearch: {} }]`)**: Live web grounding for regional agronomic extension notices and localized agricultural management in Indonesia.
3. **Open-Meteo Weather API (`api.open-meteo.com`)**: Real-time microclimate sensors (temperature, relative humidity, precipitation, wind speed, daily forecasts) without requiring private API keys.
4. **Open-Meteo Geocoding API (`geocoding-api.open-meteo.com`)**: Geocodes farmer district and regency names to geographic coordinates.

---

## How to Run Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm or bun

### Setup Steps

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the project root (never commit this file to version control):
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## Limitations & Advisory

- **Informational & Educational AI Guidance Only**: Tani Pintar provides AI-generated agronomic recommendations based on digital photographs and meteorological models. It is **not** a certified laboratory diagnostic report and does not replace on-site physical inspection by an agronomist or certified plant pathologist.
- **Agricultural Extension Officer (PPL) Consultation**: Smallholders must consult their local Petugas Penyuluh Pertanian Lapangan (PPL) or Balai Penyuluhan Pertanian (BPP) before purchasing, mixing, or applying commercial synthetic agrochemicals.
- **Privacy Assurance**: Photographs submitted are transmitted securely to Google Gemini for real-time diagnostic evaluation and are **not stored** on any application database or persistent server storage.
