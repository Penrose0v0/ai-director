"use client";

import type { Shot } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function ShotList({
  shots,
  activeId,
  boardingIds,
  onSelect,
  onAdd,
}: {
  shots: Shot[];
  activeId: string | null;
  boardingIds: string[];
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("shots.title")}</h2>
        <button className="text-xs text-accent2 hover:underline" onClick={onAdd} type="button">
          {t("shots.add")}
        </button>
      </div>

      {shots.length === 0 ? (
        <p className="text-xs text-zinc-500">{t("shots.empty")}</p>
      ) : (
        <ul className="space-y-1.5">
          {shots.map((shot, i) => {
            const active = shot.id === activeId;
            const boarding = boardingIds.includes(shot.id);
            return (
              <li key={shot.id}>
                <button
                  type="button"
                  onClick={() => onSelect(shot.id)}
                  className={`flex w-full items-center gap-3 rounded-md border px-2 py-2 text-left text-sm transition ${
                    active
                      ? "border-accent/60 bg-accent/10 text-zinc-100"
                      : "border-line bg-panel2 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {/* storyboard thumbnail */}
                  <span className="relative h-10 w-[72px] shrink-0 overflow-hidden rounded border border-line bg-ink">
                    {shot.storyboardUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shot.storyboardUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    {boarding && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-accent" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mr-1 text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
                    {shot.title}
                    {shot.review && <span className="ml-2 text-xs text-zinc-500">· {shot.review.score}%</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
