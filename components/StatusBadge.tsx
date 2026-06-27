import type { ComplianceStatus } from "@/lib/types";

const MAP: Record<ComplianceStatus, { label: string; cls: string }> = {
  pass: { label: "符合", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  partial: { label: "部分符合", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  fail: { label: "不符合", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

export default function StatusBadge({ status }: { status: ComplianceStatus }) {
  const { label, cls } = MAP[status];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  );
}
