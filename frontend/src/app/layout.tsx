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
    title: "ContractLens - AI Contract Risk Analyzer",
    description:
        "Pay-per-use AI contract risk analysis. Upload any contract, pay $1.00 USDC on Algorand TestNet, and get an instant risk report powered by Groq AI. No signup required.",
    openGraph: {
        title: "ContractLens - Find the risks before you sign",
        description:
            "Upload any employment, SaaS, NDA, or service contract. AI identifies critical clauses, red flags, and missing protections. $1.00 USDC per analysis.",
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
