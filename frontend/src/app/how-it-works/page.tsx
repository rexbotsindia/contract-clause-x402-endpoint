import Link from "next/link";
import {
    Upload, Lock, Zap, Brain, BarChart2,
    Globe, ChevronRight, Scale, FileText,
    RefreshCw, Link as LinkIcon, Server,
    CheckCircle2, ArrowRight,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
    title: "How It Works - ContractLens",
    description: "Learn how x402, Algorand, and Groq AI power ContractLens - a pay-per-use contract risk analyzer.",
};

const STEPS = [
    {
        num: "01",
        Icon: Upload,
        title: "Upload Contract",
        body: "Drop a PDF or DOCX - employment, SaaS, NDA, lease, or service agreement. Processed in memory, never stored.",
    },
    {
        num: "02",
        Icon: Lock,
        title: "HTTP 402 Returned",
        body: "Server responds with payment requirements: $1.00 USDC, Algorand TestNet network, and merchant wallet address.",
    },
    {
        num: "03",
        Icon: Zap,
        title: "On-Chain Payment",
        body: "The x402 client signs and submits a USDC transaction. The facilitator confirms on-chain in ~4 seconds.",
    },
    {
        num: "04",
        Icon: Brain,
        title: "AI Analysis",
        body: "Groq's llama-3.3-70b-versatile model runs a deep legal risk pass - risks, favorable terms, missing clauses.",
    },
    {
        num: "05",
        Icon: BarChart2,
        title: "Risk Report",
        body: "Score, severity breakdown, key dates, parties, jurisdiction, verdict - everything in one structured report.",
    },
];

const ARCH = [
    { label: "Browser",     sub: "Next.js 14",         Icon: Globe,    note: "Sends multipart upload"      },
    { label: "API Proxy",   sub: "Route Handler",       Icon: RefreshCw, note: "x402-aware proxy"          },
    { label: "Algorand",    sub: "TestNet · USDC",      Icon: Zap,      note: "USDC micro-payment"         },
    { label: "Facilitator", sub: "GoPlausible",         Icon: LinkIcon, note: "Verifies on-chain tx"       },
    { label: "Hono Server", sub: "x402 Middleware",     Icon: Server,   note: "Processes after payment"    },
    { label: "Groq AI",     sub: "llama-3.3-70b",       Icon: Brain,    note: "Returns risk JSON"          },
];

const TECH = [
    {
        group: "Frontend",
        rows: [
            { layer: "Framework",   tech: "Next.js 14 · React 18"  },
            { layer: "Language",    tech: "TypeScript ESM"          },
            { layer: "Icons",       tech: "lucide-react"            },
            { layer: "API Proxy",   tech: "Next.js Route Handler"   },
        ],
    },
    {
        group: "Payments",
        rows: [
            { layer: "Protocol",    tech: "x402 v2.11.0"                    },
            { layer: "Network",     tech: "Algorand TestNet · USDC (ASA)"   },
            { layer: "Facilitator", tech: "GoPlausible x402 Facilitator"    },
            { layer: "Client SDK",  tech: "@x402/fetch · @x402/avm"        },
        ],
    },
    {
        group: "Backend",
        rows: [
            { layer: "Server",      tech: "Hono + @hono/node-server"        },
            { layer: "AI Model",    tech: "Groq · llama-3.3-70b-versatile"  },
            { layer: "PDF Parsing", tech: "pdf-parse"                       },
            { layer: "DOCX Parsing",tech: "mammoth"                         },
        ],
    },
];

const FAQS = [
    {
        q: "Do I need an account?",
        a: "No. Each analysis is a single on-chain USDC payment - no signup, no monthly subscription.",
    },
    {
        q: "Is my contract stored anywhere?",
        a: "No. Contracts are processed in memory and discarded immediately. Nothing is written to disk or a database.",
    },
    {
        q: "What contract types are supported?",
        a: "Any PDF or DOCX - employment, SaaS, NDA, service agreements, leases, consulting contracts, and more.",
    },
    {
        q: "What is x402?",
        a: "An open HTTP payment standard. The server returns HTTP 402 with machine-readable payment requirements; the client pays on-chain and retries automatically.",
    },
    {
        q: "Why Algorand?",
        a: "Fast finality (~4 s), very low fees, and native USDC (ASA) support make it ideal for micro-payment APIs.",
    },
    {
        q: "How accurate is the analysis?",
        a: "Results are strong directional indicators from a structured legal analyst prompt. For high-stakes contracts, consult a qualified legal professional.",
    },
];

export default function HowItWorksPage() {
    return (
        <div className={styles.page}>

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className={styles.hero}>
                <p className={styles.eyebrow}>x402 · Algorand · Groq AI</p>
                <h1 className={styles.heroTitle}>How It Works</h1>
                <p className={styles.heroSub}>
                    Five steps from upload to on-chain payment to AI risk report - fully automated, no account needed.
                </p>
            </section>

            {/* ── 1. Payment Flow - horizontal timeline ─────────────────── */}
            <section className={styles.flowSection}>
                <div className={styles.flowInner}>
                    <div className={styles.sectionLabel}>
                        <span className={styles.sectionLabelNum}>01</span>
                        The Payment Flow
                    </div>
                    <div className={styles.timeline}>
                        {STEPS.map((step, i) => (
                            <div key={step.num} className={styles.timelineItem}>
                                <div className={styles.timelineTop}>
                                    <div className={styles.timelineIconWrap}>
                                        <step.Icon size={18} strokeWidth={1.75} />
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={styles.timelineConnector}>
                                            <div className={styles.timelineConnectorLine} />
                                            <ArrowRight size={11} className={styles.timelineArrow} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.timelineBody}>
                                    <span className={styles.timelineNum}>{step.num}</span>
                                    <span className={styles.timelineTitle}>{step.title}</span>
                                    <p className={styles.timelineText}>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 2. Architecture - dark panel with flow nodes ──────────── */}
            <section className={styles.archSection}>
                <div className={styles.archInner}>
                    <div className={`${styles.sectionLabel} ${styles.sectionLabelLight}`}>
                        <span className={styles.sectionLabelNum}>02</span>
                        Architecture at a Glance
                    </div>
                    <div className={styles.archFlow}>
                        {ARCH.map((node, i, arr) => (
                            <div key={node.label} className={styles.archItem}>
                                <div className={styles.archNode}>
                                    <div className={styles.archNodeIcon}>
                                        <node.Icon size={20} strokeWidth={1.5} />
                                    </div>
                                    <span className={styles.archNodeLabel}>{node.label}</span>
                                    <span className={styles.archNodeSub}>{node.sub}</span>
                                    <span className={styles.archNodeNote}>{node.note}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className={styles.archConnector}>
                                        <div className={styles.archConnectorLine} />
                                        <ChevronRight size={14} className={styles.archConnectorArrow} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. Tech Stack - grouped table layout ─────────────────── */}
            <section className={styles.techSection}>
                <div className={styles.techInner}>
                    <div className={styles.sectionLabel}>
                        <span className={styles.sectionLabelNum}>03</span>
                        Tech Stack
                    </div>
                    <div className={styles.techGroups}>
                        {TECH.map(g => (
                            <div key={g.group} className={styles.techGroup}>
                                <div className={styles.techGroupHeader}>
                                    <CheckCircle2 size={13} strokeWidth={2.5} className={styles.techGroupIcon} />
                                    {g.group}
                                </div>
                                <table className={styles.techTable}>
                                    <tbody>
                                        {g.rows.map(r => (
                                            <tr key={r.layer} className={styles.techRow}>
                                                <td className={styles.techLayer}>{r.layer}</td>
                                                <td className={styles.techTech}>{r.tech}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. FAQ - two-column grid ──────────────────────────────── */}
            <section className={styles.faqSection}>
                <div className={styles.faqInner}>
                    <div className={styles.sectionLabel}>
                        <span className={styles.sectionLabelNum}>04</span>
                        Frequently Asked Questions
                    </div>
                    <div className={styles.faqGrid}>
                        {FAQS.map(faq => (
                            <div key={faq.q} className={styles.faqCard}>
                                <h3 className={styles.faqQ}>{faq.q}</h3>
                                <p className={styles.faqA}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────── */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaInner}>
                    <div className={styles.ctaLeft}>
                        <Scale size={32} strokeWidth={1.5} className={styles.ctaIcon} />
                        <h2 className={styles.ctaTitle}>Ready to analyze a contract?</h2>
                        <p className={styles.ctaSub}>$1.00 USDC · No account · Results in under 30 seconds</p>
                    </div>
                    <Link href="/" className={styles.ctaBtn}>
                        Open Analyzer
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </section>

        </div>
    );
}
