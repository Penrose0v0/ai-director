"use client";

import type { Shot } from "@/lib/types";

export default function ShotList({
  shots,
  activeId,
  onSelect,
  onAdd,
}: {
  shots: Shot[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">2 · 镜头</h2>
        <button className="text-xs text-accent2 hover:underline" onClick={onAdd} type="button">
          + 新镜头
        </button>
      </div>

      {shots.length === 0 ? (
        <p className="text-xs text-zinc-500">还没有镜头。先在上面拆解故事，或手动新建。</p>
      ) : (
        <ul className="space-y-1.5">
          {shots.map((shot, i) => {
            const active = shot.id === activeId;
            const reviewed = !!shot.review;
            return (
              <li key={shot.id}>
                <button
                  type="button"
                  onClick={() => onSelect(shot.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                    active
                      ? "border-accent/60 bg-accent/10 text-zinc-100"
                      : "border-line bg-panel2 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  <span className="mr-2 text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
                  {shot.title}
                  {reviewed && (
                    <span className="ml-2 text-xs text-zinc-500">· {shot.review!.score}%</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
