"use client";

import CopyButton from "./CopyButton";
import { useI18n } from "@/lib/i18n";

export default function PromptPanel({
  prompt,
  onCompile,
  busy,
}: {
  prompt?: string;
  onCompile: () => void;
  busy: boolean;
}) {
  const { t } = useI18n();
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{t("prompt.title")}</h2>
        {prompt && <CopyButton text={prompt} />}
      </div>

      {prompt ? (
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-3 text-xs leading-relaxed text-zinc-300">
          {prompt}
        </pre>
      ) : (
        <p className="text-xs text-zinc-500">{t("prompt.empty")}</p>
      )}

      <button className="btn-primary mt-3 w-full" onClick={onCompile} disabled={busy} type="button">
        {busy ? t("prompt.compiling") : t("prompt.compile")}
      </button>
    </section>
  );
}
