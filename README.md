# GPT Image Workbench

面向 OpenAI 官方与 OpenAI-compatible 图像接口的本地生成工作台，提供 Provider/Model 管理、异步任务处理、图片归档、历史记录、下载复用以及中英文界面。

> 当前定位：Docker-first、本地优先的可运行工程。核心生成链路已经接通；部分参考界面功能仍是明确标注的交互预览，不会伪造任务、密钥、用量或账单数据。

## 界面预览

下图是本项目采用的界面视觉参考。当前应用已基于这一方向实现完整导航、Create 工作区、History、Models 管理和响应式布局。

![GPT Image Workbench 界面参考](./gpt-image-2%20interface.png)

## 项目简介

GPT Image Workbench 是一个基于 Next.js App Router、PostgreSQL、Prisma 和独立 Worker 的图像生成平台。用户在浏览器中提交 Prompt 后，Web 应用创建生成任务，Worker 从数据库轮询队列并调用 Provider 的 `/images/generations` 接口，成功结果随后归档到本地存储并出现在 Create 与 History 页面。

项目重点是把真实业务链路与尚未接通的界面预览清晰分开：真实功能使用数据库、Provider、Worker 和图片存储；预览功能只更新浏览器本地状态，并始终显示 `Interface preview` 或“界面预览”说明。

## 功能状态

### 已连接的真实功能

- 账号登录、退出、签名会话以及 `ADMIN` / `MEMBER` 权限边界。
- Provider 与图像模型的创建、编辑、启用状态和加密 API Key 存储。
- ADMIN 在 `/models` 管理 Provider/Model；MEMBER 只能查看安全的模型目录。
- Prompt、Provider、Model、分辨率、Standard/High 质量、生成数量以及 URL/Base64 JSON 请求参数。
- Conversation、Message 和 Generation Job 数据持久化。
- Worker 队列轮询、临时错误重试、失败状态和归档状态。
- OpenAI-compatible `/images/generations` 请求。
- 远程 URL 或 Base64 图片的本地归档。
- Create 页面任务状态、真实图片预览和 Recent Generations。
- History 分页、筛选、详情预览、下载和 Prompt 复用。
- 全局英文/简体中文切换，使用 `localStorage` 在导航和刷新后保持选择。
- 桌面、平板和移动端响应式导航。

### 可交互的界面预览

以下功能已经可见、可点击并提供边界说明，但不会调用后端、写入数据库或创建虚假记录：

- Batch Jobs 与批量任务创建。
- Dataset 导入与文件选择。
- API Keys 创建界面。
- Usage & Billing 图表、周期选择和账单结构。
- Settings 中尚未持久化的外观、通知和默认生成设置。
- Ultra、Style、Seed、Guidance Scale、PNG/JPEG/WebP、Safety Filter。
- Enhance Prompt、Negative Prompt、Upscale 和 Variations。

完整刷新后，大多数预览状态会重置。预览字段不会进入真实 Provider 请求。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| Web | Next.js 15 App Router、React 19 |
| 语言 | Strict TypeScript |
| 数据 | PostgreSQL 16、Prisma 6 |
| 身份认证 | `jose` 签名会话、`bcryptjs` 密码哈希 |
| 校验 | Zod |
| Worker | Node.js / TSX 数据库轮询 Worker |
| 测试 | Vitest、Testing Library、jsdom |
| 部署 | Docker、Docker Compose |
| Provider | OpenAI 官方或 OpenAI-compatible 图像生成接口 |
| 图片存储 | 本地归档目录 / Docker named volume |

## 系统流程

```text
Browser
  -> Next.js pages and API routes
  -> PostgreSQL conversations, messages and queued jobs
  -> Worker polls queued jobs
  -> Provider /images/generations
  -> local image archive
  -> Create preview and History
```

Web 应用和 Worker 共用数据库与图片存储。Provider API Key 使用 AES-256-GCM 加密后写入数据库，页面和普通用户不会读取明文密钥。

## 页面路由

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/` | 真实 | 已认证概览和真实入口 |
| `/generate` | 真实 + 预览 | Prompt、真实生成、任务状态和参考参数界面 |
| `/history` | 真实 | 已归档图片、分页、下载与复用 |
| `/models` | 真实 | ADMIN 管理 Provider/Model；MEMBER 只读 |
| `/batch-jobs` | 预览 | 可交互的空任务界面，不创建任务 |
| `/dataset` | 预览 | 本地文件选择，不上传数据 |
| `/api-keys` | 预览 | 不生成或展示虚假密钥 |
| `/usage` | 预览 | 不伪造用量、金额或配额 |
| `/settings` | 部分预览 | 本地界面状态，不写入数据库 |
| `/login` | 真实 | 账号登录 |
| `/admin/providers` | 兼容入口 | ADMIN 验证后跳转到 `/models` |

## Docker 快速开始

### 前置条件

- Windows、macOS 或 Linux。
- Docker Desktop 或兼容的 Docker Engine 已启动。
- Git。

### 1. 克隆仓库

SSH：

```powershell
git clone git@github.com:eric-qvq/gpt-image-2-workload.git
Set-Location "gpt-image-2-workload"
```

HTTPS：

```powershell
git clone https://github.com/eric-qvq/gpt-image-2-workload.git
Set-Location "gpt-image-2-workload"
```

### 2. 校验并启动完整服务

```powershell
docker compose config --quiet
docker compose up --build
```

Compose 会启动：

- `postgres`：PostgreSQL 数据库；
- `migrate`：同步 Prisma schema 并初始化本地管理员；
- `app`：Next.js Web 应用；
- `worker`：处理队列中的生成任务。

浏览器打开：

```text
http://localhost:3000
```

默认本地管理员：

```text
账号：admin
密码：admin123456
```

> 默认账号和 Compose 默认密钥仅用于本地开发。任何共享、远程或生产环境都必须更换密码、`AUTH_SECRET`、数据库密码和 `ENCRYPTION_KEY`。

### 3. 停止服务

```powershell
docker compose down
```

不要随意运行：

```powershell
docker compose down -v
```

`-v` 会删除 PostgreSQL 和图片存储卷，现有数据库、Provider 配置和归档图片可能永久丢失。

## 首次 Provider 配置

1. 使用管理员账号登录。
2. 打开 `http://localhost:3000/models`。
3. 新增 Provider，选择 OpenAI 官方或 OpenAI-compatible 类型。
4. 填写 Provider 名称、Base URL 和 API Key。
5. 为 Provider 添加至少一个图像模型，例如 Provider 实际支持的 `gpt-image-2`。
6. 打开 `/generate`，选择模型并提交 Prompt。
7. 保持 Worker 运行；完成后的图片会显示在 Create 和 `/history`。

OpenAI-compatible Base URL 通常必须包含 API 根路径：

```text
https://gateway.example.com/v1
```

应用会在 Base URL 后调用：

```text
/images/generations
```

如果填写的是网站首页而不是 API 根路径，上游经常会返回 HTML，应用会保留并显示对应 Provider 错误。

## 非 Docker 本地开发

### 前置条件

- Node.js 22 或兼容版本。
- 可访问的 PostgreSQL 16 数据库。
- PowerShell 环境建议使用 `npm.cmd` 和 `npx.cmd`。

### 安装和初始化

```powershell
npm.cmd ci
Copy-Item .env.example .env
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run db:seed
```

复制 `.env.example` 后必须填写真实的本地数据库连接、随机 `AUTH_SECRET` 和有效的 `ENCRYPTION_KEY`。

`ENCRYPTION_KEY` 必须是解码后恰好 32 字节的 Base64 字符串。PowerShell 可生成一个本地密钥：

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

将最后输出的 Base64 字符串写入本地 `.env`，不要提交该文件。

### 分终端运行

终端一：

```powershell
npm.cmd run dev
```

终端二：

```powershell
npm.cmd run worker
```

非 Docker 模式下，Web 应用只负责创建和查询任务；若 Worker 未运行，任务会停留在队列中。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `AUTH_SECRET` | 会话令牌签名密钥 |
| `ENCRYPTION_KEY` | Base64 编码、解码后 32 字节的 Provider 密钥加密主密钥 |
| `STORAGE_ROOT` | 生成图片本地归档目录 |
| `WORKER_POLL_INTERVAL_MS` | Worker 队列轮询间隔，默认 2000 ms |
| `WORKER_MAX_RETRIES` | 临时失败重试次数，默认 2 |

Compose 文件提供了本地开发默认值，但生产或共享环境必须通过安全的环境配置覆盖这些值。

## 数据持久化

Docker Compose 使用三个 named volumes：

| Volume | 内容 |
| --- | --- |
| `postgres-data` | PostgreSQL 数据库 |
| `image-storage` | 归档后的生成图片 |
| `node-modules` | 容器依赖 |

源码目录中的 `storage/generated-images/` 只跟踪 `.gitkeep`。真实生成图片、数据库数据和 Provider API Key 不应进入 Git。

## 测试与构建

```powershell
npx.cmd prisma generate
npm.cmd test -- tests/ui
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config --quiet
```

测试覆盖认证边界、Provider 错误、Generation Job、Worker 重试、图片归档、History、下载复用、响应式 UI、界面预览网络隔离以及全局语言持久化。

宿主机和 Compose 会共享项目目录与 `.next`。如果容器正在运行并需要执行宿主机生产构建，先安全停止服务：

```powershell
docker compose down
npm.cmd run build
```

不要添加 `-v`。

## 项目结构

```text
src/app/                    Next.js 页面与 API routes
src/components/             布局、生成、历史、模型和预览组件
src/server/auth/            登录、会话、权限与管理员初始化
src/server/providers/       Provider 仓库、加密与适配器
src/server/jobs/            Generation Job 仓库与类型
src/server/worker/          队列轮询和任务处理
src/server/history/         历史图片查询
src/server/storage/         图片下载、归档与本地存储
prisma/                     数据模型与 seed
tests/                      API、认证、Provider、Worker、存储和 UI 测试
docs/                       设计、实施计划、review 与交接记录
storage/generated-images/   本地图片目录，只跟踪 .gitkeep
```

## Git 分支与回滚

- `main`：GitHub 默认展示和稳定 checkpoint 分支。
- `feature/gpt-image-platform`：保留应用开发的完整提交历史。

建议每个明确阶段都先提交并创建标签：

```powershell
git add -A
git commit -m "feat: describe the completed change"
git tag -a checkpoint-2026-07-24 -m "GPT Image Workbench checkpoint"
git push
git push origin checkpoint-2026-07-24
```

查看历史：

```powershell
git log --graph --oneline --decorate --all
```

需要检查旧版本时，优先创建恢复分支，避免直接破坏当前工作：

```powershell
git switch -c restore/checkpoint checkpoint-2026-07-24
```

对已经共享到 GitHub 的错误提交，通常优先使用 `git revert` 创建反向提交，而不是强制改写远程历史。

## 常见问题

### `no configuration file provided: not found`

当前目录没有 `docker-compose.yml`。合并后的仓库应从克隆目录根部运行：

```powershell
Get-ChildItem docker-compose.yml
docker compose up --build
```

### 无法连接 `dockerDesktopLinuxEngine`

启动 Docker Desktop，等待 Engine 完全就绪，然后检查：

```powershell
docker version
docker compose ps
```

### Generate 提示没有可用 Provider 或 Model

使用 ADMIN 打开 `/models`，同时创建并启用 Provider 与至少一个模型。只有启用的 Provider/Model 会出现在真实生成选项中。

### 上游返回 `text/html` 而不是 JSON

通常是 Base URL 指向网页首页或缺少 `/v1`。确认 Provider 的真实 API 根路径，并确认它兼容 `/images/generations`。

### `ENCRYPTION_KEY must decode to 32 bytes`

当前密钥不是有效的 32 字节 Base64。重新生成密钥并重启 app 与 worker。已有加密 Provider 数据必须继续使用原密钥，否则无法解密。

### 任务一直停留在 Queued

确认 Worker 正在运行：

```powershell
docker compose ps
docker compose logs -f worker
```

非 Docker 模式需要在独立终端运行 `npm.cmd run worker`。

## 安全说明

- 不要提交 `.env`、真实 API Key、会话密钥、数据库、生成图片或日志中的敏感内容。
- Provider API Key 在数据库中使用 AES-256-GCM 加密，但加密安全依赖 `ENCRYPTION_KEY` 的保密性。
- 默认管理员密码和 Compose 默认密钥只适用于隔离的本地开发环境。
- MEMBER 不应获得 Provider 密钥或管理字段。
- 预览页面不会生成虚假密钥、账单、用量、通知、任务或图片。

## 当前项目状态

当前版本已完成本地端到端生成主链路、完整参考界面、响应式导航和全局语言持久化。Batch Jobs、Dataset、API Keys、Usage & Billing 及部分高级生成设置仍是明确标注的前端预览，需要单独设计后端、权限和数据模型后才能接通。

---

# English Overview

GPT Image Workbench is a Docker-first local image-generation platform built with Next.js, React, PostgreSQL, Prisma, and a separate queue worker. It supports configurable OpenAI and OpenAI-compatible image providers, encrypted Provider credentials, asynchronous jobs, local image archiving, History, Download, Reuse, responsive navigation, and persistent English/Chinese UI selection.

## Implemented capabilities

- Signed login sessions with ADMIN and MEMBER boundaries.
- Real Provider and image-model administration.
- Prompt submission and queued generation jobs.
- Worker polling, retries, Provider calls, and archive states.
- Local image storage, paginated History, Download, and Reuse.
- Chinese/English interface persistence across navigation and refresh.

Batch Jobs, Dataset, API Keys, Usage & Billing, and several advanced generation controls are interactive interface previews. They do not create records, credentials, usage totals, bills, or Provider requests.

## Docker quick start

```powershell
git clone https://github.com/eric-qvq/gpt-image-2-workload.git
Set-Location "gpt-image-2-workload"
docker compose config --quiet
docker compose up --build
```

Open `http://localhost:3000`.

Local development credentials:

```text
Account: admin
Password: admin123456
```

Change the default account, `AUTH_SECRET`, database password, and `ENCRYPTION_KEY` before using the application outside an isolated local environment.

## Provider setup

Sign in as an administrator, open `/models`, add an OpenAI or OpenAI-compatible Provider, register an enabled image model, and then generate from `/generate`. Compatible gateways normally require a Base URL ending in `/v1` and must implement `/images/generations`.

## Local development

```powershell
npm.cmd ci
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run db:seed
npm.cmd run dev
```

Run `npm.cmd run worker` in a second terminal.

## Verification

```powershell
npx.cmd prisma generate
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config --quiet
```

## Security and persistence

Never commit `.env`, real API keys, generated images, database data, or build artifacts. `ENCRYPTION_KEY` must be Base64 that decodes to exactly 32 bytes. Docker named volumes keep PostgreSQL data, archived images, and container dependencies; do not run `docker compose down -v` unless permanent deletion is intended.

## Project status

The core local generation workflow is connected and tested. Preview-only product areas remain explicitly disconnected until separate backend, authorization, and data-model work is designed.
