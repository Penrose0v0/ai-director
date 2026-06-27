# AI Director 项目企划书

## 1. 项目名称

**AI Director**

副标题：

**Turn video prompting into video directing.**

中文定位：

**AI Director 是一个结构化导演工作台。用户不再只写一整段视频 prompt，而是像导演一样设定时间、景别、镜头运动、人物动作、情绪和限制条件。系统将这些导演设定编译成完整的视频生成 prompt，并在视频生成后判断结果是否符合用户的导演意图。**

---

## 2. 项目背景

现在的 AI 视频生成工具已经可以通过文字或图片生成短视频。用户只需要输入一句 prompt，就能得到一个视频片段。

但这种方式有一个明显问题：

**用户只能“描述”想要的视频，而不能真正“导演”视频。**

在真实影视创作中，导演不会只说一句“生成一个雨夜逃跑的镜头”。导演会具体决定：

* 这个镜头持续几秒
* 第几秒发生什么动作
* 用远景、中景、近景还是特写
* 摄影机是推进、跟拍、摇镜还是固定
* 人物在画面中如何移动
* 情绪如何变化
* 哪些元素必须保持一致
* 哪些东西绝对不能出现

但在现有 AI 视频工具中，这些导演意图通常都被塞进一大段自然语言 prompt 里。
结果是：

* 用户很难精确表达镜头调度
* AI 容易忽略某些关键要求
* 生成结果和用户预期不一致
* 用户不知道问题出在哪里
* 修改时只能反复改 prompt、重新生成

因此，我们希望通过 AI Director，把“写 prompt”变成“导演镜头”。

---

## 3. 核心问题

AI 视频生成目前的主要交互方式仍然是 prompt box。

这种方式适合快速生成单个画面，但不适合表达复杂的导演意图。

主要问题包括：

### 3.1 Prompt 太自由，导演意图容易丢失

用户必须把时间、动作、景别、镜头运动、情绪、光线、限制条件全部写进一段文字中。
这对普通用户不直观，对专业创作者也不够可控。

### 3.2 用户无法结构化控制镜头

现有工具通常缺少清晰的导演控制项，例如：

* 时间轴控制
* 景别选择
* 摄影机运动选择
* 人物动作阶段
* 画面重点
* 禁止事项
* 连续性约束

用户不是在“导演”，而是在“写描述”。

### 3.3 生成后缺少反馈机制

视频生成后，如果结果不符合预期，用户通常只能自己判断问题，再手动修改 prompt。
系统不会明确告诉用户：

* 哪些导演设定被满足了
* 哪些导演设定没有被满足
* 是动作错了，还是镜头运动错了
* 是场景错了，还是人物状态错了
* 下一次应该如何修正 prompt

---

## 4. 项目目标

AI Director 的目标是构建一个面向 AI 视频生成的结构化导演界面。

我们希望用户能够完成以下流程：

**写故事 → 设计镜头 → 编译 prompt → 生成视频 → 审查结果 → 获得修复建议**

项目目标不是替代视频生成模型，而是为视频生成模型提供一个更清晰、更可控的前端导演层。

---

## 5. 核心概念

### 5.1 Director Board

Director Board 是用户设计镜头的主要界面。

用户不需要直接写一大段 prompt，而是通过结构化控件设定镜头。

可设置内容包括：

| 控制项             | 示例                         |
| --------------- | -------------------------- |
| Duration        | 6 秒                        |
| Shot Size       | Medium Close-up            |
| Camera Movement | Slow Dolly In              |
| Camera Angle    | Eye Level                  |
| Action Timeline | 0–2s 看手机；2–4s 抬头；4–6s 看到黑影 |
| Character       | 年轻女性，黑色外套，手持手机             |
| Mood            | Suspenseful                |
| Visual Style    | 雨夜东京，霓虹灯反射，电影感             |
| Constraints     | 不要换衣服，不要出现额外人物，不要变成白天      |

这些设定共同组成用户的导演意图。

---

### 5.2 Prompt Compiler

Prompt Compiler 负责把用户的结构化导演设定转换成完整的视频生成 prompt。

用户填写的是：

```text
Duration: 6s
Shot Size: Medium Close-up
Camera Movement: Slow Dolly In
Action Timeline:
0–2s: character looks at phone
2–4s: character raises her head
4–6s: character notices a shadow
Mood: Suspenseful
Visual Style: rainy Tokyo night, neon reflections
Constraints: same black coat, same phone, no extra people
```

系统编译成：

```text
A cinematic medium close-up shot of a young woman wearing a black coat,
standing outside a convenience store on a rainy Tokyo night with neon reflections
on the wet pavement. From 0 to 2 seconds, she looks down at her smartphone
with hesitation. From 2 to 4 seconds, she slowly raises her head. From 4 to 6
seconds, the camera performs a slow dolly-in as she notices a dark shadow in
the background. Keep the same black coat and the same phone. Do not add extra
people. Do not change the rainy night environment.
```

这个过程类似把“导演语言”编译成“模型语言”。

---

### 5.3 Video Generation

系统将完整 prompt 发送给视频生成模型，生成视频片段。

在黑客松 MVP 中，可以采用两种方式：

1. **现场调用视频生成模型**
   用户点击生成，系统调用视频生成 API。

2. **使用预设 sample video**
   为了保证现场 demo 稳定，系统可以先加载预先生成的视频，用于演示后续的 Director Review。

核心重点不是展示生成速度，而是展示完整导演闭环。

---

### 5.4 Director Review

Director Review 使用视频理解模型判断生成结果是否符合用户的导演设定。

它不是泛泛地评价视频质量，而是逐项检查：

| 用户设定              | 生成结果         | 判断   |
| ----------------- | ------------ | ---- |
| 0–2s 看手机          | 角色直接看向镜头     | 不符合  |
| 2–4s 抬头           | 角色没有明显抬头动作   | 不符合  |
| Slow Dolly In     | 镜头基本静止       | 不符合  |
| Rainy Tokyo Night | 场景是夜晚，但地面不够湿 | 部分符合 |
| Same Black Coat   | 外套保持黑色       | 符合   |
| No Extra People   | 背景出现多人       | 不符合  |

这样，用户可以清楚知道：
视频哪里符合导演意图，哪里偏离了导演意图。

---

### 5.5 Fix Prompt Generator

当生成结果不符合设定时，系统会自动生成修复建议和新的 prompt。

示例：

```text
The generated video does not clearly show the character looking at the phone
during the first 2 seconds, and the camera movement is too static. Regenerate
the shot with a clearer 0–2s phone-checking action and a visible slow dolly-in
camera movement. Emphasize that the character must first look down at the phone,
then raise her head, then notice the shadow.
```

用户可以直接复制修复 prompt，进行下一次生成。

---

## 6. 产品流程

AI Director 的完整流程如下：

### Step 1：输入故事

用户输入一个简短故事。

示例：

```text
雨夜东京，一个女生收到神秘短信后，看到远处黑影并开始逃跑。
```

---

### Step 2：创建镜头

系统根据故事生成初始镜头建议，用户可以修改。

示例镜头：

* Shot 1：女生站在便利店门口看手机
* Shot 2：她抬头看到远处黑影
* Shot 3：她跑进雨中

---

### Step 3：用户手动设定导演参数

用户选择或填写：

* 镜头时长
* 景别
* 镜头运动
* 机位
* 动作时间轴
* 场景风格
* 情绪
* 限制条件

---

### Step 4：编译完整 prompt

系统把结构化导演设定和表现 prompt 合并，生成完整 prompt。

---

### Step 5：生成视频

系统调用视频生成模型，或加载预设生成结果。

---

### Step 6：视频理解审查

系统分析生成视频，并判断视频是否符合用户设定。

---

### Step 7：生成修复建议

系统指出问题，并生成下一版修复 prompt。

---

## 7. MVP 功能范围

黑客松版本应专注于最小闭环。

### 必做功能

1. 故事输入
2. 镜头卡片生成
3. 用户手动设置导演参数
4. Prompt Compiler
5. 展示完整 prompt
6. 加载或上传生成视频
7. Director Review
8. 输出符合 / 不符合项
9. 生成修复 prompt

---

### 可选功能

1. 多镜头 timeline
2. 图片参考上传
3. 视频生成 API 接入
4. 多版本对比
5. 结果导出
6. Shot preset 模板

---

### 暂不实现

1. 完整视频剪辑器
2. 多人协作
3. 账号系统
4. 复杂项目管理
5. 自研视频生成模型
6. 完整商业化功能

---

## 8. Demo 设计

### Demo 故事

```text
雨夜东京，一个女生收到神秘短信后，看到远处黑影并开始逃跑。
```

### Demo 镜头

选择一个核心镜头进行演示：

**Shot 1：女生在便利店门口收到短信，并抬头看到黑影。**

用户设定：

| 项目              | 设定                                           |
| --------------- | -------------------------------------------- |
| Duration        | 6s                                           |
| Shot Size       | Medium Close-up                              |
| Camera Movement | Slow Dolly In                                |
| Camera Angle    | Eye Level                                    |
| Action Timeline | 0–2s 看手机；2–4s 抬头；4–6s 看到黑影                   |
| Mood            | Suspenseful                                  |
| Visual Style    | Rainy Tokyo night, neon reflections          |
| Constraints     | Same black coat, same phone, no extra people |

---

### Demo 流程

1. 用户输入故事。
2. 系统创建一个镜头卡片。
3. 用户手动设定景别、镜头运动、动作时间轴和限制条件。
4. 用户点击 **Compile Prompt**。
5. 系统生成完整视频 prompt。
6. 系统加载生成视频。
7. 用户点击 **Director Review**。
8. Gemini 分析视频是否符合导演设定。
9. 系统输出问题列表。
10. 系统生成修复 prompt。

---

### Demo 中可以故意展示的问题

为了让 demo 更清楚，可以准备一个有问题的视频：

* 角色没有看手机
* 镜头没有推进
* 背景不是雨夜
* 画面中出现额外人物
* 角色服装颜色改变

Director Review 输出：

| 检查项               | 结果               | 状态   |
| ----------------- | ---------------- | ---- |
| 0–2s 看手机          | 没有明显看手机动作        | 不符合  |
| Slow Dolly In     | 镜头基本静止           | 不符合  |
| Rainy Tokyo Night | 夜晚存在，但没有明显雨水和湿地面 | 部分符合 |
| Same Black Coat   | 外套颜色变成灰色         | 不符合  |
| No Extra People   | 背景出现路人           | 不符合  |

---

## 9. 技术方案

### 前端

* Next.js
* Shot card UI
* Director Board
* Prompt preview
* Video preview
* Review result table

---

### 后端

* Next.js API Routes 或 FastAPI
* 接收结构化导演参数
* 调用 Gemini 生成完整 prompt
* 调用 Gemini 分析视频或关键帧
* 返回结构化 review result

---

### Google Cloud 使用

* Cloud Run：部署 Web App
* Gemini API：prompt 编译、视频理解、修复建议生成
* Cloud Storage：保存上传视频或关键帧
* Firestore：保存项目、镜头参数和 review 结果

---

### Gemini 使用点

1. **故事理解**
   从用户故事中提取人物、场景、情绪和动作。

2. **Prompt 编译**
   将结构化导演设定转换成完整视频生成 prompt。

3. **视频理解**
   分析生成视频是否符合导演设定。

4. **结果判断**
   将每项导演设定标记为符合、部分符合或不符合。

5. **修复建议生成**
   根据不符合项生成新的修复 prompt。

---

## 10. 项目创新点

### 10.1 从 Prompt Box 到 Director Board

传统 AI 视频工具让用户输入一段 prompt。
AI Director 让用户通过结构化导演界面控制视频。

这让用户从“描述视频”变成“设计镜头”。

---

### 10.2 从自然语言提示到结构化导演控制

AI Director 把镜头控制拆成明确字段：

* 时间
* 景别
* 镜头运动
* 动作
* 情绪
* 视觉风格
* 限制条件

这些字段比一整段 prompt 更清晰，也更容易检查。

---

### 10.3 Prompt Compiler

系统不是简单拼接文字，而是把用户的导演设定转化成更适合视频生成模型理解的完整 prompt。

---

### 10.4 Director Compliance Check

生成视频后，系统检查视频是否遵守用户的导演设定。

这让 AI 视频生成从一次性输出变成可迭代流程：

**设定 → 生成 → 检查 → 修复**

---

## 11. 用户体验目标

AI Director 希望让用户获得一种“我在导演 AI 视频”的感觉。

用户不需要掌握复杂影视术语，也不需要写很长的 prompt。
系统通过结构化控件帮助用户明确表达：

* 我想在第几秒发生什么
* 我想用什么镜头看这个动作
* 我希望摄影机如何运动
* 我希望观众注意哪里
* 我不希望 AI 改掉哪些东西

最终体验应该是：

**用户负责导演意图，AI 负责生成和检查。**

---

## 12. 项目总结

AI Director 不是另一个普通的 AI 视频生成器。

它解决的是 AI 视频生成中的交互问题：

**用户不应该只能写 prompt，而应该能够像导演一样控制镜头。**

AI Director 通过结构化 Director Board，让用户设定时间、景别、镜头运动、动作、情绪和限制条件。
系统将这些设定编译成完整 prompt，生成视频后再用 Gemini 检查结果是否符合导演意图，并给出修复建议。

最终，AI Director 让 AI 视频生成从：

**Prompt-based generation**

转变为：

**Direction-based generation**

核心一句话：

**AI Director 把写视频 prompt 变成导演视频。**
