"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
    Scale, Shield, ShieldAlert, ShieldCheck, FileText,
    Upload, CreditCard, Brain, Check, ArrowLeft,
    Calendar, Users, Globe, Lock, Zap, Eye,
    AlertTriangle, AlertCircle, CheckCircle, XCircle,
    ChevronRight, X, Loader,
} from "lucide-react";
import styles from "./page.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "idle" | "sending" | "paying" | "analyzing" | "done" | "error";
type Severity = "Critical" | "High" | "Medium" | "Low";

interface RiskItem {
    title: string;
    severity: Severity;
    clause: string;
    description: string;
    recommendation: string;
}

interface KeyDate {
    label: string;
    value: string;
}

interface ContractAnalysis {
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

interface ApiResponse {
    analysis: ContractAnalysis;
    meta: {
        walletAddress: string;
        paymentSettlement: string | null;
        backendUrl: string;
        paidAmount: string;
        network: string;
    };
}

// ── Config ────────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
    { key: "sending",   Icon: Upload,      label: "POST /analyze",  desc: "Request sent" },
    { key: "paying",    Icon: CreditCard,  label: "HTTP 402 → Pay", desc: "$0.50 USDC" },
    { key: "analyzing", Icon: Brain,       label: "Groq AI",        desc: "Analyzing" },
    { key: "done",      Icon: CheckCircle, label: "Complete",       desc: "Results ready" },
] as const;

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string; Icon: React.ElementType }> = {
    Critical: { label: "Critical", className: styles.sevCritical, Icon: ShieldAlert },
    High:     { label: "High",     className: styles.sevHigh,     Icon: AlertTriangle },
    Medium:   { label: "Medium",   className: styles.sevMedium,   Icon: AlertCircle },
    Low:      { label: "Low",      className: styles.sevLow,      Icon: Shield },
};

const REC_CONFIG: Record<string, { className: string; Icon: React.ElementType }> = {
    "Safe to Sign":    { className: styles.recSafe,      Icon: ShieldCheck },
    "Review Required": { className: styles.recReview,    Icon: Eye },
    "Negotiate Terms": { className: styles.recNegotiate, Icon: Scale },
    "Do Not Sign":     { className: styles.recDanger,    Icon: XCircle },
};

const FEATURES = [
    {
        Icon: ShieldAlert,
        title: "Instant Risk Identification",
        body: "Upload any contract and get a full risk breakdown — critical clauses, red flags, and missing protections.",
    },
    {
        Icon: Lock,
        title: "Pay-Per-Use Privacy",
        body: "No account, no subscription. Pay $0.50 USDC per analysis. Your contract is never stored.",
    },
    {
        Icon: Zap,
        title: "On-Chain Verification",
        body: "Every payment settles trustlessly on Algorand TestNet via the x402 protocol.",
    },
    {
        Icon: Brain,
        title: "Groq AI Inference",
        body: "Powered by llama-3.3-70b-versatile for fast, accurate legal risk assessment.",
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
    const [step, setStep]           = useState<Step>("idle");
    const [errorMsg, setErrorMsg]   = useState("");
    const [result, setResult]       = useState<ApiResponse | null>(null);
    const [fileName, setFileName]   = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState("");
    const fileRef                   = useRef<HTMLInputElement>(null);
    const fileDataRef               = useRef<File | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        fileDataRef.current = file;
        setFileName(file?.name ?? null);
    }

    function clearFile() {
        fileDataRef.current = null;
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg("");
        setResult(null);

        if (!fileDataRef.current) {
            setErrorMsg("Please upload a contract document (PDF or DOCX).");
            return;
        }

        setStep("sending");
        setStatusMsg("Sending request to server…");

        const form = new FormData();
        form.append("contract", fileDataRef.current);

        await delay(600);
        setStep("paying");
        setStatusMsg("Server returned HTTP 402 — signing USDC payment on Algorand TestNet…");
        await delay(900);

        setStep("analyzing");
        setStatusMsg("Payment verified on-chain. Groq AI is analyzing your contract…");

        let data: ApiResponse;
        try {
            const res = await fetch("/api/analyze", { method: "POST", body: form });
            if (!res.ok) {
                const body = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(body.error ?? `HTTP ${res.status}`);
            }
            data = await res.json();
        } catch (err) {
            setStep("error");
            setErrorMsg(err instanceof Error ? err.message : "Unknown error");
            return;
        }

        setResult(data);
        setStep("done");
        setStatusMsg("Analysis complete.");
    }

    function reset() {
        setStep("idle");
        setResult(null);
        setErrorMsg("");
        setStatusMsg("");
        clearFile();
    }

    const score    = result?.analysis.overallRiskScore ?? 0;
    const isActive = (key: string) => step === key;
    const isDone   = (key: string) => {
        const keys = FLOW_STEPS.map(s => s.key);
        const ci   = keys.indexOf(step as typeof FLOW_STEPS[number]["key"]);
        return ci > keys.indexOf(key as typeof FLOW_STEPS[number]["key"]);
    };

    const showForm    = step === "idle" || step === "error";
    const showLoading = step === "sending" || step === "paying" || step === "analyzing";
    const showResults = step === "done" && result !== null;

    return (
        <div className={styles.page}>

            {/* ── Hero ── */}
            {showForm && (
                <section className={styles.hero}>
                    <div className={styles.heroGlow} aria-hidden />
                    <div className={styles.heroBadge}>
                        <span className={styles.heroBadgeDot} />
                        x402 Protocol · Algorand TestNet
                    </div>
                    <h1 className={styles.heroTitle}>
                        AI Contract
                        <span className={styles.heroHighlight}> Risk Analyzer</span>
                    </h1>
                    <p className={styles.heroSub}>
                        Upload any contract — employment, SaaS, NDA, or service agreement. Pay{" "}
                        <strong className={styles.heroPrice}>$0.50 USDC</strong> on Algorand TestNet
                        and get an instant risk analysis powered by Groq AI.
                        No signup. No monthly fee.
                    </p>
                    <div className={styles.heroActions}>
                        <a href="#analyzer" className={styles.btnPrimary}>
                            Analyze Contract
                            <ChevronRight size={16} />
                        </a>
                        <Link href="/how-it-works" className={styles.btnGhost}>
                            How It Works
                        </Link>
                    </div>
                </section>
            )}

            <main className={styles.main} id="analyzer">

                {/* ── Feature cards ── */}
                {showForm && (
                    <div className={styles.featureGrid}>
                        {FEATURES.map(f => (
                            <div key={f.title} className={styles.featureCard}>
                                <span className={styles.featureIconWrap}>
                                    <f.Icon size={18} strokeWidth={1.75} />
                                </span>
                                <div>
                                    <div className={styles.featureTitle}>{f.title}</div>
                                    <div className={styles.featureBody}>{f.body}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pipeline ── */}
                {!showForm && (
                    <div className={styles.pipeline}>
                        {FLOW_STEPS.map((s, i) => (
                            <div key={s.key} className={styles.pipelineItem}>
                                <div className={[
                                    styles.pipelineStep,
                                    isActive(s.key) ? styles.pipelineActive : "",
                                    isDone(s.key)   ? styles.pipelineDone   : "",
                                ].join(" ")}>
                                    <s.Icon size={18} strokeWidth={1.75} className={styles.pipelineIcon} />
                                    <span className={styles.pipelineLabel}>{s.label}</span>
                                    <span className={styles.pipelineDesc}>{s.desc}</span>
                                </div>
                                {i < FLOW_STEPS.length - 1 && (
                                    <div className={[
                                        styles.pipelineConnector,
                                        isDone(s.key) ? styles.pipelineConnectorDone : "",
                                    ].join(" ")} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Status / error messages ── */}
                {statusMsg && showLoading && (
                    <div className={styles.statusInfo}>
                        <Loader size={15} className={styles.spinnerIcon} />
                        <span>{statusMsg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className={styles.statusError}>
                        <AlertCircle size={15} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* ── Upload form ── */}
                {showForm && (
                    <div className={styles.analyzerCard} id="analyzer-form">
                        <div className={styles.analyzerHeader}>
                            <Scale size={20} strokeWidth={1.75} className={styles.analyzerHeaderIcon} />
                            <div>
                                <h2 className={styles.analyzerTitle}>Analyze Your Contract</h2>
                                <p className={styles.analyzerSub}>
                                    Upload a PDF or DOCX contract to identify risks, red flags, and missing clauses
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Contract Document
                                    <span className={styles.labelHint}>PDF or DOCX, max 10 MB</span>
                                </label>

                                <input
                                    ref={fileRef}
                                    id="contract-file-input"
                                    type="file"
                                    accept=".pdf,.docx"
                                    className={styles.fileInputHidden}
                                    onChange={handleFileChange}
                                />

                                <label
                                    htmlFor="contract-file-input"
                                    className={`${styles.dropzone} ${fileName ? styles.dropzoneHasFile : ""}`}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const f = e.dataTransfer.files[0];
                                        if (f) { fileDataRef.current = f; setFileName(f.name); }
                                    }}
                                >
                                    {fileName ? (
                                        <div className={styles.filePreview}>
                                            <FileText size={20} strokeWidth={1.75} className={styles.filePreviewIcon} />
                                            <span className={styles.filePreviewName}>{fileName}</span>
                                            <button
                                                type="button"
                                                className={styles.clearBtn}
                                                onClick={e => { e.stopPropagation(); clearFile(); }}
                                                aria-label="Remove file"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.dropzoneContent}>
                                            <div className={styles.dropzoneIconWrap}>
                                                <Upload size={22} strokeWidth={1.5} />
                                            </div>
                                            <p className={styles.dropzoneText}>
                                                Drag & drop your contract or{" "}
                                                <span className={styles.dropzoneLink}>browse files</span>
                                            </p>
                                            <p className={styles.dropzoneHint}>
                                                Employment · SaaS · NDA · Service Agreement
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className={styles.formFooter}>
                                <button type="submit" className={styles.btnPrimary}>
                                    <Scale size={16} strokeWidth={2} />
                                    Analyze Contract
                                </button>
                                <div className={styles.costNote}>
                                    <span className={styles.costBadge}>$0.50 USDC</span>
                                    <span className={styles.costText}>
                                        Algorand TestNet · Groq AI
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Loading ── */}
                {showLoading && (
                    <div className={styles.loadingCard}>
                        <div className={styles.loadingSpinner} />
                        <div className={styles.loadingText}>
                            <strong>Analyzing your contract</strong>
                            <span>{statusMsg}</span>
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                {showResults && (
                    <div className={styles.results}>

                        {/* Payment proof */}
                        <div className={styles.paymentProof}>
                            <div className={styles.proofLeft}>
                                <span className={styles.proofCheck}>
                                    <Check size={13} strokeWidth={2.5} />
                                </span>
                                <div>
                                    <div className={styles.proofTitle}>Payment Settled On-Chain</div>
                                    <div className={styles.proofSub}>
                                        Algorand TestNet · USDC · {result!.meta.paidAmount}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.proofAddress}>
                                <span className={styles.proofAddressLabel}>Wallet</span>
                                <code className={styles.proofAddressValue}>
                                    {result!.meta.walletAddress?.slice(0, 16)}…
                                </code>
                            </div>
                        </div>

                        <h2 className={styles.resultsHeading}>Contract Risk Analysis</h2>

                        {/* Risk score + meta */}
                        <div className={styles.scoreSection}>
                            <div className={styles.scoreRingWrap}>
                                <RiskRing score={score} />
                            </div>
                            <div className={styles.metaCards}>
                                <MetaCard
                                    Icon={FileText}
                                    label="Contract Type"
                                    value={result!.analysis.contractType}
                                />
                                <VerdictCard recommendation={result!.analysis.recommendation} />
                                <MetaCard
                                    Icon={Globe}
                                    label="Jurisdiction"
                                    value={result!.analysis.jurisdiction}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <ResultCard title="Summary" Icon={FileText}>
                            <p className={styles.summaryText}>{result!.analysis.summary}</p>
                        </ResultCard>

                        {/* Parties */}
                        {result!.analysis.parties?.length > 0 && (
                            <ResultCard title="Parties" Icon={Users}>
                                <div className={styles.tagList}>
                                    {result!.analysis.parties.map(p => (
                                        <span key={p} className={`${styles.tag} ${styles.tagNeutral}`}>{p}</span>
                                    ))}
                                </div>
                            </ResultCard>
                        )}

                        {/* Key dates */}
                        {result!.analysis.keyDates?.length > 0 && (
                            <ResultCard title="Key Dates & Deadlines" Icon={Calendar}>
                                <div className={styles.keyDatesGrid}>
                                    {result!.analysis.keyDates.map((d, i) => (
                                        <div key={i} className={styles.keyDateCard}>
                                            <span className={styles.keyDateLabel}>{d.label}</span>
                                            <span className={styles.keyDateValue}>{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </ResultCard>
                        )}

                        {/* Identified risks */}
                        <ResultCard
                            title={`Identified Risks`}
                            Icon={ShieldAlert}
                            count={result!.analysis.risks?.length ?? 0}
                        >
                            {result!.analysis.risks?.length > 0 ? (
                                <div className={styles.riskList}>
                                    {result!.analysis.risks.map((risk, i) => (
                                        <RiskCard key={i} risk={risk} />
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyState}>No significant risks identified.</p>
                            )}
                        </ResultCard>

                        {/* Favorable terms + Missing clauses */}
                        <div className={styles.twoCol}>
                            <ResultCard title="Favorable Terms" Icon={CheckCircle}>
                                <TagList
                                    items={result!.analysis.favorableTerms}
                                    variant="success"
                                    emptyText="None identified"
                                />
                            </ResultCard>
                            <ResultCard title="Missing Clauses" Icon={XCircle}>
                                <TagList
                                    items={result!.analysis.missingClauses}
                                    variant="danger"
                                    emptyText="None identified"
                                />
                            </ResultCard>
                        </div>

                        <button className={styles.btnOutline} onClick={reset}>
                            <ArrowLeft size={15} />
                            Analyze Another Contract
                        </button>
                    </div>
                )}
            </main>

            {/* ── Footer ── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <Scale size={16} className={styles.footerLogo} />
                        <span>ContractRisk<strong>AI</strong></span>
                        <span className={styles.footerSep} />
                        <span className={styles.footerTagline}>Pay-per-use · No account · On-chain verified</span>
                    </div>
                    <div className={styles.footerLinks}>
                        <a href="https://x402.org" target="_blank" rel="noopener">x402 Protocol</a>
                        <a href="https://algorand.co" target="_blank" rel="noopener">Algorand</a>
                        <a href="https://groq.com" target="_blank" rel="noopener">Groq AI</a>
                        <Link href="/how-it-works">How It Works</Link>
                        <Link href="/about">About</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RiskRing({ score }: { score: number }) {
    const r = 52;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (circumference * score) / 100;

    const { color, label } =
        score >= 76 ? { color: "var(--danger)",  label: "Critical Risk" } :
        score >= 51 ? { color: "var(--warning)", label: "High Risk"      } :
        score >= 21 ? { color: "var(--caution)", label: "Moderate Risk"  } :
                      { color: "var(--success)", label: "Low Risk"       };

    return (
        <div className={styles.scoreRing}>
            <svg viewBox="0 0 130 130" className={styles.ringSvg} aria-label={`Risk score: ${score}/100`}>
                <circle cx="65" cy="65" r={r} className={styles.ringTrack} />
                <circle
                    cx="65" cy="65" r={r}
                    className={styles.ringProgress}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: color }}
                />
            </svg>
            <div className={styles.scoreInner}>
                <span className={styles.scoreNum} style={{ color }}>{score}</span>
                <span className={styles.scoreUnit}>/ 100</span>
                <span className={styles.scoreLabel}>{label}</span>
            </div>
        </div>
    );
}

function VerdictCard({ recommendation }: { recommendation: string }) {
    const cfg = REC_CONFIG[recommendation] ?? { className: styles.recReview, Icon: Eye };
    return (
        <div className={`${styles.metaCard} ${styles.metaCardVerdict}`}>
            <span className={styles.metaLabel}>Verdict</span>
            <span className={`${styles.verdictValue} ${cfg.className}`}>
                <cfg.Icon size={14} strokeWidth={2} />
                {recommendation}
            </span>
        </div>
    );
}

function MetaCard({ label, value, Icon }: { label: string; value: string; Icon: React.ElementType }) {
    return (
        <div className={styles.metaCard}>
            <span className={styles.metaLabel}>{label}</span>
            <span className={styles.metaValue}>
                <Icon size={13} strokeWidth={1.75} className={styles.metaValueIcon} />
                {value}
            </span>
        </div>
    );
}

function ResultCard({
    title,
    Icon,
    count,
    children,
}: {
    title: string;
    Icon: React.ElementType;
    count?: number;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.resultCard}>
            <div className={styles.resultCardHeader}>
                <Icon size={16} strokeWidth={1.75} className={styles.resultCardIcon} />
                <h3 className={styles.resultCardTitle}>{title}</h3>
                {count !== undefined && (
                    <span className={styles.resultCardCount}>{count}</span>
                )}
            </div>
            {children}
        </div>
    );
}

function RiskCard({ risk }: { risk: RiskItem }) {
    const sev = SEVERITY_CONFIG[risk.severity] ?? SEVERITY_CONFIG.Low;
    return (
        <div className={`${styles.riskCard} ${sev.className}`}>
            <div className={styles.riskCardHeader}>
                <span className={styles.riskSeverityBadge}>
                    <sev.Icon size={12} strokeWidth={2} />
                    {risk.severity}
                </span>
                <span className={styles.riskTitle}>{risk.title}</span>
                {risk.clause && (
                    <span className={styles.riskClause}>{risk.clause}</span>
                )}
            </div>
            <p className={styles.riskDescription}>{risk.description}</p>
            <div className={styles.riskRec}>
                <Check size={13} strokeWidth={2.5} className={styles.riskRecIcon} />
                <span>{risk.recommendation}</span>
            </div>
        </div>
    );
}

function TagList({
    items,
    variant,
    emptyText,
}: {
    items: string[];
    variant: "success" | "danger" | "neutral";
    emptyText: string;
}) {
    if (!items || items.length === 0) {
        return <p className={styles.emptyState}>{emptyText}</p>;
    }
    return (
        <div className={styles.tagList}>
            {items.map(s => (
                <span key={s} className={`${styles.tag} ${styles[`tag_${variant}`]}`}>{s}</span>
            ))}
        </div>
    );
}

function delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
