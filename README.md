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

## 接入 Gemini 时改哪里

三个 API route 已经按最终签名占好位，替换内部实现即可（搜索 `TODO(gemini)`）：

| Route              | 现在（mock）            | 接入后                                   |
| ------------------ | ------------------- | ------------------------------------- |
| `app/api/story`    | `breakdownStory()`  | Gemini 故事理解 → 镜头卡片                     |
| `app/api/compile`  | `compilePrompt()`（真，确定性） | 可选：再过一遍 Gemini 润色                 |
| `app/api/review`   | `reviewVideo()`     | Gemini 视频理解 → 逐项 pass/partial/fail + 修复 prompt |
| `app/api/storyboard` | `placeholderStoryboard()`（SVG 占位） | Gemini 图像模型 → 真实分镜图 |

把 key 放进 `.env.local`（见 `.env.example`）。

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
