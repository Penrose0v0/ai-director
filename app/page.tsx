"use client";

import { useMemo, useState } from "react";
import type { DirectorSettings, Shot } from "@/lib/types";
import { emptySettings } from "@/lib/types";
import { uid } from "@/lib/mock";
import StoryPanel from "@/components/StoryPanel";
import ShotList from "@/components/ShotList";
import DirectorBoard from "@/components/DirectorBoard";
import PromptPanel from "@/components/PromptPanel";
import VideoPanel from "@/components/VideoPanel";
import ReviewPanel from "@/components/ReviewPanel";

type Busy = null | "story" | "compile" | "review";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

export default function Page() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);

  const active = useMemo(() => shots.find((s) => s.id === activeId) ?? null, [shots, activeId]);

  const patchShot = (id: string, patch: Partial<Shot>) =>
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Step 1 -> 2: story breakdown
  const handleBreakdown = async (story: string) => {
    setBusy("story");
    try {
      const { shots: next } = await postJSON<{ shots: Shot[] }>("/api/story", { story });
      setShots(next);
      setActiveId(next[0]?.id ?? null);
    } finally {
      setBusy(null);
    }
  };

  const handleAddShot = () => {
    const shot: Shot = { id: uid("shot"), title: `Shot ${shots.length + 1} — 新镜头`, settings: emptySettings() };
    setShots((prev) => [...prev, shot]);
    setActiveId(shot.id);
  };

  const updateSettings = (next: DirectorSettings) =>
    active && patchShot(active.id, { settings: next, compiledPrompt: undefined, review: undefined });

  const handleCompile = async () => {
    if (!active) return;
    setBusy("compile");
    try {
      const { prompt } = await postJSON<{ prompt: string }>("/api/compile", { settings: active.settings });
      patchShot(active.id, { compiledPrompt: prompt });
    } finally {
      setBusy(null);
    }
  };

  const handleReview = async () => {
    if (!active) return;
    setBusy("review");
    try {
      const { review } = await postJSON<{ review: Shot["review"] }>("/api/review", { shot: active });
      patchShot(active.id, { review });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold tracking-tight text-zinc-100">
            <span className="text-accent">▸</span> AI Director
          </span>
          <span className="hidden text-xs text-zinc-500 sm:inline">
            Turn video prompting into video directing.
          </span>
        </div>
        <span className="rounded-full border border-line bg-panel2 px-3 py-1 text-[11px] text-zinc-400">
          mock mode · 未接入 Gemini
        </span>
      </header>

      <main className="grid flex-1 grid-cols-12 gap-4 p-4">
        {/* Left column */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          <StoryPanel onBreakdown={handleBreakdown} busy={busy === "story"} />
          <ShotList shots={shots} activeId={activeId} onSelect={setActiveId} onAdd={handleAddShot} />
        </div>

        {/* Center column */}
        <div className="col-span-12 lg:col-span-5">
          {active ? (
            <DirectorBoard
              title={active.title}
              settings={active.settings}
              onChange={updateSettings}
              onTitleChange={(t) => patchShot(active.id, { title: t })}
            />
          ) : (
            <div className="card flex h-full min-h-[300px] items-center justify-center p-8 text-center text-sm text-zinc-500">
              先在左侧拆解故事或新建镜头，开始导演。
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-12 space-y-4 lg:col-span-4">
          <PromptPanel
            prompt={active?.compiledPrompt}
            onCompile={handleCompile}
            busy={busy === "compile"}
          />
          <VideoPanel
            videoUrl={active?.videoUrl}
            onSetVideo={(url) => active && patchShot(active.id, { videoUrl: url, review: undefined })}
            onReview={handleReview}
            canReview={!!active?.videoUrl}
            busy={busy === "review"}
          />
          <ReviewPanel review={active?.review} />
        </div>
      </main>
    </div>
  );
}
