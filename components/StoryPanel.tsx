"use client";

import { useState } from "react";

const SAMPLE = "雨夜东京，一个女生收到神秘短信后，看到远处黑影并开始逃跑。";

export default function StoryPanel({
  onBreakdown,
  busy,
}: {
  onBreakdown: (story: string) => void;
  busy: boolean;
}) {
  const [story, setStory] = useState(SAMPLE);

  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">1 · 故事</h2>
        <button
          className="text-xs text-accent2 hover:underline"
          onClick={() => setStory(SAMPLE)}
          type="button"
        >
          用示例
        </button>
      </div>
      <textarea
        className="control min-h-[88px] resize-y"
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder="用一两句话描述你的故事…"
      />
      <button
        className="btn-primary mt-3 w-full"
        disabled={busy || !story.trim()}
        onClick={() => onBreakdown(story)}
        type="button"
      >
        {busy ? "生成镜头中…" : "拆解为镜头 →"}
      </button>
    </section>
  );
}
