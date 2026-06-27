"use client";

import { useRef } from "react";

export default function VideoPanel({
  videoUrl,
  onSetVideo,
  onReview,
  canReview,
  busy,
}: {
  videoUrl?: string;
  onSetVideo: (url: string) => void;
  onReview: () => void;
  canReview: boolean;
  busy: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">4 · 生成视频</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="text-xs text-accent2 hover:underline"
            onClick={() => onSetVideo("/sample.mp4")}
          >
            用 sample
          </button>
          <button
            type="button"
            className="text-xs text-accent2 hover:underline"
            onClick={() => fileRef.current?.click()}
          >
            上传
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSetVideo(URL.createObjectURL(f));
        }}
      />

      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-line bg-ink">
        {videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={videoUrl} controls className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-zinc-600">还没有视频 · 加载 sample 或上传一个</span>
        )}
      </div>

      <button
        className="btn-primary mt-3 w-full"
        onClick={onReview}
        disabled={busy || !canReview}
        type="button"
      >
        {busy ? "审查中…" : "Director Review"}
      </button>
      {!canReview && (
        <p className="mt-1 text-center text-[11px] text-zinc-600">先加载视频再审查</p>
      )}
    </section>
  );
}
