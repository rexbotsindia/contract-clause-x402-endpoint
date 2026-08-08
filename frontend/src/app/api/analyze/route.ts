/**
 * POST /api/analyze
 *
 * Next.js Route Handler - acts as an x402-aware proxy to the backend.
 *
 * Flow:
 *   1. Receive multipart/form-data from the browser (contract file)
 *   2. Build the x402 client using the demo wallet mnemonic (server-side env var)
 *   3. POST to BACKEND_URL/analyze - server returns HTTP 402
 *   4. wrapFetchWithPayment() signs the payment on Algorand TestNet and retries
 *   5. Forward the contract risk analysis JSON back to the browser
 *   6. Include payment metadata so the frontend can display proof of payment
 */

import { NextRequest, NextResponse } from "next/server";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { toClientAvmSigner, ExactAvmScheme } from "@x402/avm";
import {
    ed25519SigningKeyFromWrappedSecret,
    type WrappedEd25519Seed,
} from "@algorandfoundation/algokit-utils/crypto";
import { seedFromMnemonic } from "@algorandfoundation/algokit-utils/algo25";

// Wildcard network pattern - matches any algorand: network string
const ALGORAND_NETWORK_WILDCARD = "algorand:*";

// ── Build x402 client (once per cold start) ───────────────────────────────────

async function buildSecretKey(mnemonic: string): Promise<string> {
    const seed = seedFromMnemonic(mnemonic);
    const seedCopy = new Uint8Array(seed);
    const wrappedSeed: WrappedEd25519Seed = { ed25519Seed: async () => seed };
    const wrappedSecret = await ed25519SigningKeyFromWrappedSecret(wrappedSeed);
    return Buffer.concat([
        Buffer.from(seedCopy),
        Buffer.from(wrappedSecret.ed25519Pubkey),
    ]).toString("base64");
}

let cachedFetch: ReturnType<typeof wrapFetchWithPayment> | null = null;
let cachedWalletAddress: string | null = null;

async function getPaymentFetch() {
    if (cachedFetch) return { fetchWithPayment: cachedFetch, walletAddress: cachedWalletAddress };

    const mnemonic = process.env.AVM_MNEMONIC;
    if (!mnemonic) throw new Error("AVM_MNEMONIC environment variable is not set.");

    const secretKey = await buildSecretKey(mnemonic);
    const avmSigner = toClientAvmSigner(secretKey);

    const client = new x402Client();
    client.register(ALGORAND_NETWORK_WILDCARD, new ExactAvmScheme(avmSigner));

    cachedFetch = wrapFetchWithPayment(fetch, client);
    cachedWalletAddress = avmSigner.address;

    return { fetchWithPayment: cachedFetch, walletAddress: cachedWalletAddress };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        return NextResponse.json({ error: "BACKEND_URL is not configured." }, { status: 500 });
    }

    // Parse the incoming multipart form from the browser
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Failed to parse form data." }, { status: 400 });
    }

    const contractField = formData.get("contract");

    if (!contractField) {
        return NextResponse.json({ error: "Missing 'contract' field." }, { status: 400 });
    }

    // Build the outgoing payload for the backend
    let contractPayload: string;
    if (contractField instanceof File) {
        const arrayBuffer = await contractField.arrayBuffer();
        contractPayload = Buffer.from(arrayBuffer).toString("base64");
    } else {
        contractPayload = (contractField as string).trim();
    }

    // Get the x402-aware fetch
    let fetchWithPayment: ReturnType<typeof wrapFetchWithPayment>;
    let walletAddress: string | null;
    try {
        ({ fetchWithPayment, walletAddress } = await getPaymentFetch());
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to initialize payment client.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Call the backend - x402 middleware handles 402 → pay → retry transparently
    let backendResponse: Response;
    try {
        backendResponse = await fetchWithPayment(`${backendUrl}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contract: contractPayload }),
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error reaching backend.";
        return NextResponse.json({ error: `Backend unreachable: ${msg}` }, { status: 502 });
    }

    if (!backendResponse.ok) {
        let errBody = "";
        try { errBody = await backendResponse.text(); } catch { /* ignore */ }
        return NextResponse.json(
            { error: `Backend returned ${backendResponse.status}: ${errBody}` },
            { status: backendResponse.status },
        );
    }

    // Parse contract analysis from backend
    let analysis: unknown;
    try {
        analysis = await backendResponse.json();
    } catch {
        return NextResponse.json({ error: "Backend returned invalid JSON." }, { status: 502 });
    }

    const paymentSettlement = backendResponse.headers.get("x-payment-response");

    // Parse the x402 payment response to extract transaction details
    let txId: string | null = null;
    let fromAddress: string | null = null;
    let toAddress: string | null = null;
    let network: string | null = null;

    if (paymentSettlement) {
        try {
            const parsed = JSON.parse(paymentSettlement);
            // x402 settlement shape: { transaction: { txHash/id, from, to, network, ... } }
            const tx = parsed?.transaction ?? parsed?.payment ?? parsed;
            txId       = tx?.txHash ?? tx?.txId ?? tx?.id ?? tx?.transactionId ?? null;
            fromAddress = tx?.from ?? tx?.sender ?? walletAddress ?? null;
            toAddress   = tx?.to   ?? tx?.receiver ?? null;
            network     = tx?.network ?? parsed?.network ?? null;
        } catch {
            // ignore parse errors — raw string kept in paymentSettlement
        }
    }

    return NextResponse.json({
        analysis,
        meta: {
            walletAddress,
            paymentSettlement: paymentSettlement ?? null,
            txId,
            fromAddress: fromAddress ?? walletAddress,
            toAddress,
            network: network ?? "Algorand TestNet",
            paidAmount: "$1.00 USDC",
            timestamp: new Date().toISOString(),
        },
    });
}
