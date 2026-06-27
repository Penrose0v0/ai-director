"use client";

import CopyButton from "./CopyButton";

export default function PromptPanel({
  prompt,
  onCompile,
  busy,
}: {
  prompt?: string;
  onCompile: () => void;
  busy: boolean;
}) {
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">3 · Compiled Prompt</h2>
        {prompt && <CopyButton text={prompt} />}
      </div>

      {prompt ? (
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-3 text-xs leading-relaxed text-zinc-300">
          {prompt}
        </pre>
      ) : (
        <p className="text-xs text-zinc-500">点下面的按钮，把导演设定编译成完整 prompt。</p>
      )}

      <button className="btn-primary mt-3 w-full" onClick={onCompile} disabled={busy} type="button">
        {busy ? "编译中…" : "Compile Prompt"}
      </button>
    </section>
  );
}
