/**
 * x402 Contract Risk Analyzer - Resource Server
 *
 * POST /analyze is protected by x402 payment middleware.
 * Flow:
 *   1. Client POSTs /analyze
 *   2. x402 middleware intercepts → HTTP 402 Payment Required
 *   3. Client pays on Algorand TestNet via USDC
 *   4. Client retries with payment header
 *   5. x402 middleware verifies payment via facilitator
 *   6. Route handler parses contract + calls Groq
 *   7. Returns contract risk analysis JSON
 */
import { config } from "dotenv";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactAvmScheme } from "@x402/avm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { USDC_TESTNET_ASA_ID } from "@x402/avm";
import { analyzeRoute } from "./routes/analyze.js";

config();

// The facilitator advertises this exact network string for Algorand TestNet.
const ALGORAND_TESTNET_NETWORK = "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";

config();

// ── Environment validation ────────────────────────────────────────────────────

const avmAddress = process.env.AVM_ADDRESS;
if (!avmAddress) {
    console.error("❌ Missing AVM_ADDRESS environment variable");
    process.exit(1);
}

const facilitatorUrl = process.env.FACILITATOR_URL;
if (!facilitatorUrl) {
    console.error("❌ Missing FACILITATOR_URL environment variable");
    process.exit(1);
}

if (!process.env.GROQ_API_KEY) {
    console.error("❌ Missing GROQ_API_KEY environment variable");
    process.exit(1);
}

const port = Number(process.env.PORT ?? 3000);

// ── x402 setup ───────────────────────────────────────────────────────────────

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(ALGORAND_TESTNET_NETWORK, new ExactAvmScheme());

// ── Hono app ──────────────────────────────────────────────────────────────────

const app = new Hono();

// CORS - allow the frontend and any deployed origin
app.use(
    "/*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "X-PAYMENT", "X-PAYMENT-RESPONSE", "Authorization"],
        exposeHeaders: ["X-PAYMENT-RESPONSE", "X-PAYMENT-REQUIRED"],
    }),
);

// ── x402 payment middleware ───────────────────────────────────────────────────

app.use(
    paymentMiddleware(
        {
            "POST /analyze": {
                accepts: [
                    {
                        scheme: "exact",
                        price: "$0.50",
                        network: ALGORAND_TESTNET_NETWORK,
                        payTo: avmAddress,
                        extra: { asset: USDC_TESTNET_ASA_ID },
                    },
                ],
                description: "AI-powered contract clause risk analysis via Groq",
                mimeType: "application/json",
            },
        },
        resourceServer,
    ),
);

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /analyze - paid AI endpoint
app.route("/", analyzeRoute);

// GET /health - free health check
app.get("/health", (c) => {
    return c.json({
        status: "healthy",
        service: "x402-contract-risk-analyzer",
        paymentNetwork: "Algorand TestNet",
        paymentToken: "USDC",
        pricePerAnalysis: "$0.50",
    });
});

// ── Start server ──────────────────────────────────────────────────────────────

serve(
    {
        fetch: app.fetch,
        port,
    },
    () => {
        console.log(`\n🚀 x402 Contract Risk Analyzer running at http://localhost:${port}`);
        console.log(`\n  POST /analyze   ($0.50 USDC) - AI contract risk analysis`);
        console.log(`  GET  /health    (free)        - Health check`);
        console.log(`\n  Payment network : Algorand TestNet`);
        console.log(`  Facilitator     : ${facilitatorUrl}`);
        console.log(`  Merchant wallet : ${avmAddress}\n`);
    },
);
