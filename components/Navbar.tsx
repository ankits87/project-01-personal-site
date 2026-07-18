"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const emptySubscribe = () => () => {};

// Avoid hydration mismatch — render nothing until mounted on client
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-raised transition-colors"
    >
      {isDark ? (
        /* Sun icon */
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        /* Moon icon */
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-surface-default border-b border-border-default sticky top-0 z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-text-primary tracking-tight">
            Ankit<span className="text-brand-default">.</span>dev
          </Link>

          {/* Desktop links + toggle */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href
                    ? "text-brand-default border-b-2 border-brand-default pb-0.5"
                    : "text-text-secondary hover:text-brand-default"
                }`}
              >
                {label}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised focus:outline-none transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border-subtle bg-surface-default px-4 pb-4 pt-2 flex flex-col gap-1 transition-colors">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                pathname === href
                  ? "bg-brand-subtle text-brand-default"
                  : "text-text-secondary hover:bg-surface-raised hover:text-brand-default"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
