"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function CopyButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="text-xs text-accent2 hover:underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? t("common.copied") : t("common.copy")}
    </button>
  );
}
