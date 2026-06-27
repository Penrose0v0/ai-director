import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AI Director",
  description: "Turn video prompting into video directing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
