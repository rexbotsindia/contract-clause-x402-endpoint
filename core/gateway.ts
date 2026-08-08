/**
 * gateway.ts
 *
 * POST /scan — the single paid endpoint.
 * Only runs after x402 payment middleware has confirmed USDC settlement.
 *
 * Accepted content types:
 *   multipart/form-data  →  field "contract" (File or text)
 *   application/json     →  body { "contract": "<base64 | plain text>" }
 */
import { Hono } from "hono";
import { extractFromBuffer, extractFromString } from "../engine/fileReader.js";
import { runLegalAnalysis } from "../engine/legalAI.js";

export const scanRouter = new Hono();

scanRouter.post("/scan", async (c) => {
    const contentType = c.req.header("content-type") ?? "";

    let rawInput: string | Buffer;
    let inputFilename: string | undefined;

    // ── multipart/form-data ────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
        let form: FormData;
        try {
            form = await c.req.formData();
        } catch {
            return c.json({ error: "Could not parse multipart form data." }, 400);
        }

        const field = form.get("contract");
        if (!field) {
            return c.json({ error: "Form field 'contract' is required." }, 400);
        }

        if (field instanceof File) {
            const bytes = await field.arrayBuffer();
            rawInput = Buffer.from(bytes);
            inputFilename = field.name;
        } else {
            rawInput = (field as string).trim();
        }

    // ── application/json ───────────────────────────────────────────────────
    } else {
        let body: { contract?: string };
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Request body must be valid JSON." }, 400);
        }

        const { contract } = body;
        if (!contract || typeof contract !== "string" || !contract.trim()) {
            return c.json({ error: "JSON field 'contract' is required and must be non-empty." }, 400);
        }
        rawInput = contract;
    }

    // ── Extract plain text ─────────────────────────────────────────────────
    let contractText: string;
    try {
        contractText = Buffer.isBuffer(rawInput)
            ? await extractFromBuffer(rawInput, inputFilename)
            : await extractFromString(rawInput);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "File extraction failed.";
        return c.json({ error: `Extraction error: ${msg}` }, 422);
    }

    if (contractText.length < 100) {
        return c.json(
            { error: "Document is too short to analyse. Please provide the complete contract." },
            422,
        );
    }

    // ── Run AI analysis ────────────────────────────────────────────────────
    let report;
    try {
        report = await runLegalAnalysis(contractText);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Analysis failed.";
        console.error("[gateway] AI error:", msg);
        return c.json({ error: `AI analysis failed: ${msg}` }, 500);
    }

    return c.json(report, 200);
});
