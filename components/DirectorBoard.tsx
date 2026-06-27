"use client";

import type { ActionBeat, DirectorSettings, Shot } from "@/lib/types";
import { CAMERA_ANGLES, CAMERA_MOVEMENTS, MOODS, SHOT_SIZES } from "@/lib/options";
import { uid } from "@/lib/mock";
import { useI18n } from "@/lib/i18n";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function DirectorBoard({
  shot,
  boarding,
  onChange,
  onTitleChange,
  onRegenBoard,
}: {
  shot: Shot;
  boarding: boolean;
  onChange: (next: DirectorSettings) => void;
  onTitleChange: (t: string) => void;
  onRegenBoard: () => void;
}) {
  const { t } = useI18n();
  const settings = shot.settings;
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
  const removeBeat = (id: string) => set("timeline", settings.timeline.filter((b) => b.id !== id));

  // ---- constraints ----
  const updateConstraint = (i: number, value: string) =>
    set("constraints", settings.constraints.map((c, j) => (j === i ? value : c)));
  const addConstraint = () => set("constraints", [...settings.constraints, ""]);
  const removeConstraint = (i: number) => set("constraints", settings.constraints.filter((_, j) => j !== i));

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-accent">●</span>
        <input
          className="control flex-1 font-semibold"
          value={shot.title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      {/* Storyboard frame */}
      <div className="mb-5">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line bg-ink">
          {shot.storyboardUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.storyboardUrl} alt="storyboard" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-zinc-600">storyboard</span>
          )}
          {boarding && (
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/70 text-xs text-zinc-300">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-accent" />
              {t("shots.boarding")}
            </span>
          )}
          <button
            type="button"
            onClick={onRegenBoard}
            disabled={boarding}
            className="absolute bottom-2 right-2 rounded-md border border-line bg-panel2/90 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-500 disabled:opacity-40"
          >
            ↻ {t("board.regenBoard")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("board.duration")}>
          <input
            type="number"
            min={1}
            max={60}
            className="control"
            value={settings.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
          />
        </Field>
        <Field label={t("board.mood")}>
          <select className="control" value={settings.mood} onChange={(e) => set("mood", e.target.value)}>
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label={t("board.shotSize")}>
          <select className="control" value={settings.shotSize} onChange={(e) => set("shotSize", e.target.value)}>
            {SHOT_SIZES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label={t("board.cameraAngle")}>
          <select className="control" value={settings.cameraAngle} onChange={(e) => set("cameraAngle", e.target.value)}>
            {CAMERA_ANGLES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label={t("board.cameraMovement")}>
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
        <Field label={t("board.character")}>
          <input
            className="control"
            value={settings.character}
            onChange={(e) => set("character", e.target.value)}
            placeholder={t("board.characterPh")}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label={t("board.visualStyle")}>
          <input
            className="control"
            value={settings.visualStyle}
            onChange={(e) => set("visualStyle", e.target.value)}
            placeholder={t("board.visualStylePh")}
          />
        </Field>
      </div>

      {/* Action timeline */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="field-label">{t("board.timeline")}</span>
          <button className="text-xs text-accent2 hover:underline" onClick={addBeat} type="button">
            {t("board.addBeat")}
          </button>
        </div>
        <div className="space-y-2">
          {settings.timeline.length === 0 && <p className="text-xs text-zinc-500">{t("board.timelineEmpty")}</p>}
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
                placeholder={t("board.beatPh")}
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
          <span className="field-label">{t("board.constraints")}</span>
          <button className="text-xs text-accent2 hover:underline" onClick={addConstraint} type="button">
            {t("board.addConstraint")}
          </button>
        </div>
        <div className="space-y-2">
          {settings.constraints.length === 0 && (
            <p className="text-xs text-zinc-500">{t("board.constraintsEmpty")}</p>
          )}
          {settings.constraints.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="control flex-1"
                value={c}
                placeholder={t("board.constraintPh")}
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
