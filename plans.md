# GPT Image Workbench 当前接手计划

> 状态：UI 改版已完成并通过验证，等待用户决定是否提交或继续迭代  
> 更新时间：2026-07-12  
> 外层协调仓库：`C:\Users\29800\Desktop\gpt-image-2-workload`  
> 实际应用：`C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform`  
> 应用分支：`feature/gpt-image-platform`  
> 当前应用 HEAD：`68e8ce5 docs: add reference UI redesign spec`

## 0. 2026-07-12 最终执行结果

- 统一浅色 `AppShell` 已覆盖 Overview、Create、History 和 Provider Admin；Login 保持独立。
- Create 已实现 Prompt、真实 Preview、Parameters 三部分工作台和真实 Recent Generations。
- History 已验证 Lightbox、Escape、遮罩关闭、Download 和完整参数 Reuse。
- 375、767、1023、1279、1536px 均无页面级水平滚动；目标交互控件均至少 44px，原生 checkbox 保持 16×16。
- Provider Admin 提交按钮已降为中性层级；Generate、History Apply 和 Login Sign in 保留主 CTA 强度。
- 最终门禁：UI `17 files / 95 tests`、全量 `34 files / 129 tests`、typecheck、Next build、Compose config 和 `docker compose up --build -d` 均通过。
- 最终容器：app、worker 运行，postgres healthy；浏览器 Console 无新增错误。
- 本轮未提交、未暂存、未 reset/clean；现有脏 worktree 原样保留。

运行注意：Compose 将 worktree 绑定到 `/app`。不要在运行中的 `next dev` 容器旁直接执行宿主机 `next build` 后继续浏览；两者共享 `.next`，可能触发 React Client Manifest 500。应先完成 typecheck/build，再启动 Compose；若顺序反了，重启 app 容器。

## 1. 文档职责与优先级

本文件是 2026-07-12 起的当前交接与执行入口。2026-07-11 之前的计划和设计文档保持原样，只作为历史资料或专项规范，不再直接修改。

遇到不同文档说法不一致时，按以下职责判断：

1. 根目录 `AGENTS.md`：工作目录、命令、代码风格和安全规则。
2. `docs/superpowers/specs/2026-07-10-reference-ui-redesign-design.md`：已经批准的 UI 产品与设计要求。
3. 本 `plans.md`：当前 Git 状态、实施顺序、验证流程和接手入口。
4. `.worktrees/gpt-image-platform/plans.md`：2026-07-11 的对话交接快照，冻结为历史记录。
5. `docs/superpowers/plans/2026-04-27-gpt-image-delivery-platform.md`：从空仓库搭建 MVP 的历史实施计划，不得重新从头执行。
6. `docs/project-review.md` 和旧 session log：仅用于了解历史问题，不代表当前源码状态。

命令冲突时，以根 `AGENTS.md` 为准：PowerShell 使用 `npm.cmd`、`npx.cmd`；当前数据库同步使用 `npx.cmd prisma db push`，不是 `prisma migrate dev`。

## 2. 一分钟项目摘要

这是一个 Next.js 图片生成工作台。管理员配置 OpenAI 或 OpenAI-compatible Provider 和模型；用户提交 Prompt 后，API 创建数据库任务，独立 Worker 调用上游图片接口，将结果归档到本地存储，并在生成页和历史页中展示、下载和复用。

用户已经批准方案 A：

- Overview、Create、History、Provider Admin 使用统一浅色顶栏和侧边栏。
- `/generate` 改成 Prompt、真实结果 Preview、Parameters 三部分工作台。
- `/login` 保持独立页面，但使用相同视觉语言。
- Recent Generations 只能显示真实归档图片。
- 不添加 Quota、Billing、Batch Jobs、API Keys、Seed、Guidance、Negative Prompt 等后端不存在的假功能。

本次参考图 UI 改版已经写入当前 worktree 并完成验证。Worktree 中仍有大量既有业务、UI 和测试修改，后续只能继续增量修改。

## 3. 两层工作区

### 外层协调仓库

路径：

```text
C:\Users\29800\Desktop\gpt-image-2-workload
```

用途：保存 `AGENTS.md`、本计划、设计资料、评审记录、参考图片和对话转录。这里没有应用的 `package.json` 或 `docker-compose.yml`，不能运行 npm、Prisma 或 Compose 应用命令。

### 实际应用 worktree

路径：

```text
C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform
```

用途：保存并运行 Next.js、Prisma、Vitest、Worker 和 Docker Compose 工程。所有实现修改和应用验证都在这里完成。

## 4. 当前状态快照（实施前基线，保留作历史对照）

截至 2026-07-12：

- 外层分支：`main...origin/main [ahead 3]`。
- 应用分支：`feature/gpt-image-platform`。
- 应用 HEAD：`68e8ce5`，该提交只包含 2026-07-10 UI 设计规范。
- 应用 worktree 有 32 个 tracked 修改文件。
- 应用 worktree 有 5 个未跟踪项，包括旧交接 `plans.md`、`globals.css`、navigation 目录、ProviderForm 测试和 session log。
- Tracked diff 基线：`32 files changed, 884 insertions(+), 262 deletions(-)`。
- 这些改动属于现有用户工作，禁止 reset、clean、整文件回退或批量覆盖。
- Docker 是瞬时状态。2026-07-11 最近一次核对时 Docker Engine 不可连接，继续工作前必须重新检查。

## 5. 工程结构与数据流

主要目录：

- `src/app/`：App Router 页面和 API。
- `src/components/`：生成、参数、历史、认证和 Provider UI。
- `src/server/`：认证、Provider、任务、Worker、历史和存储。
- `prisma/schema.prisma`：User、Provider、ImageModel、Conversation、Message、GenerationJob、ImageAsset。
- `tests/`：Vitest API、认证、Provider、任务、Worker、存储和 UI 测试。
- `storage/generated-images/`：生成图片，只跟踪 `.gitkeep`。

生成流程：

```text
/generate
  -> POST /api/conversations
  -> POST /api/conversations/{id}/messages
  -> 创建 QUEUED GenerationJob
  -> Worker 领取任务
  -> 调用 {baseUrl}/images/generations
  -> 下载 URL 图片或解码 base64
  -> 写入 storage/generated-images/
  -> 创建 ImageAsset 并标记 ARCHIVED
  -> 前端轮询任务并展示图片
  -> History 支持预览、下载和复用
```

## 6. UI 改版必须保留的行为

- JWT session、Admin/Member 权限和未登录跳转。
- Provider 创建、编辑、API key 轮换、模型添加和具体错误文本。
- Provider 改变后自动选择该 Provider 的有效 Model。
- Prompt 提交时完整发送 `size`、`quality`、`count`、`responseFormat`。
- queued、running、archiving、failed、archived 状态和轮询行为。
- 上游返回 HTML 时提示 Base URL 可能缺少 `/v1`。
- 无 Provider/Model 时使用可访问告警并禁用提交。
- History 每页 50 条、总数、翻页、过滤、Lightbox、Download 和 Reuse。
- AES-256-GCM Provider key 加密和图片路径权限检查。
- `storage/generated-images/` 中的真实生成图片不得提交。

本轮仅做 UI 重构，不修改 API contract、Prisma model、Worker 行为或 Provider adapter。

## 7. 已批准的 UI 边界

- 浅色画布、白色表面、灰色边框、靛蓝主色。
- 根 `src/app/layout.tsx` 不直接包裹 `AppShell`，避免 `/login` 出现侧栏。
- `/` 按批准规范作为认证后的 Overview。
- 共享壳层只显示 Overview、Create、History、Provider Admin 四个真实入口。
- 顶栏显示品牌、真实角色和 Logout；没有可信数据时不得伪造 Worker Online、Quota 或通知数字。
- Create 桌面端使用 Prompt、Preview、Parameters 三部分。
- Preview 只显示真实任务状态和真实归档图片。
- 成功结果保留 Download 和 History。
- 控件保持 Provider、Model、Size、Quality、Count、Response Format。
- 状态不能只依赖颜色，所有表单、导航和 Lightbox 必须可键盘访问。

响应式目标：

- 1279px：侧栏收为带可访问名称的 icon rail。
- 1023px：Parameters 移到主创建区下方。
- 767px：单列、紧凑顶栏、方形 Preview、全宽 Generate。
- 375px：不得产生水平滚动。

## 8. 推荐实施顺序（已完成，保留作复核清单）

### 阶段 0：重新建立基线

```powershell
cd "C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform"
git -C ..\.. status --short --branch
git worktree list
git status --short --branch
git diff --stat
git log --oneline -12
docker version
docker compose ps
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config
```

记录已有失败，不要先修改代码掩盖基线问题。

### 阶段 1：共享应用壳

- 先新增 `tests/ui/AppShell.test.tsx`。
- 新增 `src/components/layout/AppShell.tsx` 和 `SidebarNav.tsx`。
- 覆盖四个真实链接、`aria-current`、Logout、角色、键盘导航和 `/login` 无侧栏。
- 不删除未跟踪的 `BackButton.tsx`，直到确认没有引用且测试覆盖完成。

### 阶段 2：接入现有页面

- 更新 Overview、History 和 Provider Admin 使用共享壳层。
- 保留 History 分页和 Provider CRUD。
- 不在这一阶段修改 API、Prisma 或 Worker。

### 阶段 3：重构 Create 工作台

- 保留 `GenerateWorkspace` 作为状态和网络编排中心。
- 将 `GenerationChat` 调整为 Prompt 与 Preview 结构。
- 让右侧 Generate 按钮通过稳定 form ID 提交 Prompt 表单。
- 更新 GenerateWorkspace、GenerationChat 和 ParameterPanel 行为测试。
- 保留所有状态文本、告警和 Provider Base URL 指引。

### 阶段 4：真实 Recent Generations

- 使用 `listHistoryAssets(session, { limit: 6, offset: 0 })`。
- 无数据时显示空状态，不使用参考图样例。
- MVP 提供统一 View History 入口；单图 Reuse 只有在复用现有 URL 构造逻辑并增加测试时才实现。

### 阶段 5：History、Admin、Login 与 CSS

- 补充 ImageGrid 空状态、Lightbox、Download、Reuse 测试。
- 只调整 Provider 和 Login 表单的布局、class 和文案层级。
- 保留 seeded-account 提示、required 校验、API 错误和 `router.refresh()`。
- 将 `globals.css` 从通用标签污染收窄为组件级 class，不得整文件替换。

### 阶段 6：完整验证

```powershell
npm.cmd test -- tests/ui
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config
docker compose up --build -d
docker compose ps
```

验证 `/`、`/generate`、`/history`、`/admin/providers` 和 `/login`，并记录：

- HTTP 可达性和 `docker compose ps`。
- 浏览器 Console。
- 1536、1279、1023、767、375px 截图。
- Tab、focus ring、label、状态文本和移动端横向溢出。

停止时只运行 `docker compose down`。禁止使用 `docker compose down -v`。

## 9. 已知风险

- 旧 Provider Base URL 曾返回 `403 text/html`，真实生成失败不一定是 UI 回归。
- 旧记录出现过 `Could not save provider.`，需要在服务启动后重新验证。
- `WORKER_MAX_RETRIES` 可能尚未从 Compose 传入 Worker。
- 多个文件有 LF/CRLF 提示，修改时避免无意义整文件换行变化。
- `globals.css`、navigation 和部分测试是未跟踪用户文件，不得删除或覆盖。
- 旧 2026-04-27 计划中的 `npm install`、`prisma migrate dev` 和“Create file”步骤已经过时。
- 不得使用 `git add .`、`git add -A`、`git reset --hard`、`git clean` 或整 worktree 回退。

## 10. 完成定义（当前已满足）

只有全部满足时才能宣布 UI 改版完成：

- 四个认证后页面共享统一浅色壳层，Login 保持独立。
- Create 在桌面端呈现 Prompt、Preview、Parameters。
- 所有可见控件都有真实数据与行为，没有假功能和示例统计。
- 生成、轮询、错误、归档、历史、下载、复用和 Provider CRUD 无回归。
- UI 测试、完整 Vitest、typecheck、build、Compose config 全部通过。
- Docker 页面可访问，Console 无新增错误。
- 桌面和移动截图已经检查，375px 无水平滚动。
- 没有提交密钥、数据库数据或生成图片。

## 11. 给下一位 AI 的启动提示

```text
继续 GPT Image Workbench 参考图 UI 改版的后续收尾或迭代。

当前权威交接文件：
C:\Users\29800\Desktop\gpt-image-2-workload\plans.md

实际应用目录：
C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform

先读根 AGENTS.md、本 plans.md 和 2026-07-10 UI 设计规范。2026-07-11 之前的计划只作历史参考，不要修改或从头执行。

方案 A 已实现：统一浅色应用壳，Create 使用 Prompt + Preview + Parameters 三部分，只显示真实功能。

不要重新实施第 1-6 阶段。先检查两个 checkout 和 Docker 运行态，再根据用户选择进行提交/PR、进一步视觉迭代或业务功能开发。Worktree 有大量既有未提交修改，禁止 reset、clean、整文件覆盖或批量暂存。
```
