"use client";

import type { ComplianceStatus } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const CLS: Record<ComplianceStatus, string> = {
  pass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  fail: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function StatusBadge({ status }: { status: ComplianceStatus }) {
  const { t } = useI18n();
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${CLS[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}
