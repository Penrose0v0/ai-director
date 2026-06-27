"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "zh" | "ja" | "en";
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
];

// Flat dictionary. `zh` is the source of truth; ja/en must mirror its keys.
const zh = {
  "header.tagline": "把写视频 prompt 变成导演视频。",
  "header.mock": "mock 模式 · 未接入 Gemini",
  "header.live": "Gemini 已接入",

  "story.sample": "雨夜东京，一个女生收到神秘短信后，看到远处黑影并开始逃跑。",

  "chat.title": "Chat · 导演助手",
  "chat.greeting": "嗨，我是你的 AI 副导演。先用一句话告诉我你想拍什么，我来把它拆成分镜。",
  "chat.placeholder": "描述你的故事或想调整的地方…",
  "chat.send": "发送",
  "chat.thinking": "思考中…",
  "chat.useSample": "用示例故事",
  "chat.reply": "已根据你的故事拆出 {n} 个分镜，并生成了分镜图。点下方分镜流里的任意一格来细化导演设定。",

  "flow.title": "Story Board Flow · 分镜流",
  "flow.empty": "还没有分镜。在左边用 Chat 描述你的故事，我来拆。",
  "flow.add": "+ 分镜",
  "shots.newTitle": "新镜头",
  "shots.boarding": "分镜生成中…",

  "board.empty": "先在左侧拆解故事或新建镜头，开始导演。",
  "board.regenBoard": "重画分镜",
  "board.duration": "时长 (秒)",
  "board.mood": "情绪",
  "board.shotSize": "景别",
  "board.cameraAngle": "机位角度",
  "board.cameraMovement": "镜头运动",
  "board.character": "人物",
  "board.characterPh": "年轻女性，黑色外套…",
  "board.visualStyle": "视觉风格",
  "board.visualStylePh": "rainy Tokyo night, neon reflections…",
  "board.timeline": "动作时间轴",
  "board.addBeat": "+ 加一段",
  "board.timelineEmpty": "还没有动作。点「+ 加一段」按秒拆分动作。",
  "board.beatPh": "此刻发生的动作…",
  "board.constraints": "限制条件（禁止事项 / 连续性）",
  "board.addConstraint": "+ 加一条",
  "board.constraintsEmpty": "例如：不要换衣服、不要出现额外人物、不要变成白天。",
  "board.constraintPh": "一条限制…",

  "prompt.title": "3 · 编译后的 Prompt",
  "prompt.empty": "点下面的按钮，把导演设定编译成完整 prompt。",
  "prompt.compile": "编译 Prompt",
  "prompt.compiling": "编译中…",

  "video.title": "4 · 生成视频",
  "video.useSample": "用 sample",
  "video.upload": "上传",
  "video.empty": "还没有视频 · 加载 sample 或上传一个",
  "video.review": "导演审查",
  "video.reviewing": "审查中…",
  "video.needVideo": "先加载视频再审查",

  "review.title": "5 · 导演审查",
  "review.empty": "审查后，这里会逐项显示符合 / 部分符合 / 不符合，并给出修复 prompt。",
  "review.colExpect": "导演设定",
  "review.colObserved": "生成结果",
  "review.colStatus": "状态",
  "review.fixTitle": "6 · 修复 Prompt",

  "status.pass": "符合",
  "status.partial": "部分符合",
  "status.fail": "不符合",

  "common.copy": "复制",
  "common.copied": "已复制 ✓",
};

type Dict = typeof zh;

const ja: Dict = {
  "header.tagline": "動画プロンプトを、動画の演出へ。",
  "header.mock": "モックモード · Gemini 未接続",
  "header.live": "Gemini 接続済み",

  "story.sample": "雨の東京の夜、一人の少女が謎のメッセージを受け取り、遠くの影を見て逃げ出す。",

  "chat.title": "Chat · 演出アシスタント",
  "chat.greeting": "やあ、AI 副監督です。撮りたいものを一言で教えてください。ショットに分解します。",
  "chat.placeholder": "ストーリーや調整したい点を入力…",
  "chat.send": "送信",
  "chat.thinking": "考え中…",
  "chat.useSample": "サンプルを使う",
  "chat.reply": "ストーリーから {n} 個のショットに分解し、絵コンテを生成しました。下のフローから選んで演出を詰めましょう。",

  "flow.title": "ストーリーボードフロー",
  "flow.empty": "まだショットがありません。左の Chat でストーリーを教えてください。",
  "flow.add": "+ ショット",
  "shots.newTitle": "新規ショット",
  "shots.boarding": "絵コンテ生成中…",

  "board.empty": "左側でストーリーを分解するか、ショットを追加して演出を始めましょう。",
  "board.regenBoard": "絵コンテ再生成",
  "board.duration": "長さ (秒)",
  "board.mood": "ムード",
  "board.shotSize": "ショットサイズ",
  "board.cameraAngle": "カメラアングル",
  "board.cameraMovement": "カメラワーク",
  "board.character": "キャラクター",
  "board.characterPh": "黒いコートの若い女性…",
  "board.visualStyle": "ビジュアルスタイル",
  "board.visualStylePh": "rainy Tokyo night, neon reflections…",
  "board.timeline": "アクションタイムライン",
  "board.addBeat": "+ 追加",
  "board.timelineEmpty": "アクションがありません。「+ 追加」で秒ごとに分けましょう。",
  "board.beatPh": "この瞬間のアクション…",
  "board.constraints": "制約（禁止事項 / 連続性）",
  "board.addConstraint": "+ 追加",
  "board.constraintsEmpty": "例：服を変えない、余計な人物を出さない、昼にしない。",
  "board.constraintPh": "制約を一つ…",

  "prompt.title": "3 · コンパイル済みプロンプト",
  "prompt.empty": "下のボタンで、演出設定を完全なプロンプトにコンパイルします。",
  "prompt.compile": "プロンプトをコンパイル",
  "prompt.compiling": "コンパイル中…",

  "video.title": "4 · 動画生成",
  "video.useSample": "サンプル使用",
  "video.upload": "アップロード",
  "video.empty": "動画なし · サンプルを読み込むかアップロード",
  "video.review": "ディレクターレビュー",
  "video.reviewing": "レビュー中…",
  "video.needVideo": "先に動画を読み込んでください",

  "review.title": "5 · ディレクターレビュー",
  "review.empty": "レビュー後、各項目の 合致 / 部分合致 / 不合致 と修正プロンプトが表示されます。",
  "review.colExpect": "演出設定",
  "review.colObserved": "生成結果",
  "review.colStatus": "状態",
  "review.fixTitle": "6 · 修正プロンプト",

  "status.pass": "合致",
  "status.partial": "部分合致",
  "status.fail": "不合致",

  "common.copy": "コピー",
  "common.copied": "コピー済 ✓",
};

const en: Dict = {
  "header.tagline": "Turn video prompting into video directing.",
  "header.mock": "mock mode · Gemini not connected",
  "header.live": "Gemini connected",

  "story.sample":
    "A rainy Tokyo night: a young woman receives a mysterious message, sees a distant shadow, and starts to run.",

  "chat.title": "Chat · Director Assistant",
  "chat.greeting":
    "Hi, I'm your AI assistant director. Tell me what you want to shoot in a sentence, and I'll break it into shots.",
  "chat.placeholder": "Describe your story or what to adjust…",
  "chat.send": "Send",
  "chat.thinking": "Thinking…",
  "chat.useSample": "Use sample story",
  "chat.reply":
    "I broke your story into {n} shots and generated storyboards. Pick any frame in the flow below to refine the directing.",

  "flow.title": "Story Board Flow",
  "flow.empty": "No shots yet. Describe your story in the Chat on the left and I'll break it down.",
  "flow.add": "+ Shot",
  "shots.newTitle": "New shot",
  "shots.boarding": "Storyboarding…",

  "board.empty": "Break down a story or add a shot on the left to start directing.",
  "board.regenBoard": "Redraw board",
  "board.duration": "Duration (s)",
  "board.mood": "Mood",
  "board.shotSize": "Shot Size",
  "board.cameraAngle": "Camera Angle",
  "board.cameraMovement": "Camera Movement",
  "board.character": "Character",
  "board.characterPh": "young woman, black coat…",
  "board.visualStyle": "Visual Style",
  "board.visualStylePh": "rainy Tokyo night, neon reflections…",
  "board.timeline": "Action Timeline",
  "board.addBeat": "+ Add beat",
  "board.timelineEmpty": "No actions yet. Click “+ Add beat” to split the action by second.",
  "board.beatPh": "what happens at this moment…",
  "board.constraints": "Constraints (do-nots / continuity)",
  "board.addConstraint": "+ Add",
  "board.constraintsEmpty": "e.g. don't change clothes, no extra people, don't turn into daytime.",
  "board.constraintPh": "one constraint…",

  "prompt.title": "3 · Compiled Prompt",
  "prompt.empty": "Compile the director settings into a full prompt with the button below.",
  "prompt.compile": "Compile Prompt",
  "prompt.compiling": "Compiling…",

  "video.title": "4 · Generated Video",
  "video.useSample": "Use sample",
  "video.upload": "Upload",
  "video.empty": "No video yet · load a sample or upload one",
  "video.review": "Director Review",
  "video.reviewing": "Reviewing…",
  "video.needVideo": "Load a video before reviewing",

  "review.title": "5 · Director Review",
  "review.empty":
    "After review, each setting shows pass / partial / fail here, plus a fix prompt.",
  "review.colExpect": "Director setting",
  "review.colObserved": "Generated result",
  "review.colStatus": "Status",
  "review.fixTitle": "6 · Fix Prompt",

  "status.pass": "Pass",
  "status.partial": "Partial",
  "status.fail": "Fail",

  "common.copy": "Copy",
  "common.copied": "Copied ✓",
};

const DICTS: Record<Locale, Dict> = { zh, ja, en };

type Vars = Record<string, string | number>;
type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (k: keyof Dict, vars?: Vars) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("ai-director-locale") as Locale | null;
    if (saved && DICTS[saved]) setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("ai-director-locale", l);
  };

  const t = (k: keyof Dict, vars?: Vars) => {
    let s: string = DICTS[locale][k] ?? k;
    if (vars) for (const [key, val] of Object.entries(vars)) s = s.replace(`{${key}}`, String(val));
    return s;
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
