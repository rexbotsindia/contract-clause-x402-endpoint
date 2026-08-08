import Link from "next/link";
import { Scale, Zap, Lock, Globe, Eye, ChevronRight, ExternalLink } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
    title: "About - ContractLens",
    description: "About ContractLens - a pay-per-use AI contract risk analyzer built on x402, Algorand, and Groq.",
};

const WHAT_WE_BUILT = [
    {
        Icon: Zap,
        title: "Instant Risk Analysis",
        body: "Sub-second Groq inference delivers a comprehensive contract risk report the moment payment settles on-chain.",
    },
    {
        Icon: Lock,
        title: "Trustless Payments",
        body: "x402 removes the need for API keys, billing portals, or subscriptions. Pay per request, nothing more. Your contract is never stored.",
    },
    {
        Icon: Globe,
        title: "Open Protocol",
        body: "Built on x402 - an open HTTP payment standard. No vendor lock-in. Any client that supports x402 can use this API.",
    },
    {
        Icon: Eye,
        title: "Comprehensive Coverage",
        body: "Every analysis covers risk identification, severity scoring, favorable terms, missing clauses, key dates, parties, and a final verdict.",
    },
];

const LINKS = [
    { href: "https://x402.org",                                      label: "x402.org"                    },
    { href: "https://dev.algorand.co/resources/x402-on-algorand/",   label: "x402 on Algorand Tutorial"  },
    { href: "https://console.groq.com",                              label: "Groq Console"                },
    { href: "https://developer.algorand.org",                        label: "Algorand Developer Portal"  },
    { href: "https://www.npmjs.com/search?q=%40x402",                label: "@x402 on npm"               },
];

const FLOW = [
    { label: "Client",    desc: "POST /analyze"       },
    { label: "HTTP 402",  desc: "Payment Required"    },
    { label: "Algorand",  desc: "USDC on-chain"       },
    { label: "Verified",  desc: "Payment confirmed"   },
    { label: "HTTP 200",  desc: "Risk Analysis JSON"  },
];

export default function AboutPage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroGlow} aria-hidden />
                <p className={styles.eyebrow}>Open-source Demo</p>
                <h1 className={styles.heroTitle}>About ContractLens</h1>
                <p className={styles.heroSub}>
                    A proof-of-concept combining the x402 payment protocol, Algorand TestNet,
                    and Groq AI to build a fully pay-per-use contract risk analyzer - no signup, no billing, no trust required.
                </p>
            </section>

            <main className={styles.main}>

                {/* What we built */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>What This Project Demonstrates</h2>
                    <p className={styles.bodyText}>
                        ContractLens shows how the{" "}
                        <a href="https://x402.org" target="_blank" rel="noopener">x402 payment protocol</a>{" "}
                        can monetize any HTTP endpoint without a traditional payment processor. The business logic -
                        AI-powered contract risk analysis - is entirely independent of the payment layer.
                        Swap the AI for any API and the pattern stays identical.
                    </p>
                    <p className={styles.bodyText} style={{ marginTop: "1rem" }}>
                        The x402 integration is{" "}
                        <strong>unchanged from the official Algorand tutorial</strong>. Only the content behind
                        the payment wall differs, making this codebase an excellent starting point for building
                        your own monetized API.
                    </p>
                    <div className={styles.featureGrid}>
                        {WHAT_WE_BUILT.map(f => (
                            <div key={f.title} className={styles.featureCard}>
                                <span className={styles.featureIconWrap}>
                                    <f.Icon size={17} strokeWidth={1.75} />
                                </span>
                                <div>
                                    <div className={styles.featureTitle}>{f.title}</div>
                                    <div className={styles.featureBody}>{f.body}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* x402 protocol */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>The x402 Protocol</h2>
                    <div className={styles.conceptCard}>
                        <div className={styles.conceptFlow}>
                            {FLOW.map((item, i, arr) => (
                                <div key={item.label} className={styles.conceptRow}>
                                    <div className={styles.conceptNode}>
                                        <span className={styles.conceptLabel}>{item.label}</span>
                                        <span className={styles.conceptDesc}>{item.desc}</span>
                                    </div>
                                    {i < arr.length - 1 && <span className={styles.conceptArrow}>→</span>}
                                </div>
                            ))}
                        </div>
                        <p className={styles.conceptBody}>
                            x402 extends HTTP with a standard machine-readable payment handshake.
                            The server advertises payment requirements in the 402 response body.
                            A compliant client reads the requirements, settles the payment on-chain,
                            and retries - automatically, without human intervention.
                        </p>
                    </div>
                </section>

                {/* Pricing */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Pricing</h2>
                    <div className={styles.pricingCard}>
                        <div className={styles.pricingLeft}>
                            <div className={styles.pricingAmount}>$1.00</div>
                            <div className={styles.pricingUnit}>USDC per analysis</div>
                        </div>
                        <div className={styles.pricingDetails}>
                            {[
                                ["Network",           "Algorand TestNet"],
                                ["Token",             "USDC (ASA)"],
                                ["Account required",  "No"],
                                ["Subscription",      "No"],
                                ["Payment verified",  "On-chain · ~4 s"],
                            ].map(([k, v]) => (
                                <div key={k} className={styles.pricingRow}>
                                    <span className={styles.pricingKey}>{k}</span>
                                    <span className={styles.pricingVal}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className={styles.pricingNote}>
                        This is a <strong>TestNet demo</strong>. Algorand TestNet USDC has no real-world value.
                        Get free TestNet ALGO and USDC from the{" "}
                        <a href="https://bank.testnet.algorand.network" target="_blank" rel="noopener">
                            Algorand TestNet Dispenser
                        </a>.
                    </p>
                </section>

                {/* Resources */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Resources & Links</h2>
                    <div className={styles.linkGrid}>
                        {LINKS.map(l => (
                            <a key={l.href} href={l.href} target="_blank" rel="noopener" className={styles.linkCard}>
                                <span className={styles.linkLabel}>{l.label}</span>
                                <ExternalLink size={13} className={styles.linkArrow} />
                            </a>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div className={styles.cta}>
                    <Scale size={28} strokeWidth={1.5} className={styles.ctaIcon} />
                    <h2 className={styles.ctaTitle}>Try It Yourself</h2>
                    <p className={styles.ctaSub}>Upload a contract and get a full risk analysis in under 30 seconds.</p>
                    <div className={styles.ctaActions}>
                        <Link href="/" className={styles.ctaBtn}>
                            Go to Analyzer
                            <ChevronRight size={16} />
                        </Link>
                        <Link href="/how-it-works" className={styles.ctaBtnGhost}>
                            How It Works
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
