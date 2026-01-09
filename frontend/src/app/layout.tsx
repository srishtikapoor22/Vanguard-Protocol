import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import from Google
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // 2. Initialize the font

export const metadata: Metadata = {
  title: "Vanguard Protocol",
  description: "Forensic Reasoning Firewall for AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 3. Apply the font class to the body */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}