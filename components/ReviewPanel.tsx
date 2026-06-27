"use client";

import type { ReviewResult, SuggestionTarget } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import CopyButton from "./CopyButton";
import { useI18n } from "@/lib/i18n";

const TARGET_KEY: Record<SuggestionTarget, Parameters<ReturnType<typeof useI18n>["t"]>[0]> = {
  character: "board.character",
  visualStyle: "board.visualStyle",
  timeline: "board.timeline",
  constraint: "board.constraints",
};

export default function ReviewPanel({
  review,
  onApply,
  onApplyAll,
}: {
  review?: ReviewResult;
  onApply: (index: number) => void;
  onApplyAll: () => void;
}) {
  const { t } = useI18n();

  if (!review) {
    return (
      <section className="card h-full overflow-y-auto p-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-100">{t("review.title")}</h2>
        <p className="text-xs text-zinc-500">{t("review.empty")}</p>
      </section>
    );
  }

  const scoreColor =
    review.score >= 75 ? "text-emerald-300" : review.score >= 45 ? "text-amber-300" : "text-rose-300";

  // Index suggestions back to their position in review.items so apply() can target them.
  const suggestions = review.items
    .map((it, index) => ({ it, index }))
    .filter(({ it }) => it.suggestion);
  const hasUnapplied = suggestions.some(({ it }) => !it.applied);

  return (
    <section className="card h-full overflow-y-auto p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("review.title")}</h2>
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>{review.score}%</div>
          <div className="text-[11px] text-zinc-500">{review.summary}</div>
        </div>
      </div>

      {/* Compliance table */}
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

      {/* Structured suggestions — apply straight into the Director Board */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">{t("review.suggestHeading")}</h3>
          {suggestions.length > 0 && (
            <button
              type="button"
              className="text-xs text-accent2 hover:underline disabled:opacity-40"
              onClick={onApplyAll}
              disabled={!hasUnapplied}
            >
              {t("review.applyAll")}
            </button>
          )}
        </div>

        {suggestions.length === 0 ? (
          <p className="text-xs text-zinc-500">{t("review.noSuggest")}</p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map(({ it, index }) => {
              const sug = it.suggestion!;
              return (
                <li key={index} className="rounded-md border border-line bg-panel2 p-2.5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                      {t(TARGET_KEY[sug.target])}
                      {sug.target === "timeline" && sug.beatIndex != null ? ` #${sug.beatIndex + 1}` : ""}
                    </span>
                    <StatusBadge status={it.status} />
                  </div>
                  <p className="text-xs text-zinc-200">
                    {sug.target === "constraint" ? "+ " : ""}
                    {sug.value}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">{sug.reason}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        it.applied
                          ? "cursor-default border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "bg-accent text-white hover:bg-accent/90"
                      }`}
                      onClick={() => !it.applied && onApply(index)}
                      disabled={it.applied}
                    >
                      {it.applied ? t("review.applied") : t("review.apply")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Fix prompt — secondary, for full regeneration */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-400">{t("review.fixTitle")}</h3>
          <CopyButton text={review.fixPrompt} />
        </div>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-3 text-xs leading-relaxed text-zinc-400">
          {review.fixPrompt}
        </pre>
      </div>
    </section>
  );
}
