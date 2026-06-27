// Client-side keyframe extraction.
// Loads the video in a hidden <video>, seeks to N evenly-spaced timestamps, and
// draws each to a canvas -> JPEG data URL. These frames (with timestamps) are
// sent to Gemini for the Director Review, per PROJECT.md §9 ("分析视频或关键帧").

export interface Keyframe {
  time: number;
  dataUrl: string;
}

export async function extractKeyframes(src: string, fallbackDuration = 6): Promise<Keyframe[]> {
  const video = document.createElement("video");
  video.src = src;
  video.muted = true;
  video.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("video failed to load"));
  });

  const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fallbackDuration;
  const count = Math.min(6, Math.max(3, Math.round(dur / 1.5)));

  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : (dur * i) / (count - 1);
    times.push(Math.min(t, Math.max(0, dur - 0.05)));
  }

  const canvas = document.createElement("canvas");
  const targetW = 512;
  const scale = video.videoWidth ? targetW / video.videoWidth : 1;
  canvas.width = video.videoWidth ? targetW : 512;
  canvas.height = video.videoHeight ? Math.round(video.videoHeight * scale) : 288;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");

  const frames: Keyframe[] = [];
  for (const t of times) {
    await seek(video, t);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push({ time: Math.round(t * 10) / 10, dataUrl: canvas.toDataURL("image/jpeg", 0.7) });
  }
  return frames;
}

function seek(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = t;
  });
}
