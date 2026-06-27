import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Director",
  description: "Turn video prompting into video directing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono">{children}</body>
    </html>
  );
}
