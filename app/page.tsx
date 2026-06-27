"use client";

import { useEffect, useMemo, useState } from "react";
import type { DirectorSettings, Shot } from "@/lib/types";
import { emptySettings } from "@/lib/types";
import { uid } from "@/lib/mock";
import { extractKeyframes, loadVideoInline } from "@/lib/frames";
import { applySuggestion } from "@/lib/suggestions";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ChatBox from "@/components/ChatBox";
import StoryBoardFlow from "@/components/StoryBoardFlow";
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
  const { t, locale } = useI18n();
  const [shots, setShots] = useState<Shot[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [boarding, setBoarding] = useState<string[]>([]);
  const [gemini, setGemini] = useState<{ on: boolean; model: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setGemini({ on: !!d.gemini, model: d.model ?? null }))
      .catch(() => setGemini({ on: false, model: null }));
  }, []);

  const active = useMemo(() => shots.find((s) => s.id === activeId) ?? null, [shots, activeId]);

  const patchShot = (id: string, patch: Partial<Shot>) =>
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Generate one storyboard frame for a shot (Gemini image model; mocked).
  const generateBoard = async (shot: Shot, index: number) => {
    setBoarding((b) => [...b, shot.id]);
    try {
      const prompt = [shot.title, shot.settings.visualStyle, shot.settings.character]
        .filter(Boolean)
        .join(" — ");
      const { imageUrl } = await postJSON<{ imageUrl: string }>("/api/storyboard", { prompt, index });
      patchShot(shot.id, { storyboardUrl: imageUrl });
    } finally {
      setBoarding((b) => b.filter((id) => id !== shot.id));
    }
  };

  // Chat -> story breakdown -> storyboard each shot. Returns the assistant reply.
  const handleChat = async (text: string): Promise<string> => {
    setBusy("story");
    try {
      const { shots: next } = await postJSON<{ shots: Shot[] }>("/api/story", { story: text, locale });
      setShots(next);
      setActiveId(next[0]?.id ?? null);
      next.forEach((shot, i) => generateBoard(shot, i));
      return t("chat.reply", { n: next.length });
    } finally {
      setBusy(null);
    }
  };

  const handleAddShot = () => {
    const shot: Shot = {
      id: uid("shot"),
      title: `Shot ${shots.length + 1} — ${t("shots.newTitle")}`,
      settings: emptySettings(),
    };
    setShots((prev) => [...prev, shot]);
    setActiveId(shot.id);
    generateBoard(shot, shots.length);
  };

  const updateSettings = (next: DirectorSettings) =>
    active && patchShot(active.id, { settings: next, compiledPrompt: undefined, review: undefined });

  // Attach a video to the active shot — or auto-create a shot if there is none yet,
  // so "用 sample" / upload always works even before a story has been broken down.
  const handleSetVideo = (url: string) => {
    if (active) {
      patchShot(active.id, { videoUrl: url, review: undefined });
      return;
    }
    const shot: Shot = {
      id: uid("shot"),
      title: `Shot ${shots.length + 1} — ${t("shots.newTitle")}`,
      settings: emptySettings(),
      videoUrl: url,
    };
    setShots((prev) => [...prev, shot]);
    setActiveId(shot.id);
    generateBoard(shot, shots.length);
  };

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
    if (!active?.videoUrl) return;
    setBusy("review");
    try {
      // Prefer native video understanding; fall back to keyframes if the clip is
      // too large to inline or can't be fetched.
      const video = await loadVideoInline(active.videoUrl);
      let frames: Awaited<ReturnType<typeof extractKeyframes>> = [];
      if (!video) {
        try {
          frames = await extractKeyframes(active.videoUrl, active.settings.duration);
        } catch (err) {
          console.warn("keyframe extraction failed; review will fall back to mock:", err);
        }
      }
      const { review } = await postJSON<{ review: Shot["review"] }>("/api/review", {
        shot: active,
        video,
        frames,
      });
      patchShot(active.id, { review });
    } finally {
      setBusy(null);
    }
  };

  // Apply one review suggestion straight into the active shot's settings.
  // Keeps the review visible (marks the item applied); only the stale prompt is cleared.
  const handleApplySuggestion = (index: number) => {
    if (!active?.review) return;
    const item = active.review.items[index];
    if (!item?.suggestion || item.applied) return;
    const settings = applySuggestion(active.settings, item.suggestion);
    const items = active.review.items.map((it, j) => (j === index ? { ...it, applied: true } : it));
    patchShot(active.id, { settings, review: { ...active.review, items }, compiledPrompt: undefined });
  };

  const handleApplyAll = () => {
    if (!active?.review) return;
    let settings = active.settings;
    const items = active.review.items.map((it) => {
      if (it.suggestion && !it.applied) {
        settings = applySuggestion(settings, it.suggestion);
        return { ...it, applied: true };
      }
      return it;
    });
    patchShot(active.id, { settings, review: { ...active.review, items }, compiledPrompt: undefined });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold tracking-tight text-zinc-100">
            <span className="text-accent">▸</span> AI Director
          </span>
          <span className="hidden text-xs text-zinc-500 sm:inline">{t("header.tagline")}</span>
        </div>
        <div className="flex items-center gap-3">
          {gemini && (
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] md:inline-flex ${
                gemini.on
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${gemini.on ? "bg-emerald-400" : "bg-amber-400"}`} />
              {gemini.on ? `${t("header.live")} · ${gemini.model}` : t("header.mock")}
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 gap-4 p-4">
        {/* Left + center super-column */}
        <div className="flex min-w-0 flex-[7] flex-col gap-4">
          {/* top region: chat + current storyboard detail */}
          <div className="flex min-h-0 flex-1 gap-4">
            <div className="w-[300px] shrink-0">
              <ChatBox onSend={handleChat} busy={busy === "story"} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {active ? (
                <div className="space-y-4">
                  <DirectorBoard
                    shot={active}
                    boarding={boarding.includes(active.id)}
                    onChange={updateSettings}
                    onTitleChange={(title) => patchShot(active.id, { title })}
                    onRegenBoard={() => generateBoard(active, shots.findIndex((s) => s.id === active.id))}
                  />
                  <PromptPanel
                    prompt={active.compiledPrompt}
                    onCompile={handleCompile}
                    busy={busy === "compile"}
                  />
                </div>
              ) : (
                <div className="card flex h-full min-h-[300px] items-center justify-center p-8 text-center text-sm text-zinc-500">
                  {t("flow.empty")}
                </div>
              )}
            </div>
          </div>

          {/* bottom: storyboard flow */}
          <div className="h-[200px] shrink-0">
            <StoryBoardFlow
              shots={shots}
              activeId={activeId}
              boardingIds={boarding}
              onSelect={setActiveId}
              onAdd={handleAddShot}
            />
          </div>
        </div>

        {/* Right column: video + review */}
        <div className="flex w-[420px] shrink-0 flex-col gap-4 xl:w-[480px]">
          <div className="min-h-0 flex-1">
            <VideoPanel
              videoUrl={active?.videoUrl}
              onSetVideo={handleSetVideo}
              onReview={handleReview}
              canReview={!!active?.videoUrl}
              busy={busy === "review"}
            />
          </div>
          <div className="min-h-0 flex-1">
            <ReviewPanel review={active?.review} onApply={handleApplySuggestion} onApplyAll={handleApplyAll} />
          </div>
        </div>
      </main>
    </div>
  );
}
