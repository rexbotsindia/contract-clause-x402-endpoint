<div align="center">

<br />

# ContractLens AI

### AI-Powered Contract Risk Analyzer — Protected by x402 on Algorand

<p>
  <a href="https://x402.org"><img src="https://img.shields.io/badge/x402-v2.11.0-6366f1?style=for-the-badge&logoColor=white" alt="x402" /></a>
  <a href="https://algorand.co"><img src="https://img.shields.io/badge/Algorand-TestNet-00d4aa?style=for-the-badge&logo=algorand&logoColor=white" alt="Algorand" /></a>
  <a href="https://groq.com"><img src="https://img.shields.io/badge/Groq-llama--3.3--70b-f59e0b?style=for-the-badge&logoColor=white" alt="Groq" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <img src="https://img.shields.io/badge/TypeScript-ESM-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p>
  <strong>Upload a contract. Pay $0.50 USDC on Algorand TestNet. Get an instant risk analysis.</strong><br />
  No signup. No subscriptions. Every request is an on-chain payment verified by the x402 protocol.
</p>

<br />

</div>

---

## What Is This?

ContractLens AI is a **pay-per-use AI API** that demonstrates how the [x402 payment protocol](https://x402.org) can monetize any HTTP endpoint without a traditional payment processor.

Every call to `POST /analyze` triggers a full x402 payment handshake:

1. The server returns **HTTP 402 Payment Required** with USDC payment instructions
2. The client signs and submits the USDC transaction on **Algorand TestNet**
3. The x402 facilitator verifies the on-chain payment
4. The server parses the contract and runs **Groq AI** risk analysis
5. A structured JSON risk report is returned

The x402 integration is **100% unchanged from the official Algorand tutorial** — only the business logic behind the payment wall is different.

---

## Live Demo Routes

| Route | Method | Cost | Description |
|-------|--------|------|-------------|
| `/analyze` | `POST` | **$0.50 USDC** | AI-powered contract risk analysis |
| `/health` | `GET` | Free | Service health check |

The frontend at `localhost:3001` handles the x402 payment automatically server-side — the browser never touches a wallet.

---

## Payment Flow

```
Browser
     │
     │  POST /analyze  (contract document)
     ▼
┌────────────────────┐
│   Next.js Proxy    │  ──── forwards request ──▶  ┌──────────────────────┐
│  (Route Handler)   │                             │   Hono API Server    │
└────────────────────┘  ◀─── HTTP 402 ───────────  │  x402 Middleware     │
     │                                             └──────────────────────┘
     │  Signs USDC tx                                        │
     ▼                                                       │ verifies
┌─────────────────┐                               ┌──────────▼───────────┐
│ Algorand TestNet│  ◀──── payment ─────────────  │  x402 Facilitator    │
│   (USDC ASA)    │  ──── confirmed ────────────▶  └──────────────────────┘
└─────────────────┘                                          │
                                                   payment valid ✓
                                                             │
                                                   ┌──────────▼───────────┐
                                                   │  Document Parser     │
                                                   │  PDF / DOCX / text   │
                                                   └──────────────────────┘
                                                             │
                                                   ┌──────────▼───────────┐
                                                   │     Groq AI          │
                                                   │  llama-3.3-70b       │
                                                   └──────────────────────┘
                                                             │
                                                      HTTP 200 ✓
                                                   Risk Analysis JSON
```

---

## Project Structure

```
x402-contract-clause/
├── server/                         # Hono API server (x402 protected)
│   ├── index.ts                    # Entry point + x402 middleware
│   ├── routes/
│   │   └── analyze.ts              # POST /analyze handler
│   ├── services/
│   │   ├── groq.ts                 # Groq SDK + ContractAnalysis types
│   │   └── documentParser.ts       # PDF / DOCX / text parser
│   ├── prompts/
│   │   └── atsPrompt.ts            # Contract risk analysis prompt
│   ├── .env.template
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                       # Next.js 14 frontend
    ├── src/app/
    │   ├── page.tsx                # Main analyzer page
    │   ├── how-it-works/           # How It Works page
    │   ├── about/                  # About page
    │   ├── components/
    │   │   └── Navbar.tsx
    │   ├── api/analyze/
    │   │   └── route.ts            # x402-aware proxy to backend
    │   ├── layout.tsx
    │   └── globals.css
    ├── .env.local.template
    ├── package.json
    └── tsconfig.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · React 18 · TypeScript |
| UI Icons | lucide-react |
| API Proxy | Next.js Route Handler |
| Payment Protocol | x402 v2.11.0 (`@x402/hono`, `@x402/fetch`, `@x402/avm`) |
| Payment Network | Algorand TestNet · USDC (ASA) |
| Facilitator | [GoPlausible](https://facilitator.goplausible.xyz) |
| API Server | Hono + `@hono/node-server` |
| AI Inference | Groq SDK · `llama-3.3-70b-versatile` |
| Document Parsing | `pdf-parse` (PDF) · `mammoth` (DOCX) |
| Language | TypeScript ESM |

---

## Environment Variables

### Server — `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `AVM_ADDRESS` | ✅ | Algorand TestNet wallet address that receives payments |
| `FACILITATOR_URL` | ✅ | x402 facilitator URL (e.g. `https://facilitator.goplausible.xyz`) |
| `GROQ_API_KEY` | ✅ | Groq API key — get one free at [console.groq.com](https://console.groq.com) |
| `PORT` | optional | Server port (default: `3000`) |

### Frontend — `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `AVM_MNEMONIC` | ✅ | 25-word Algorand mnemonic for the paying wallet |
| `BACKEND_URL` | ✅ | URL of the API server (e.g. `http://localhost:3000`) |

---

## Running Locally

### Prerequisites

- **Node.js** v18 or newer
- **pnpm** — `npm install -g pnpm`
- **Algorand TestNet account** with ALGO + USDC — use the [TestNet Dispenser](https://bank.testnet.algorand.network)
- **Groq API key** — free at [console.groq.com](https://console.groq.com)

### 1. Start the API Server

```bash
cd server
cp .env.template .env
# Edit .env: fill in AVM_ADDRESS, GROQ_API_KEY, FACILITATOR_URL

pnpm install
pnpm start
```

Server runs at **http://localhost:3000**

```
🚀 x402 Contract Risk Analyzer running at http://localhost:3000

  POST /analyze   ($0.50 USDC) - AI contract risk analysis
  GET  /health    (free)        - Health check

  Payment network : Algorand TestNet
  Facilitator     : https://facilitator.goplausible.xyz
  Merchant wallet : ABCDEF...
```

### 2. Start the Frontend

```bash
cd frontend
cp .env.local.template .env.local
# Edit .env.local: fill in AVM_MNEMONIC, BACKEND_URL=http://localhost:3000

pnpm install
pnpm dev
```

Frontend runs at **http://localhost:3001**

---

## API Reference

### `POST /analyze` — Protected Endpoint

**Cost:** $0.50 USDC on Algorand TestNet  
**Content-Type:** `application/json` or `multipart/form-data`

**JSON body:**
```json
{ "contract": "<base64-encoded PDF/DOCX or plain text>" }
```

**Multipart form:**
```
contract: <File — PDF or DOCX>
```

**Success response (HTTP 200):**
```json
{
  "overallRiskScore": 72,
  "contractType": "Employment Agreement",
  "summary": "The contract contains several unfavorable clauses...",
  "risks": [
    {
      "title": "Broad IP Assignment",
      "severity": "Critical",
      "clause": "Section 8 — Intellectual Property",
      "description": "Assigns all inventions, including personal projects, to the employer.",
      "recommendation": "Negotiate to exclude pre-existing and personal-time inventions."
    }
  ],
  "favorableTerms": ["Competitive salary", "30-day termination notice"],
  "missingClauses": ["Limitation of liability", "Dispute resolution process"],
  "keyDates": [
    { "label": "Effective Date", "value": "1 January 2025" },
    { "label": "Notice Period",  "value": "30 days" }
  ],
  "parties": ["Acme Corp", "Jane Doe"],
  "jurisdiction": "State of California",
  "recommendation": "Negotiate Terms"
}
```

**No-payment response (HTTP 402):**
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "price": "$0.50",
    "network": "algorand:SGO1GKS...",
    "asset": 10458941,
    "payTo": "YOUR_WALLET_ADDRESS"
  }],
  "error": "Payment required"
}
```

### `GET /health` — Free

```json
{
  "status": "healthy",
  "service": "x402-contract-risk-analyzer",
  "paymentNetwork": "Algorand TestNet",
  "paymentToken": "USDC",
  "pricePerAnalysis": "$0.50"
}
```

---

## Deployment

### Render / Railway / Fly.io (Server)

1. Point your service root to `server/`
2. Set env vars: `AVM_ADDRESS`, `GROQ_API_KEY`, `FACILITATOR_URL`, `PORT`
3. Build: `pnpm install && pnpm build`
4. Start: `pnpm start`

### Vercel (Frontend)

1. Point your Vercel project root to `frontend/`
2. Set env vars: `AVM_MNEMONIC`, `BACKEND_URL` (your deployed server URL)
3. Vercel auto-detects Next.js — no further configuration needed

---

## How x402 Works Here

The payment middleware wraps the route in a single call:

```typescript
app.use(
  paymentMiddleware({
    "POST /analyze": {
      accepts: [{
        scheme: "exact",
        price: "$0.50",
        network: "algorand:SGO1...",
        payTo: process.env.AVM_ADDRESS,
        extra: { asset: USDC_TESTNET_ASA_ID },
      }],
    },
  }),
  resourceServer,
);
```

That's it. The route handler is pure business logic — parse the contract, call Groq, return JSON. The payment layer is completely decoupled.

---

## Learn More

| Resource | Link |
|----------|------|
| x402 Protocol | [x402.org](https://x402.org) |
| x402 on Algorand Tutorial | [dev.algorand.co](https://dev.algorand.co/resources/x402-on-algorand/) |
| @x402 npm packages | [npmjs.com](https://www.npmjs.com/search?q=%40x402) |
| Groq Console | [console.groq.com](https://console.groq.com) |
| Algorand Developer Portal | [developer.algorand.org](https://developer.algorand.org) |
| Algorand TestNet Dispenser | [bank.testnet.algorand.network](https://bank.testnet.algorand.network) |

---

<div align="center">

Built with [x402](https://x402.org) · [Algorand](https://algorand.co) · [Groq](https://groq.com)

</div>
