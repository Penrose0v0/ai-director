// Placeholder storyboard-frame generator.
//
// Stands in for a Gemini image-generation call. Produces a deterministic,
// film-frame-style SVG (as a data URI) so the breakdown flow shows a real
// image per shot with no network. The signature — (prompt, index) => imageUrl —
// is what the Gemini-backed version should keep.

const HUES = [255, 210, 330, 25, 160, 285];

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);
}

/** Wrap text into <=maxChars lines, capped at maxLines. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
    if (lines.length >= maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  // For non-space scripts (zh/ja), fall back to hard slicing.
  if (lines.length === 1 && lines[0].length > maxChars) {
    const s = lines[0];
    const out: string[] = [];
    for (let i = 0; i < s.length && out.length < maxLines; i += maxChars) {
      out.push(s.slice(i, i + maxChars));
    }
    return out;
  }
  return lines;
}

export function placeholderStoryboard(prompt: string, index = 0): string {
  const hue = HUES[index % HUES.length];
  const lines = wrap(prompt.trim() || "storyboard", 22, 3);
  const text = lines
    .map(
      (l, i) =>
        `<text x="48" y="${250 + i * 30}" font-family="ui-monospace, monospace" font-size="20" fill="#e4e4e7">${esc(
          l,
        )}</text>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 40% 16%)"/>
      <stop offset="1" stop-color="hsl(${hue} 45% 8%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <rect x="20" y="20" width="600" height="320" fill="none" stroke="hsl(${hue} 50% 45%)" stroke-opacity="0.35" stroke-width="2"/>
  <line x1="0" y1="40" x2="640" y2="40" stroke="#000" stroke-opacity="0.4"/>
  <line x1="0" y1="320" x2="640" y2="320" stroke="#000" stroke-opacity="0.4"/>
  <text x="48" y="90" font-family="ui-monospace, monospace" font-size="13" fill="hsl(${hue} 40% 70%)" letter-spacing="2">STORYBOARD · FRAME ${String(
    index + 1,
  ).padStart(2, "0")}</text>
  ${text}
  <text x="592" y="305" text-anchor="end" font-family="ui-monospace, monospace" font-size="12" fill="hsl(${hue} 30% 55%)">AI DIRECTOR</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
