"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
    Scale, ShieldAlert, ShieldCheck, ShieldOff, Shield,
    FileText, Upload, CreditCard, Cpu, CheckCircle2,
    ArrowLeft, CalendarDays, Users2, MapPin, AlertTriangle,
    AlertCircle, Info, CircleCheck, XCircle, ChevronRight,
    X, Loader2, TrendingDown, TriangleAlert, ExternalLink,
    Copy, Check,
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
interface KeyDate { label: string; value: string; }
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
        txId: string | null;
        fromAddress: string | null;
        toAddress: string | null;
        timestamp: string;
    };
}

// ── Config ────────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
    { key: "sending",   Icon: Upload,       label: "Request",  desc: "POST /analyze"    },
    { key: "paying",    Icon: CreditCard,   label: "Payment",  desc: "HTTP 402 · USDC"  },
    { key: "analyzing", Icon: Cpu,          label: "Analysis", desc: "Groq AI"           },
    { key: "done",      Icon: CheckCircle2, label: "Report",   desc: "Ready"             },
] as const;

const SEV: Record<Severity, { Icon: React.ElementType; cls: string; bar: string }> = {
    Critical: { Icon: ShieldOff,      cls: styles.sevCritical, bar: styles.barCritical },
    High:     { Icon: TriangleAlert,  cls: styles.sevHigh,     bar: styles.barHigh     },
    Medium:   { Icon: AlertCircle,    cls: styles.sevMedium,   bar: styles.barMedium   },
    Low:      { Icon: Info,           cls: styles.sevLow,      bar: styles.barLow      },
};

const REC: Record<string, { Icon: React.ElementType; cls: string }> = {
    "Safe to Sign":    { Icon: ShieldCheck, cls: styles.recSafe      },
    "Review Required": { Icon: AlertCircle, cls: styles.recReview    },
    "Negotiate Terms": { Icon: Scale,       cls: styles.recNegotiate },
    "Do Not Sign":     { Icon: ShieldOff,   cls: styles.recDanger    },
};

const WHY = [
    { Icon: TrendingDown,  heading: "Spot hidden risks instantly",   body: "AI surfaces critical clauses, one-sided terms, and missing protections before you sign." },
    { Icon: Scale,         heading: "Understand what you're signing", body: "Plain-English breakdown of obligations, deadlines, and jurisdiction - no legal jargon." },
    { Icon: ShieldAlert,   heading: "Know what's missing",           body: "Identifies absent standard clauses that leave you exposed - like liability caps or IP ownership." },
    { Icon: CreditCard,    heading: "Pay once, own nothing",         body: "No account, no monthly fee. $1.00 USDC per analysis settled on-chain via x402." },
];

const SAMPLES = [
    { file: "1_AgriTech_CropMonitoring.docx",          label: "AgriTech",     title: "Crop Monitoring Agreement",      industry: "Agriculture"   },
    { file: "2_FinTech_PaymentsPlatform.docx",         label: "FinTech",      title: "Payments Platform Agreement",    industry: "Finance"       },
    { file: "3_HealthTech_TelemedicinePlatform.docx",  label: "HealthTech",   title: "Telemedicine Platform Agreement",industry: "Healthcare"    },
    { file: "4_EdTech_LearningPlatform.docx",          label: "EdTech",       title: "Learning Platform Agreement",    industry: "Education"     },
    { file: "5_CleanTech_SolarGridMonitoring.docx",    label: "CleanTech",    title: "Solar Grid Monitoring Agreement",industry: "Energy"        },
    { file: "6_LogisticsTech_FleetOptimization.docx",  label: "LogisticsTech",title: "Fleet Optimization Agreement",   industry: "Logistics"     },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
    const [step, setStep]         = useState<Step>("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [result, setResult]     = useState<ApiResponse | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState("");
    const [loadingSample, setLoadingSample] = useState<string | null>(null);
    const fileRef     = useRef<HTMLInputElement>(null);
    const fileDataRef = useRef<File | null>(null);

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

    async function handleSampleClick(sample: typeof SAMPLES[number]) {
        setLoadingSample(sample.file);
        try {
            const res = await fetch(`/${sample.file}`);
            const blob = await res.blob();
            const file = new File([blob], sample.file, {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            fileDataRef.current = file;
            setFileName(file.name);
            setErrorMsg("");
            // Scroll to upload section
            document.getElementById("upload")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
            setErrorMsg("Failed to load sample file. Please try again.");
        } finally {
            setLoadingSample(null);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg("");
        setResult(null);
        if (!fileDataRef.current) { setErrorMsg("Please upload a contract document (PDF or DOCX)."); return; }

        setStep("sending"); setStatusMsg("Connecting to server…");
        const form = new FormData();
        form.append("contract", fileDataRef.current);
        await delay(600);

        setStep("paying"); setStatusMsg("HTTP 402 received - signing USDC payment on Algorand TestNet…");
        await delay(900);

        setStep("analyzing"); setStatusMsg("Payment confirmed on-chain - AI analysis in progress…");

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
        setResult(data); setStep("done"); setStatusMsg("Done.");
    }

    function reset() {
        setStep("idle"); setResult(null); setErrorMsg(""); setStatusMsg(""); clearFile();
    }

    const score    = result?.analysis.overallRiskScore ?? 0;
    const isActive = (key: string) => step === key;
    const isDone   = (key: string) => {
        const keys = FLOW_STEPS.map(s => s.key);
        return keys.indexOf(step as typeof FLOW_STEPS[number]["key"]) >
               keys.indexOf(key as typeof FLOW_STEPS[number]["key"]);
    };

    const showForm    = step === "idle" || step === "error";
    const showLoading = step === "sending" || step === "paying" || step === "analyzing";
    const showResults = step === "done" && result !== null;

    return (
        <div className={styles.page}>

            {/* ─── LANDING ─────────────────────────────────────────────── */}
            {showForm && (
                <>
                    {/* Split hero */}
                    <section className={styles.split}>
                        <div className={styles.splitLeft}>
                            <div className={styles.splitTag}>
                                AI · x402 · Algorand TestNet
                            </div>
                            <h1 className={styles.splitTitle}>
                                Review contracts.<br />
                                Find the risks.<br />
                                <span className={styles.splitAccent}>Before you sign.</span>
                            </h1>
                            <p className={styles.splitBody}>
                                Upload any employment, SaaS, NDA, or service contract.
                                Pay <strong>$1.00 USDC</strong> on-chain and receive an
                                AI-generated risk report in seconds - no account needed.
                            </p>
                            <div className={styles.splitCta}>
                                <a href="#upload" className={styles.btnPrimary}>
                                    Upload a contract
                                    <ChevronRight size={15} />
                                </a>
                                <Link href="/how-it-works" className={styles.btnText}>
                                    How payments work →
                                </Link>
                            </div>
                            <div className={styles.splitStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>$1.00</span>
                                    <span className={styles.statLabel}>per analysis</span>
                                </div>
                                <div className={styles.statDiv} />
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>&lt; 30s</span>
                                    <span className={styles.statLabel}>results</span>
                                </div>
                                <div className={styles.statDiv} />
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>0</span>
                                    <span className={styles.statLabel}>stored files</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.splitRight}>
                            {/* Mock report preview */}
                            <div className={styles.mockReport}>
                                <div className={styles.mockHeader}>
                                    <FileText size={14} strokeWidth={1.75} />
                                    <span>Employment Agreement.pdf</span>
                                    <span className={styles.mockBadge}>Risk Report</span>
                                </div>
                                <div className={styles.mockScore}>
                                    <span className={styles.mockScoreNum}>74</span>
                                    <div className={styles.mockScoreRight}>
                                        <span className={styles.mockScoreLabel}>Risk Score</span>
                                        <div className={styles.mockBar}>
                                            <div className={styles.mockBarFill} style={{ width: "74%" }} />
                                        </div>
                                        <span className={styles.mockScoreVerdict}>⚠ Negotiate Terms</span>
                                    </div>
                                </div>
                                <div className={styles.mockRisks}>
                                    {[
                                        { sev: "Critical", text: "Overly broad IP assignment clause" },
                                        { sev: "High",     text: "Non-compete covers 36 months" },
                                        { sev: "Medium",   text: "No limitation of liability cap" },
                                    ].map(r => (
                                        <div key={r.text} className={`${styles.mockRisk} ${styles[`mock_${r.sev.toLowerCase()}`]}`}>
                                            <span className={styles.mockRiskSev}>{r.sev}</span>
                                            <span className={styles.mockRiskText}>{r.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.mockFooter}>
                                    <span>3 risks · 2 favorable terms · 4 missing clauses</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Why section */}
                    <section className={styles.why}>
                        <div className={styles.whyInner}>
                            {WHY.map(w => (
                                <div key={w.heading} className={styles.whyItem}>
                                    <w.Icon size={18} strokeWidth={1.75} className={styles.whyIcon} />
                                    <div>
                                        <div className={styles.whyHeading}>{w.heading}</div>
                                        <div className={styles.whyBody}>{w.body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sample agreements */}
                    <section className={styles.samples}>
                        <div className={styles.samplesInner}>
                            <div className={styles.samplesHeader}>
                                <div>
                                    <h2 className={styles.samplesTitle}>Try a sample agreement</h2>
                                    <p className={styles.samplesSub}>
                                        No contract on hand? Pick one of these real-world agreements to see the analyzer in action.
                                    </p>
                                </div>
                                <a href="#upload" className={styles.samplesScroll}>
                                    Or upload your own <ChevronRight size={13} />
                                </a>
                            </div>
                            <div className={styles.samplesGrid}>
                                {SAMPLES.map(s => (
                                    <button
                                        key={s.file}
                                        className={styles.sampleCard}
                                        onClick={() => handleSampleClick(s)}
                                        disabled={loadingSample !== null}
                                    >
                                        <div className={styles.sampleCardTop}>
                                            <span className={styles.sampleIndustry}>{s.industry}</span>
                                            {loadingSample === s.file
                                                ? <Loader2 size={14} className={styles.sampleSpinner} />
                                                : <FileText size={14} className={styles.sampleFileIcon} />
                                            }
                                        </div>
                                        <div className={styles.sampleLabel}>{s.label}</div>
                                        <div className={styles.sampleTitle}>{s.title}</div>
                                        <div className={styles.sampleAction}>
                                            {loadingSample === s.file ? "Loading…" : "Use this sample →"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ─── MAIN CONTENT AREA ───────────────────────────────────── */}
            <main className={styles.main} id="upload">

                {/* Progress bar - shown while processing */}
                {!showForm && (
                    <div className={styles.progressBar}>
                        {FLOW_STEPS.map((s, i) => (
                            <div key={s.key} className={styles.progressItem}>
                                <div className={`${styles.progressStep} ${isActive(s.key) ? styles.progressActive : ""} ${isDone(s.key) ? styles.progressDone : ""}`}>
                                    {isDone(s.key)
                                        ? <CircleCheck size={14} strokeWidth={2.5} />
                                        : isActive(s.key)
                                            ? <Loader2 size={14} className={styles.spin} />
                                            : <s.Icon size={14} strokeWidth={1.75} />
                                    }
                                    <span>{s.label}</span>
                                </div>
                                {i < FLOW_STEPS.length - 1 && (
                                    <div className={`${styles.progressLine} ${isDone(s.key) ? styles.progressLineDone : ""}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {errorMsg && (
                    <div className={styles.alertError}>
                        <AlertTriangle size={15} strokeWidth={2} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Upload panel */}
                {showForm && (
                    <div className={styles.uploadPanel} id="analyzer-form">
                        <div className={styles.uploadPanelLeft}>
                            <h2 className={styles.uploadTitle}>Upload your contract</h2>
                            <p className={styles.uploadSub}>
                                Accepts PDF or DOCX. Your file is processed in memory
                                and never written to disk or stored.
                            </p>

                            <ul className={styles.uploadChecklist}>
                                {["Employment agreements", "SaaS & software licenses", "NDAs & confidentiality", "Service & consulting agreements", "Lease agreements"].map(t => (
                                    <li key={t} className={styles.uploadCheckItem}>
                                        <CircleCheck size={13} strokeWidth={2.5} className={styles.uploadCheckIcon} />
                                        {t}
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.priceLine}>
                                <CreditCard size={14} strokeWidth={1.75} />
                                <span><strong>$1.00 USDC</strong> per analysis · Algorand TestNet · x402</span>
                            </div>
                        </div>

                        <div className={styles.uploadPanelRight}>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <input
                                    ref={fileRef}
                                    id="contract-file"
                                    type="file"
                                    accept=".pdf,.docx"
                                    className={styles.fileInputHidden}
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="contract-file"
                                    className={`${styles.dropzone} ${fileName ? styles.dropzoneActive : ""}`}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const f = e.dataTransfer.files[0];
                                        if (f) { fileDataRef.current = f; setFileName(f.name); }
                                    }}
                                >
                                    {fileName ? (
                                        <div className={styles.fileChosen}>
                                            <FileText size={28} strokeWidth={1.5} className={styles.fileChosenIcon} />
                                            <span className={styles.fileChosenName}>{fileName}</span>
                                            <span className={styles.fileChosenSub}>Click to replace</span>
                                            <button
                                                type="button"
                                                className={styles.fileClearBtn}
                                                onClick={e => { e.stopPropagation(); clearFile(); }}
                                                aria-label="Remove file"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.dropzoneIdle}>
                                            <div className={styles.dropzoneIconBox}>
                                                <Upload size={24} strokeWidth={1.5} />
                                            </div>
                                            <span className={styles.dropzoneTitle}>
                                                Drop your contract here
                                            </span>
                                            <span className={styles.dropzoneSub}>
                                                or <span className={styles.dropzoneLink}>browse files</span>
                                            </span>
                                            <span className={styles.dropzoneHint}>PDF · DOCX · max 10 MB</span>
                                        </div>
                                    )}
                                </label>

                                <button type="submit" className={styles.btnSubmit}>
                                    <Scale size={16} strokeWidth={2} />
                                    Analyze for $1.00 USDC
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {showLoading && (
                    <div className={styles.loadingPanel}>
                        <div className={styles.loadingDots}>
                            <span /><span /><span />
                        </div>
                        <p className={styles.loadingTitle}>Analyzing your contract</p>
                        <p className={styles.loadingMsg}>{statusMsg}</p>
                    </div>
                )}

                {/* Results */}
                {showResults && (
                    <ReportView result={result!} onReset={reset} />
                )}
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <span className={styles.footerBrand}>
                        <Scale size={13} strokeWidth={2.5} />
                        ContractLens
                    </span>
                    <span className={styles.footerMid}>
                        Pay-per-use · Documents never stored · Powered by Groq AI
                    </span>
                    <div className={styles.footerLinks}>
                        <a href="https://x402.org" target="_blank" rel="noopener">x402</a>
                        <a href="https://algorand.co" target="_blank" rel="noopener">Algorand</a>
                        <a href="https://groq.com" target="_blank" rel="noopener">Groq</a>
                        <Link href="/how-it-works">How It Works</Link>
                        <Link href="/about">About</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ── Report view (extracted for readability) ───────────────────────────────────

function ReportView({ result, onReset }: { result: ApiResponse; onReset: () => void }) {
    const { analysis, meta } = result;
    const score = analysis.overallRiskScore;

    const scoreColor =
        score >= 76 ? "var(--sev-critical)" :
        score >= 51 ? "var(--sev-high)"     :
        score >= 21 ? "var(--sev-medium)"   :
                      "var(--sev-low)";

    const scoreLabel =
        score >= 76 ? "Critical Risk" :
        score >= 51 ? "High Risk"     :
        score >= 21 ? "Moderate Risk" :
                      "Low Risk";

    const rec = REC[analysis.recommendation] ?? REC["Review Required"];

    return (
        <div className={styles.report}>

            {/* Payment receipt */}
            <PaymentReceipt meta={meta} />

            {/* Report header */}
            <div className={styles.reportHeader}>
                <div className={styles.reportHeaderLeft}>
                    <div className={styles.reportLabel}>Contract Risk Report</div>
                    <h2 className={styles.reportTitle}>{analysis.contractType}</h2>
                    <div className={styles.reportMeta}>
                        {analysis.jurisdiction !== "Not specified" && (
                            <span className={styles.reportMetaItem}>
                                <MapPin size={11} strokeWidth={2} />
                                {analysis.jurisdiction}
                            </span>
                        )}
                        {analysis.parties?.length > 0 && (
                            <span className={styles.reportMetaItem}>
                                <Users2 size={11} strokeWidth={2} />
                                {analysis.parties.join(" · ")}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.reportHeaderRight}>
                    {/* Score bar */}
                    <div className={styles.scoreBlock}>
                        <div className={styles.scoreTop}>
                            <span className={styles.scoreNum} style={{ color: scoreColor }}>{score}</span>
                            <span className={styles.scoreMax}>/100</span>
                        </div>
                        <div className={styles.scoreTrack}>
                            <div className={styles.scoreFill} style={{ width: `${score}%`, background: scoreColor }} />
                        </div>
                        <span className={styles.scoreLabel} style={{ color: scoreColor }}>{scoreLabel}</span>
                    </div>

                    {/* Verdict */}
                    <div className={`${styles.verdictBadge} ${rec.cls}`}>
                        <rec.Icon size={13} strokeWidth={2} />
                        {analysis.recommendation}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className={styles.summaryBox}>
                <p className={styles.summaryText}>{analysis.summary}</p>
            </div>

            {/* Two-column body */}
            <div className={styles.reportBody}>

                {/* LEFT - risks */}
                <div className={styles.reportMain}>
                    <div className={styles.sectionHead}>
                        <ShieldAlert size={15} strokeWidth={2} />
                        <span>Identified Risks</span>
                        <span className={styles.sectionCount}>{analysis.risks?.length ?? 0}</span>
                    </div>

                    {analysis.risks?.length > 0 ? (
                        <div className={styles.riskTable}>
                            {analysis.risks.map((risk, i) => {
                                const s = SEV[risk.severity] ?? SEV.Low;
                                return (
                                    <div key={i} className={`${styles.riskRow} ${s.cls}`}>
                                        <div className={styles.riskRowTop}>
                                            <span className={styles.riskSevBadge}>
                                                <s.Icon size={11} strokeWidth={2.5} />
                                                {risk.severity}
                                            </span>
                                            <span className={styles.riskRowTitle}>{risk.title}</span>
                                            {risk.clause && (
                                                <span className={styles.riskClause}>{risk.clause}</span>
                                            )}
                                        </div>
                                        <p className={styles.riskDesc}>{risk.description}</p>
                                        <div className={styles.riskRec}>
                                            <ChevronRight size={11} strokeWidth={2.5} className={styles.riskRecIcon} />
                                            {risk.recommendation}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={styles.empty}>No significant risks found.</p>
                    )}
                </div>

                {/* RIGHT - sidebar */}
                <aside className={styles.reportSide}>

                    {/* Key dates */}
                    {analysis.keyDates?.length > 0 && (
                        <div className={styles.sideCard}>
                            <div className={styles.sideCardHead}>
                                <CalendarDays size={13} strokeWidth={2} />
                                Key Dates
                            </div>
                            {analysis.keyDates.map((d, i) => (
                                <div key={i} className={styles.dateRow}>
                                    <span className={styles.dateLabel}>{d.label}</span>
                                    <span className={styles.dateValue}>{d.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Favorable terms */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardHead}>
                            <CircleCheck size={13} strokeWidth={2} className={styles.headGreen} />
                            Favorable Terms
                        </div>
                        {analysis.favorableTerms?.length > 0 ? (
                            <ul className={styles.sideList}>
                                {analysis.favorableTerms.map(t => (
                                    <li key={t} className={styles.sideListItem}>
                                        <span className={styles.sideListDot} style={{ background: "var(--success)" }} />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className={styles.empty}>None identified.</p>}
                    </div>

                    {/* Missing clauses */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardHead}>
                            <XCircle size={13} strokeWidth={2} className={styles.headRed} />
                            Missing Clauses
                        </div>
                        {analysis.missingClauses?.length > 0 ? (
                            <ul className={styles.sideList}>
                                {analysis.missingClauses.map(t => (
                                    <li key={t} className={styles.sideListItem}>
                                        <span className={styles.sideListDot} style={{ background: "var(--danger)" }} />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className={styles.empty}>None identified.</p>}
                    </div>

                </aside>
            </div>

            <button className={styles.btnBack} onClick={onReset}>
                <ArrowLeft size={14} />
                Analyze another contract
            </button>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── PaymentReceipt component ──────────────────────────────────────────────────

type MetaShape = ApiResponse["meta"];

function PaymentReceipt({ meta }: { meta: MetaShape }) {
    const [copied, setCopied] = useState<string | null>(null);

    function copy(value: string, key: string) {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    // Build Lora explorer URLs (Algorand TestNet)
    const loraBase = "https://lora.algokit.io/testnet";
    const txUrl    = meta.txId        ? `${loraBase}/transaction/${meta.txId}`          : null;
    const fromUrl  = meta.fromAddress ? `${loraBase}/account/${meta.fromAddress}`       : null;
    const toUrl    = meta.toAddress   ? `${loraBase}/account/${meta.toAddress}`         : null;

    const formattedTime = meta.timestamp
        ? new Date(meta.timestamp).toLocaleString(undefined, {
              dateStyle: "medium", timeStyle: "medium",
          })
        : null;

    return (
        <div className={styles.receipt}>
            {/* Receipt header */}
            <div className={styles.receiptHeader}>
                <div className={styles.receiptHeaderLeft}>
                    <div className={styles.receiptStatus}>
                        <CircleCheck size={16} strokeWidth={2.5} className={styles.receiptStatusIcon} />
                        <span>Payment Confirmed On-Chain</span>
                    </div>
                    <div className={styles.receiptSubtitle}>
                        Algorand TestNet · USDC · {meta.paidAmount} · x402 Protocol
                    </div>
                </div>
                {txUrl && (
                    <a
                        href={txUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.receiptLoraBtn}
                    >
                        <ExternalLink size={13} strokeWidth={2} />
                        View on Lora Explorer
                    </a>
                )}
            </div>

            {/* Receipt rows */}
            <div className={styles.receiptGrid}>

                {/* Transaction ID */}
                <div className={styles.receiptRow}>
                    <span className={styles.receiptKey}>Transaction ID</span>
                    <div className={styles.receiptVal}>
                        {meta.txId ? (
                            <>
                                <code className={styles.receiptCode}>{meta.txId}</code>
                                <button
                                    className={styles.receiptCopy}
                                    onClick={() => copy(meta.txId!, "txId")}
                                    title="Copy transaction ID"
                                >
                                    {copied === "txId"
                                        ? <Check size={12} strokeWidth={2.5} className={styles.receiptCopied} />
                                        : <Copy size={12} strokeWidth={2} />
                                    }
                                </button>
                                <a
                                    href={txUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.receiptExtLink}
                                    title="View transaction on Lora"
                                >
                                    <ExternalLink size={11} strokeWidth={2} />
                                </a>
                            </>
                        ) : (
                            <span className={styles.receiptPending}>Pending confirmation</span>
                        )}
                    </div>
                </div>

                {/* From address */}
                <div className={styles.receiptRow}>
                    <span className={styles.receiptKey}>From (Payer)</span>
                    <div className={styles.receiptVal}>
                        {meta.fromAddress ? (
                            <>
                                <code className={styles.receiptCode}>{meta.fromAddress}</code>
                                <button
                                    className={styles.receiptCopy}
                                    onClick={() => copy(meta.fromAddress!, "from")}
                                    title="Copy address"
                                >
                                    {copied === "from"
                                        ? <Check size={12} strokeWidth={2.5} className={styles.receiptCopied} />
                                        : <Copy size={12} strokeWidth={2} />
                                    }
                                </button>
                                {fromUrl && (
                                    <a
                                        href={fromUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.receiptExtLink}
                                        title="View account on Lora"
                                    >
                                        <ExternalLink size={11} strokeWidth={2} />
                                    </a>
                                )}
                            </>
                        ) : (
                            <span className={styles.receiptPending}>—</span>
                        )}
                    </div>
                </div>

                {/* To address */}
                {meta.toAddress && (
                    <div className={styles.receiptRow}>
                        <span className={styles.receiptKey}>To (Merchant)</span>
                        <div className={styles.receiptVal}>
                            <code className={styles.receiptCode}>{meta.toAddress}</code>
                            <button
                                className={styles.receiptCopy}
                                onClick={() => copy(meta.toAddress!, "to")}
                                title="Copy address"
                            >
                                {copied === "to"
                                    ? <Check size={12} strokeWidth={2.5} className={styles.receiptCopied} />
                                    : <Copy size={12} strokeWidth={2} />
                                }
                            </button>
                            {toUrl && (
                                <a
                                    href={toUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.receiptExtLink}
                                    title="View account on Lora"
                                >
                                    <ExternalLink size={11} strokeWidth={2} />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Amount + timestamp */}
                <div className={styles.receiptRow}>
                    <span className={styles.receiptKey}>Amount</span>
                    <div className={styles.receiptVal}>
                        <span className={styles.receiptAmount}>{meta.paidAmount}</span>
                    </div>
                </div>

                {formattedTime && (
                    <div className={styles.receiptRow}>
                        <span className={styles.receiptKey}>Timestamp</span>
                        <div className={styles.receiptVal}>
                            <span className={styles.receiptMono}>{formattedTime}</span>
                        </div>
                    </div>
                )}

                <div className={styles.receiptRow}>
                    <span className={styles.receiptKey}>Network</span>
                    <div className={styles.receiptVal}>
                        <span className={styles.receiptMono}>{meta.network}</span>
                    </div>
                </div>
            </div>

            {/* Raw settlement data (collapsed by default) */}
            {meta.paymentSettlement && !meta.txId && (
                <details className={styles.receiptRaw}>
                    <summary className={styles.receiptRawSummary}>Raw settlement data</summary>
                    <pre className={styles.receiptRawPre}>{
                        (() => { try { return JSON.stringify(JSON.parse(meta.paymentSettlement), null, 2); } catch { return meta.paymentSettlement; } })()
                    }</pre>
                </details>
            )}
        </div>
    );
}
