# 部署到 Cloud Run

无需本地 Docker —— `gcloud run deploy --source .` 会在 Cloud Build 上用本仓库的 `Dockerfile` 构建。

## 0. 一次性准备

```bash
# 装 gcloud（macOS）
brew install --cask google-cloud-sdk

# 登录 + 选项目（替换成你的项目 ID）
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 确保项目已开启结算（Cloud Run / Cloud Build 需要）
```

> 没有项目就先在 https://console.cloud.google.com 建一个，并绑定结算账户。

## 1. 最快路径（环境变量注入 key）

```bash
export GEMINI_API_KEY=你的key
PROJECT_ID=YOUR_PROJECT_ID ./deploy.sh
```

脚本会：开启所需 API → 用 Cloud Build 构建 → 部署到 Cloud Run（东京 `asia-northeast1`，公开访问）。
完成后终端会打印一个 `https://ai-director-xxxx.run.app` 的 URL。

可覆盖的变量：`REGION`、`SERVICE`、`GEMINI_MODEL`。

## 2. 更稳的路径（Secret Manager，推荐正式用）

key 不进环境变量明文，存到 Secret Manager：

```bash
# 建 secret
printf '%s' "你的key" | gcloud secrets create gemini-api-key --data-file=-

# 让 Cloud Run 运行时服务账号能读它
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 部署，用 --update-secrets 挂载
gcloud run deploy ai-director \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --update-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash
```

更新 key：`printf '%s' "新key" | gcloud secrets versions add gemini-api-key --data-file=-`，再重新部署。

## 部署后自检

- 打开 URL，右上角徽章应显示绿色 **「Gemini 已接入」**。
- `curl https://<url>/api/status` 应返回 `{"gemini":true,...}`。
- 走一遍：Chat 拆分镜 → Compile → 用 sample → Director Review。

## 备注

- `Dockerfile` 用 Next.js standalone 输出，监听 `$PORT`（Cloud Run 给 8080）。
- `public/sample_video.mp4` 会被打进镜像，线上「用 sample」可直接用。
- key 永远不进镜像：`.dockerignore` / `.gcloudignore` 都排除了 `.env*`。
- 默认 512Mi 内存够用；如遇构建 OOM 可加 `--memory 1Gi`。
