/**
 * app.ts — ContractLens API Server
 *
 * Payment-gated contract risk analysis powered by x402 + Groq.
 *
 * Endpoints:
 *   POST /scan     — $1.00 USDC (x402 protected) — returns ContractReport JSON
 *   GET  /status   — free health check
 */
import { config } from "dotenv";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactAvmScheme } from "@x402/avm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { USDC_TESTNET_ASA_ID } from "@x402/avm";
import { scanRouter } from "./core/gateway.js";

config();

// Algorand TestNet network identifier (full genesis hash form required by facilitator)
const ALGO_TESTNET = "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";

// ── Env validation ────────────────────────────────────────────────────────────

const merchantWallet = process.env.AVM_ADDRESS;
if (!merchantWallet) {
    console.error("Missing required env var: AVM_ADDRESS");
    process.exit(1);
}

const facilitatorEndpoint = process.env.FACILITATOR_URL;
if (!facilitatorEndpoint) {
    console.error("Missing required env var: FACILITATOR_URL");
    process.exit(1);
}

if (!process.env.GROQ_API_KEY) {
    console.error("Missing required env var: GROQ_API_KEY");
    process.exit(1);
}

const port = Number(process.env.PORT ?? 3000);

// ── x402 initialisation ───────────────────────────────────────────────────────

const facilitator   = new HTTPFacilitatorClient({ url: facilitatorEndpoint });
const paymentServer = new x402ResourceServer(facilitator)
    .register(ALGO_TESTNET, new ExactAvmScheme());

// ── Hono application ──────────────────────────────────────────────────────────

const app = new Hono();

app.use(
    "/*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "X-PAYMENT", "X-PAYMENT-RESPONSE", "Authorization"],
        exposeHeaders: ["X-PAYMENT-RESPONSE", "X-PAYMENT-REQUIRED"],
    }),
);

// Payment wall — protects POST /scan
app.use(
    paymentMiddleware(
        {
            "POST /scan": {
                accepts: [
                    {
                        scheme: "exact",
                        price: "$1.00",
                        network: ALGO_TESTNET,
                        payTo: merchantWallet,
                        extra: { asset: USDC_TESTNET_ASA_ID },
                    },
                ],
                description: "AI-powered legal contract risk analysis",
                mimeType: "application/json",
            },
        },
        paymentServer,
    ),
);

// Paid route
app.route("/", scanRouter);

// Free status endpoint
app.get("/status", (c) =>
    c.json({
        ok: true,
        service: "contractlens-api",
        network: "Algorand TestNet",
        token: "USDC",
        price: "$1.00",
    }),
);

// ── Boot ──────────────────────────────────────────────────────────────────────

serve({ fetch: app.fetch, port }, () => {
    console.log(`\nContractLens API  →  http://localhost:${port}`);
    console.log(`  POST /scan    $1.00 USDC  (payment required)`);
    console.log(`  GET  /status  free`);
    console.log(`  Network   : Algorand TestNet`);
    console.log(`  Wallet    : ${merchantWallet}`);
    console.log(`  Facilitator: ${facilitatorEndpoint}\n`);
});
