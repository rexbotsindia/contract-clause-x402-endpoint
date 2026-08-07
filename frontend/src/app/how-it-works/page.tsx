import Link from "next/link";
import {
    Upload, Lock, Zap, Brain, BarChart2,
    Globe, ArrowRight, ChevronRight,
    Scale, FileText, RefreshCw, Link as LinkIcon, Server,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
    title: "How It Works - ContractRisk AI",
    description: "Learn how x402, Algorand, and Groq AI power the pay-per-use contract risk analyzer.",
};

const STEPS = [
    {
        num: "01",
        Icon: Upload,
        title: "Upload Your Contract",
        body: "Upload a PDF or DOCX contract file — employment agreements, SaaS contracts, NDAs, service agreements, and more. Your document is processed in memory and never stored.",
        color: "var(--primary-light)",
    },
    {
        num: "02",
        Icon: Lock,
        title: "HTTP 402 Payment Required",
        body: "The server responds with a 402 status containing x402 payment requirements — the amount ($0.50 USDC), network (Algorand TestNet), and merchant wallet.",
        color: "var(--danger)",
    },
    {
        num: "03",
        Icon: Zap,
        title: "Algorand On-Chain Payment",
        body: "The x402 client signs and submits a USDC transaction on Algorand TestNet. The facilitator verifies the payment on-chain within seconds.",
        color: "var(--caution)",
    },
    {
        num: "04",
        Icon: Brain,
        title: "Groq AI Analysis",
        body: "With payment verified, Groq's llama-3.3-70b-versatile model performs a deep legal risk analysis, identifying risks, favorable terms, and missing clauses.",
        color: "var(--success)",
    },
    {
        num: "05",
        Icon: BarChart2,
        title: "Detailed Risk Report",
        body: "You receive a structured report: overall risk score, all identified risks with severity levels, favorable terms, missing clauses, key dates, parties, jurisdiction, and a final verdict.",
        color: "var(--primary)",
    },
];

const TECH_STACK = [
    { layer: "Frontend",          tech: "Next.js 14 · React 18",           Icon: Globe      },
    { layer: "API Proxy",         tech: "Next.js Route Handler",            Icon: ArrowRight },
    { layer: "Payment Protocol",  tech: "x402 v2.11.0",                    Icon: RefreshCw  },
    { layer: "Payment Network",   tech: "Algorand TestNet · USDC",         Icon: Zap        },
    { layer: "Facilitator",       tech: "GoPlausible x402 Facilitator",    Icon: LinkIcon   },
    { layer: "API Server",        tech: "Hono + @hono/node-server",        Icon: Server     },
    { layer: "AI Inference",      tech: "Groq · llama-3.3-70b-versatile",  Icon: Brain      },
    { layer: "Document Parsing",  tech: "pdf-parse · mammoth",             Icon: FileText   },
];

const ARCH_NODES = [
    { label: "Browser",      sub: "Next.js Frontend",  Icon: Globe     },
    { label: "API Proxy",    sub: "Route Handler",     Icon: ArrowRight },
    { label: "Algorand",     sub: "USDC Payment",      Icon: Zap        },
    { label: "Facilitator",  sub: "Verifies on-chain", Icon: LinkIcon   },
    { label: "Hono Server",  sub: "x402 Middleware",   Icon: Server     },
    { label: "Groq AI",      sub: "Risk Analysis",     Icon: Brain      },
];

const FAQS = [
    {
        q: "Do I need an account?",
        a: "No. ContractRisk AI is fully pay-per-use. Each analysis is a single on-chain USDC payment — no signup, no monthly subscription.",
    },
    {
        q: "Is my contract stored anywhere?",
        a: "No. Contracts are processed in memory and discarded immediately after the AI analysis is returned. Nothing is persisted to disk or a database.",
    },
    {
        q: "What types of contracts can I analyze?",
        a: "Any text-based contract in PDF or DOCX format — employment agreements, SaaS/software licenses, NDAs, service agreements, leases, consulting contracts, and more.",
    },
    {
        q: "What is x402?",
        a: "x402 is an open HTTP payment protocol. When a client sends a request to a protected endpoint, the server responds with HTTP 402 (Payment Required) containing machine-readable payment instructions. The client pays on-chain and retries — automatically.",
    },
    {
        q: "Why Algorand?",
        a: "Algorand offers fast finality (~4 seconds), very low fees, and native USDC (ASA) support — making it ideal for micro-payment APIs.",
    },
    {
        q: "How accurate is the risk analysis?",
        a: "Analysis is powered by llama-3.3-70b-versatile via Groq with a structured legal analyst prompt. Results are strong directional indicators. For high-stakes contracts, always consult a qualified legal professional.",
    },
];

export default function HowItWorksPage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroGlow} aria-hidden />
                <p className={styles.eyebrow}>x402 · Algorand · Groq AI</p>
                <h1 className={styles.heroTitle}>How It Works</h1>
                <p className={styles.heroSub}>
                    A trustless, pay-per-use AI contract risk pipeline — from upload to on-chain payment to analysis.
                </p>
            </section>

            <main className={styles.main}>

                {/* Steps */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>The Payment Flow</h2>
                    <div className={styles.steps}>
                        {STEPS.map((step, i) => (
                            <div key={step.num} className={styles.stepRow}>
                                <div className={styles.stepLeft}>
                                    <div className={styles.stepNum} style={{ color: step.color, borderColor: step.color }}>
                                        {step.num}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={styles.stepLine} />}
                                </div>
                                <div className={styles.stepCard}>
                                    <div className={styles.stepCardHeader}>
                                        <span className={styles.stepIconWrap} style={{ color: step.color }}>
                                            <step.Icon size={17} strokeWidth={1.75} />
                                        </span>
                                        <h3 className={styles.stepCardTitle}>{step.title}</h3>
                                    </div>
                                    <p className={styles.stepCardBody}>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Architecture */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Architecture at a Glance</h2>
                    <div className={styles.archDiagram}>
                        {ARCH_NODES.map((node, i, arr) => (
                            <div key={node.label} className={styles.archRow}>
                                <div className={styles.archNode}>
                                    <span className={styles.archNodeIcon}>
                                        <node.Icon size={18} strokeWidth={1.5} />
                                    </span>
                                    <span className={styles.archNodeLabel}>{node.label}</span>
                                    <span className={styles.archNodeSub}>{node.sub}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <ChevronRight size={14} className={styles.archArrow} />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech stack */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Tech Stack</h2>
                    <div className={styles.techGrid}>
                        {TECH_STACK.map(t => (
                            <div key={t.layer} className={styles.techCard}>
                                <span className={styles.techIconWrap}>
                                    <t.Icon size={16} strokeWidth={1.75} />
                                </span>
                                <div>
                                    <div className={styles.techLayer}>{t.layer}</div>
                                    <div className={styles.techTech}>{t.tech}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                    <div className={styles.faqList}>
                        {FAQS.map(faq => (
                            <div key={faq.q} className={styles.faqItem}>
                                <h3 className={styles.faqQ}>{faq.q}</h3>
                                <p className={styles.faqA}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div className={styles.cta}>
                    <Scale size={28} strokeWidth={1.5} className={styles.ctaIcon} />
                    <h2 className={styles.ctaTitle}>Ready to analyze a contract?</h2>
                    <p className={styles.ctaSub}>$0.50 USDC · No account · Results in seconds</p>
                    <Link href="/" className={styles.ctaBtn}>
                        Analyze Contract
                        <ChevronRight size={16} />
                    </Link>
                </div>

            </main>
        </div>
    );
}
