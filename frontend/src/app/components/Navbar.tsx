"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
    { href: "/",             label: "Analyzer"      },
    { href: "/how-it-works", label: "How It Works"  },
    { href: "/about",        label: "About"         },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoMark}>
                        <Scale size={15} strokeWidth={2.5} />
                    </span>
                    <span className={styles.logoText}>
                        Contract<span className={styles.accent}>Lens</span>
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

                <div className={styles.right}>
                    <span className={styles.networkPill}>
                        <span className={styles.networkDot} />
                        Algorand TestNet
                    </span>
                </div>
            </div>
        </header>
    );
}
