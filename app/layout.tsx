import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "../site/lab.css";

export const metadata: Metadata = {
  title: {
    default: "Larkmoor Athletic Business Intelligence & Analytics",
    template: "%s · Larkmoor BI & Analytics",
  },
  description:
    "Independent Larkmoor Athletic business intelligence and analytics case study. Public demonstration uses synthetic data.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Reading request headers opts the shell into dynamic rendering. Next.js can then
  // propagate the per-request CSP nonce from proxy.ts to its bootstrap scripts.
  await headers();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
