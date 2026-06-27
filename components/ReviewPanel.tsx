"use client";

import type { ReviewResult } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import CopyButton from "./CopyButton";
import { useI18n } from "@/lib/i18n";

export default function ReviewPanel({ review }: { review?: ReviewResult }) {
  const { t } = useI18n();

  if (!review) {
    return (
      <section className="card p-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-100">{t("review.title")}</h2>
        <p className="text-xs text-zinc-500">{t("review.empty")}</p>
      </section>
    );
  }

  const scoreColor =
    review.score >= 75 ? "text-emerald-300" : review.score >= 45 ? "text-amber-300" : "text-rose-300";

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("review.title")}</h2>
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>{review.score}%</div>
          <div className="text-[11px] text-zinc-500">{review.summary}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-line">
        <table className="w-full text-left text-xs">
          <thead className="bg-panel2 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">{t("review.colExpect")}</th>
              <th className="px-3 py-2 font-medium">{t("review.colObserved")}</th>
              <th className="px-3 py-2 font-medium">{t("review.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {review.items.map((it, i) => (
              <tr key={i} className="border-t border-line align-top">
                <td className="px-3 py-2 text-zinc-300">{it.expectation}</td>
                <td className="px-3 py-2 text-zinc-400">{it.observed}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={it.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fix prompt */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">{t("review.fixTitle")}</h3>
          <CopyButton text={review.fixPrompt} />
        </div>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-3 text-xs leading-relaxed text-zinc-300">
          {review.fixPrompt}
        </pre>
      </div>
    </section>
  );
}
