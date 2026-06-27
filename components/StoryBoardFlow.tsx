"use client";

import type { Shot } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function StoryBoardFlow({
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
    <section className="card flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 className="text-sm font-semibold text-zinc-100">{t("flow.title")}</h2>
        <span className="text-xs text-zinc-500">{shots.length}</span>
      </div>

      <div className="flex flex-1 items-stretch gap-3 overflow-x-auto p-3">
        {shots.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-xs text-zinc-500">
            {t("flow.empty")}
          </div>
        )}

        {shots.map((shot, i) => {
          const active = shot.id === activeId;
          const boarding = boardingIds.includes(shot.id);
          return (
            <div key={shot.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect(shot.id)}
                className={`group w-[180px] shrink-0 overflow-hidden rounded-lg border text-left transition ${
                  active ? "border-accent ring-1 ring-accent/40" : "border-line hover:border-zinc-500"
                }`}
              >
                <div className="relative aspect-video bg-ink">
                  {shot.storyboardUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shot.storyboardUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  {boarding && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-accent" />
                    </span>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {shot.review && (
                    <span className="absolute right-1.5 top-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {shot.review.score}%
                    </span>
                  )}
                </div>
                <div className="truncate px-2 py-1.5 text-[11px] text-zinc-300">{shot.title}</div>
              </button>
              {/* connector */}
              {i < shots.length - 1 && <span className="text-zinc-600">→</span>}
            </div>
          );
        })}

        {/* add card */}
        <button
          type="button"
          onClick={onAdd}
          className="flex aspect-video w-[120px] shrink-0 flex-col items-center justify-center gap-1 self-start rounded-lg border border-dashed border-line text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
        >
          <span className="text-lg leading-none">+</span>
          {t("flow.add")}
        </button>
      </div>
    </section>
  );
}
