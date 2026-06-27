"use client";

import type { ActionBeat, DirectorSettings } from "@/lib/types";
import { CAMERA_ANGLES, CAMERA_MOVEMENTS, MOODS, SHOT_SIZES } from "@/lib/options";
import { uid } from "@/lib/mock";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function DirectorBoard({
  title,
  settings,
  onChange,
  onTitleChange,
}: {
  title: string;
  settings: DirectorSettings;
  onChange: (next: DirectorSettings) => void;
  onTitleChange: (t: string) => void;
}) {
  const set = <K extends keyof DirectorSettings>(key: K, value: DirectorSettings[K]) =>
    onChange({ ...settings, [key]: value });

  // ---- timeline ----
  const addBeat = () => {
    const last = settings.timeline[settings.timeline.length - 1];
    const from = last ? last.to : 0;
    set("timeline", [
      ...settings.timeline,
      { id: uid("beat"), from, to: Math.min(from + 2, settings.duration), description: "" },
    ]);
  };
  const updateBeat = (id: string, patch: Partial<ActionBeat>) =>
    set("timeline", settings.timeline.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBeat = (id: string) =>
    set("timeline", settings.timeline.filter((b) => b.id !== id));

  // ---- constraints ----
  const updateConstraint = (i: number, value: string) =>
    set("constraints", settings.constraints.map((c, j) => (j === i ? value : c)));
  const addConstraint = () => set("constraints", [...settings.constraints, ""]);
  const removeConstraint = (i: number) =>
    set("constraints", settings.constraints.filter((_, j) => j !== i));

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-accent">●</span>
        <input
          className="control flex-1 font-semibold"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration (s)">
          <input
            type="number"
            min={1}
            max={60}
            className="control"
            value={settings.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
          />
        </Field>
        <Field label="Mood">
          <select className="control" value={settings.mood} onChange={(e) => set("mood", e.target.value)}>
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Shot Size">
          <select className="control" value={settings.shotSize} onChange={(e) => set("shotSize", e.target.value)}>
            {SHOT_SIZES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Camera Angle">
          <select className="control" value={settings.cameraAngle} onChange={(e) => set("cameraAngle", e.target.value)}>
            {CAMERA_ANGLES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Camera Movement">
          <select
            className="control"
            value={settings.cameraMovement}
            onChange={(e) => set("cameraMovement", e.target.value)}
          >
            {CAMERA_MOVEMENTS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Character">
          <input
            className="control"
            value={settings.character}
            onChange={(e) => set("character", e.target.value)}
            placeholder="年轻女性，黑色外套…"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Visual Style">
          <input
            className="control"
            value={settings.visualStyle}
            onChange={(e) => set("visualStyle", e.target.value)}
            placeholder="rainy Tokyo night, neon reflections…"
          />
        </Field>
      </div>

      {/* Action timeline */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="field-label">Action Timeline</span>
          <button className="text-xs text-accent2 hover:underline" onClick={addBeat} type="button">
            + 加一段
          </button>
        </div>
        <div className="space-y-2">
          {settings.timeline.length === 0 && (
            <p className="text-xs text-zinc-500">还没有动作。点「+ 加一段」按秒拆分动作。</p>
          )}
          {settings.timeline.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <input
                type="number"
                className="control w-16 px-2"
                value={b.from}
                min={0}
                onChange={(e) => updateBeat(b.id, { from: Number(e.target.value) })}
              />
              <span className="text-zinc-600">–</span>
              <input
                type="number"
                className="control w-16 px-2"
                value={b.to}
                min={0}
                onChange={(e) => updateBeat(b.id, { to: Number(e.target.value) })}
              />
              <span className="text-xs text-zinc-600">s</span>
              <input
                className="control flex-1"
                value={b.description}
                placeholder="此刻发生的动作…"
                onChange={(e) => updateBeat(b.id, { description: e.target.value })}
              />
              <button
                className="px-1 text-zinc-500 hover:text-rose-400"
                onClick={() => removeBeat(b.id)}
                type="button"
                aria-label="remove beat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="field-label">Constraints（禁止事项 / 连续性）</span>
          <button className="text-xs text-accent2 hover:underline" onClick={addConstraint} type="button">
            + 加一条
          </button>
        </div>
        <div className="space-y-2">
          {settings.constraints.length === 0 && (
            <p className="text-xs text-zinc-500">例如：不要换衣服、不要出现额外人物、不要变成白天。</p>
          )}
          {settings.constraints.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="control flex-1"
                value={c}
                placeholder="一条限制…"
                onChange={(e) => updateConstraint(i, e.target.value)}
              />
              <button
                className="px-1 text-zinc-500 hover:text-rose-400"
                onClick={() => removeConstraint(i)}
                type="button"
                aria-label="remove constraint"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
