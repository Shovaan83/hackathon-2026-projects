import type { Metadata } from "next";
import { Inter, Outfit, Public_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d4d8a",
};

export const metadata: Metadata = {
  title: "VitalsFlow — AI Clinical Triage System",
  description:
    "AI-assisted clinical decision support using HL7 FHIR, NEWS2 scoring, and Gemini AI. Real-time patient triage, risk stratification, and clinician action center.",
  keywords: [
    "clinical triage",
    "NEWS2",
    "FHIR",
    "AI healthcare",
    "patient safety",
    "Gemini",
    "VitalsFlow",
    "clinical decision support",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${outfit.variable} ${publicSans.variable}`}>
      <body className="h-full antialiased" suppressHydrationWarning>
        {/* Animated mesh background */}
        <div className="bg-mesh" aria-hidden="true" />
        {/* Skip to main content for keyboard users (SKILL.md: skip-links CRITICAL) */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
