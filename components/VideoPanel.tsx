"use client";

import { useRef } from "react";
import { useI18n } from "@/lib/i18n";

export default function VideoPanel({
  videoUrl,
  onSetVideo,
  onGenerate,
  onReview,
  canGenerate,
  canReview,
  generating,
  reviewing,
}: {
  videoUrl?: string;
  onSetVideo: (url: string) => void;
  onGenerate: () => void;
  onReview: () => void;
  canGenerate: boolean;
  canReview: boolean;
  generating: boolean;
  reviewing: boolean;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = generating || reviewing;

  return (
    <section className="card h-full overflow-y-auto p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("video.title")}</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="text-xs text-accent2 hover:underline disabled:opacity-40"
            onClick={() => onSetVideo("/sample_video.mp4")}
            disabled={busy}
          >
            {t("video.useSample")}
          </button>
          <button
            type="button"
            className="text-xs text-accent2 hover:underline disabled:opacity-40"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {t("video.upload")}
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

      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md border border-line bg-ink">
        {videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={videoUrl} controls className="h-full w-full object-contain" />
        ) : (
          <span className="px-4 text-center text-xs text-zinc-600">{t("video.empty")}</span>
        )}
        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 text-xs text-zinc-300">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-accent" />
            {t("video.generating")}
          </div>
        )}
      </div>

      <button
        className="btn-primary mt-3 w-full"
        onClick={onGenerate}
        disabled={busy || !canGenerate}
        type="button"
      >
        {generating ? t("video.generating") : t("video.generate")}
      </button>

      <button
        className="btn-ghost mt-2 w-full"
        onClick={onReview}
        disabled={busy || !canReview}
        type="button"
      >
        {reviewing ? t("video.reviewing") : t("video.review")}
      </button>
      {!canReview && <p className="mt-1 text-center text-[11px] text-zinc-600">{t("video.needVideo")}</p>}
    </section>
  );
}
