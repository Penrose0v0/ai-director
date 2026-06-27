# AI Director

> Turn video prompting into video directing.

结构化导演工作台：用户像导演一样设定时间、景别、镜头运动、动作、情绪和限制条件，
系统将其编译成完整视频 prompt，生成视频后逐项审查是否符合导演意图，并给出修复 prompt。

## 运行

```bash
npm install
npm run dev      # http://localhost:3000
```

## 当前状态：Mock Mode

还没接入 Gemini。所有 AI 调用都走 mock，但**完整闭环 UI 与数据流已经跑通**：

```
故事 → 拆解镜头(+生成分镜图) → Director Board → Compile Prompt → 加载视频 → Director Review → 修复 Prompt
```

- **三语 UI**：右上角切换 中文 / 日本語 / English，选择持久化到 localStorage（`lib/i18n.tsx`）。
- **分镜图**：拆解故事后，每个镜头会并行生成一张分镜图（现在是 SVG 占位图，接 Gemini 图像模型后即为真实分镜）。

## 接入 Gemini

把 key 放进 **`.env.local`**（项目根目录，已被 gitignore）：

```bash
GEMINI_API_KEY=你的key
GEMINI_MODEL=gemini-2.5-flash   # 可选，默认 gemini-2.5-flash
```

改完**重启 `npm run dev`**。所有 Gemini 调用集中在 `lib/gemini.ts`，用的是稳定的
`ai.models.generateContent()` + 结构化输出（`responseJsonSchema`）。

**有 key 就走 Gemini，没 key 或调用出错都会自动回退**，app 始终可用。
每个 API response 带 `source` 字段（`gemini` / `mock` / `deterministic`）方便确认走的哪条路。

| Route                | 状态                                    |
| -------------------- | ------------------------------------- |
| `app/api/story`      | ✅ Gemini 故事理解 → 结构化分镜（回退 mock）          |
| `app/api/compile`    | ✅ Gemini Prompt Compiler（回退确定性编译器）     |
| `app/api/review`     | ⏳ 仍 mock — 需视频理解（多模态），等视频那块再接          |
| `app/api/storyboard` | ⏳ 仍 SVG 占位 — 等接 Gemini 图像模型            |

## 结构

```
app/
  page.tsx            # 工作台主编排（状态都在这）
  api/{story,compile,review}/route.ts
components/           # StoryPanel / ShotList / DirectorBoard / PromptPanel / VideoPanel / ReviewPanel ...
lib/
  types.ts            # 领域类型（DirectorSettings / Shot / ReviewResult …）
  options.ts          # 景别 / 镜头运动 / 机位 / 情绪 下拉词表
  compiler.ts         # 结构化设定 → prompt（确定性，非 mock）
  mock.ts             # 暂代 Gemini 的 mock 层
```

## Demo 视频

把演示视频放到 `public/sample.mp4`，「用 sample」按钮即可加载。
