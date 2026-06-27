"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatBox({
  onSend,
  busy,
}: {
  /** Handle a user message; return the assistant's reply text. */
  onSend: (text: string) => Promise<string>;
  busy: boolean;
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    const reply = await onSend(text);
    setMessages((m) => [...m, { role: "assistant", text: reply }]);
  };

  return (
    <section className="card flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">{t("chat.title")}</h2>
        <button
          type="button"
          className="text-xs text-accent2 hover:underline"
          onClick={() => setInput(t("story.sample"))}
        >
          {t("chat.useSample")}
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <Bubble role="assistant" text={t("chat.greeting")} />
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.text} />
        ))}
        {busy && <Bubble role="assistant" text={t("chat.thinking")} muted />}
      </div>

      {/* input */}
      <div className="border-t border-line p-3">
        <textarea
          className="control min-h-[60px] resize-none"
          value={input}
          placeholder={t("chat.placeholder")}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button className="btn-primary mt-2 w-full" onClick={() => void send()} disabled={busy || !input.trim()} type="button">
          {busy ? t("chat.thinking") : t("chat.send")}
        </button>
      </div>
    </section>
  );
}

function Bubble({ role, text, muted }: { role: Msg["role"]; text: string; muted?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? "bg-accent/90 text-white"
            : muted
              ? "border border-line bg-panel2 text-zinc-500"
              : "border border-line bg-panel2 text-zinc-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
