"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
    { href: "/",            label: "Analyzer"      },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about",        label: "About"        },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <Scale size={20} strokeWidth={2} className={styles.logoIcon} />
                    <span className={styles.logoText}>
                        ContractRisk<span className={styles.accent}>AI</span>
                    </span>
                </Link>

                <nav className={styles.nav}>
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.navActive : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.badgeAlgo}`}>Algorand</span>
                    <span className={`${styles.badge} ${styles.badgeX402}`}>x402</span>
                </div>
            </div>
        </header>
    );
}
