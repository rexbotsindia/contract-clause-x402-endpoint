/**
 * legalAI.ts
 *
 * Thin wrapper around the Groq SDK.
 * Sends contract text to the LLM and returns a validated ContractReport object.
 */
import Groq from "groq-sdk";
import { buildRiskExtractionPrompt } from "../templates/riskTemplate.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RiskEntry {
    title: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    clause: string;
    description: string;
    recommendation: string;
}

export interface DateEntry {
    label: string;
    value: string;
}

export interface ContractReport {
    overallRiskScore: number;
    contractType: string;
    summary: string;
    risks: RiskEntry[];
    favorableTerms: string[];
    missingClauses: string[];
    keyDates: DateEntry[];
    parties: string[];
    jurisdiction: string;
    recommendation: string;
}

// ── Required fields for validation ───────────────────────────────────────────

const REQUIRED_FIELDS: (keyof ContractReport)[] = [
    "overallRiskScore",
    "contractType",
    "summary",
    "risks",
    "favorableTerms",
    "missingClauses",
    "keyDates",
    "parties",
    "jurisdiction",
    "recommendation",
];

// ── Groq client (singleton) ───────────────────────────────────────────────────

let _client: Groq | null = null;

function getClient(): Groq {
    if (!_client) {
        const key = process.env.GROQ_API_KEY;
        if (!key) throw new Error("GROQ_API_KEY is not set in environment.");
        _client = new Groq({ apiKey: key });
    }
    return _client;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Runs a legal risk analysis on the supplied contract text.
 * Returns a fully-validated ContractReport.
 */
export async function runLegalAnalysis(contractText: string): Promise<ContractReport> {
    const client = getClient();
    const userPrompt = buildRiskExtractionPrompt(contractText);

    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content:
                    "You are a precise legal contract risk analysis engine. " +
                    "Return ONLY valid JSON — no markdown, no commentary, no extra whitespace.",
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("LLM returned an empty response.");

    let report: ContractReport;
    try {
        report = JSON.parse(raw) as ContractReport;
    } catch {
        throw new Error(`LLM response was not valid JSON: ${raw.slice(0, 200)}`);
    }

    for (const field of REQUIRED_FIELDS) {
        if (report[field] === undefined) {
            throw new Error(`LLM response is missing required field: "${field}"`);
        }
    }

    return report;
}
