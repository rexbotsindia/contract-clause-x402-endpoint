/**
 * Groq service - sends contract text to Groq and returns structured risk analysis JSON.
 */
import Groq from "groq-sdk";
import { buildContractRiskPrompt } from "../prompts/atsPrompt.js";

export interface RiskItem {
    title: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    clause: string;
    description: string;
    recommendation: string;
}

export interface KeyDate {
    label: string;
    value: string;
}

export interface ContractAnalysis {
    overallRiskScore: number;
    contractType: string;
    summary: string;
    risks: RiskItem[];
    favorableTerms: string[];
    missingClauses: string[];
    keyDates: KeyDate[];
    parties: string[];
    jurisdiction: string;
    recommendation: string;
}

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set.");
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

/**
 * Run contract risk analysis via Groq.
 * Uses llama-3.3-70b-versatile for high-quality structured output.
 */
export async function analyzeWithGroq(contractText: string): Promise<ContractAnalysis> {
    const client = getGroqClient();
    const prompt = buildContractRiskPrompt(contractText);

    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content:
                    "You are a precise legal contract risk analysis engine. Return ONLY valid JSON with no markdown, no commentary, no extra whitespace outside the JSON.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Groq returned an empty response.");

    let parsed: ContractAnalysis;
    try {
        parsed = JSON.parse(raw) as ContractAnalysis;
    } catch {
        throw new Error(`Groq response was not valid JSON: ${raw.slice(0, 200)}`);
    }

    // Validate required fields
    const required: (keyof ContractAnalysis)[] = [
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
    for (const field of required) {
        if (parsed[field] === undefined) {
            throw new Error(`Groq response is missing required field: ${field}`);
        }
    }

    return parsed;
}
