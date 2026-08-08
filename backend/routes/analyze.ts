/**
 * POST /analyze route handler.
 * This handler only executes after x402 payment middleware has verified payment.
 *
 * Accepts two content types:
 *
 * 1. multipart/form-data  (browser file upload)
 *    Fields:
 *      - contract : File (PDF or DOCX) OR text field (plain text)
 *
 * 2. application/json  (programmatic / CLI clients)
 *    Body:
 *      { "contract": "<base64-encoded PDF/DOCX or plain text>" }
 *
 * Response:
 *   ContractAnalysis JSON object
 */
import { Hono } from "hono";
import { parseDocumentBuffer, parseDocument } from "../services/documentParser.js";
import { analyzeWithGroq } from "../services/groq.js";

const analyzeRoute = new Hono();

analyzeRoute.post("/analyze", async (c) => {
    const contentType = c.req.header("content-type") ?? "";

    let contractInput: string | Buffer;
    let contractFilename: string | undefined;

    // ── multipart/form-data ──────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
        let formData: FormData;
        try {
            formData = await c.req.formData();
        } catch {
            return c.json({ error: "Failed to parse multipart form data." }, 400);
        }

        const contractField = formData.get("contract");

        if (!contractField) {
            return c.json({ error: "Missing 'contract' field in form data." }, 400);
        }

        if (contractField instanceof File) {
            const arrayBuffer = await contractField.arrayBuffer();
            contractInput = Buffer.from(arrayBuffer);
            contractFilename = contractField.name;
        } else {
            contractInput = (contractField as string).trim();
        }

    // ── application/json ─────────────────────────────────────────────────────
    } else {
        let body: { contract?: string };
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Request body must be valid JSON." }, 400);
        }

        const { contract } = body;

        if (!contract || typeof contract !== "string" || contract.trim() === "") {
            return c.json({ error: "Missing or empty 'contract' field." }, 400);
        }

        contractInput = contract;
    }

    // ── Parse contract document to plain text ─────────────────────────────────
    let contractText: string;
    try {
        if (Buffer.isBuffer(contractInput)) {
            contractText = await parseDocumentBuffer(contractInput, contractFilename);
        } else {
            contractText = await parseDocument(contractInput);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse contract.";
        return c.json({ error: `Document parsing failed: ${message}` }, 422);
    }

    if (contractText.length < 100) {
        return c.json(
            { error: "Contract text is too short to analyze. Please provide the full contract document." },
            422,
        );
    }

    // ── Run contract risk analysis via Groq ───────────────────────────────────
    let analysis;
    try {
        analysis = await analyzeWithGroq(contractText);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Groq analysis failed.";
        console.error("[/analyze] Groq error:", message);
        return c.json({ error: `AI analysis failed: ${message}` }, 500);
    }

    return c.json(analysis, 200);
});

export { analyzeRoute };
