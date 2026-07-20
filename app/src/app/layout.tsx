import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResearchPeps — Protocol-Aware Bloodwork",
  description:
    "Bloodwork interpretation for bodybuilders and biohackers, in context of the compounds you take.",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/protocol", label: "Protocol" },
  { href: "/labs/new", label: "Add Bloodwork" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              ResearchPeps
            </Link>
            <nav className="flex gap-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4 text-xs text-neutral-500">
            Educational information only — not medical advice or a diagnosis.
            Reference ranges are general and vary by lab and individual.
            Discuss your results and protocol with a qualified healthcare
            provider.
          </div>
        </footer>
      </body>
    </html>
  );
}
