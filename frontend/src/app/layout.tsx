import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BATON | Project Continuity Intelligence",
  description: "Prevent critical knowledge from leaving with people. An evidence-linked project handover and knowledge continuity platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='m4.5 16.5 6-6'/><path d='m12 12 7.5-7.5'/><path d='m16.5 4.5 3 3'/><path d='m13.5 7.5 3 3'/><path d='m7.5 13.5 3 3'/><path d='m4.5 16.5 3 3'/><circle cx='4.5' cy='19.5' r='1.5'/><circle cx='19.5' cy='4.5' r='1.5'/></svg>"
          type="image/svg+xml"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <ThemeCustomizer />
      </body>
    </html>
  );
}
