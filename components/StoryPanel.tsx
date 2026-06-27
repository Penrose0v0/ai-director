"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function StoryPanel({
  onBreakdown,
  busy,
}: {
  onBreakdown: (story: string) => void;
  busy: boolean;
}) {
  const { t, locale } = useI18n();
  const [story, setStory] = useState("");
  const [touched, setTouched] = useState(false);

  // Keep the sample in sync with the active language until the user edits it.
  useEffect(() => {
    if (!touched) setStory(t("story.sample"));
  }, [locale, touched, t]);

  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("story.title")}</h2>
        <button
          className="text-xs text-accent2 hover:underline"
          onClick={() => {
            setStory(t("story.sample"));
            setTouched(false);
          }}
          type="button"
        >
          {t("story.useSample")}
        </button>
      </div>
      <textarea
        className="control min-h-[88px] resize-y"
        value={story}
        onChange={(e) => {
          setStory(e.target.value);
          setTouched(true);
        }}
        placeholder={t("story.placeholder")}
      />
      <button
        className="btn-primary mt-3 w-full"
        disabled={busy || !story.trim()}
        onClick={() => onBreakdown(story)}
        type="button"
      >
        {busy ? t("story.breakingDown") : t("story.breakdown")}
      </button>
    </section>
  );
}
