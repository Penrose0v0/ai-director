"use client";

import { useRef } from "react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="card h-full overflow-y-auto p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("video.title")}</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="text-xs text-accent2 hover:underline"
            onClick={() => onSetVideo("/sample.mp4")}
          >
            {t("video.useSample")}
          </button>
          <button
            type="button"
            className="text-xs text-accent2 hover:underline"
            onClick={() => fileRef.current?.click()}
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

      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-line bg-ink">
        {videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={videoUrl} controls className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-zinc-600">{t("video.empty")}</span>
        )}
      </div>

      <button
        className="btn-primary mt-3 w-full"
        onClick={onReview}
        disabled={busy || !canReview}
        type="button"
      >
        {busy ? t("video.reviewing") : t("video.review")}
      </button>
      {!canReview && <p className="mt-1 text-center text-[11px] text-zinc-600">{t("video.needVideo")}</p>}
    </section>
  );
}
