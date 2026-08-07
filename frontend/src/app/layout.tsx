import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ContractRisk AI - x402 on Algorand",
    description:
        "Pay-per-use AI-powered contract risk analysis. Each analysis costs $0.50 USDC settled trustlessly on Algorand TestNet via the x402 payment protocol and Groq AI.",
    openGraph: {
        title: "ContractRisk AI - Powered by x402 & Algorand",
        description:
            "Upload any contract and get an instant risk analysis — critical clauses, red flags, and missing protections. $0.50 USDC per analysis, no account needed.",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
