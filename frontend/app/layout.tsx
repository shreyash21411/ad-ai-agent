import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Marketing Engine — Multi-Agent Dashboard",
  description:
    "AI-powered marketing team that diagnoses ad performance, identifies root causes, generates strategy, and creates new ad concepts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#030712] font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
