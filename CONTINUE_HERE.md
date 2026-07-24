# GPT Image Workbench 下一会话交接记录

> 更新时间：2026-07-16（Asia/Shanghai）  
> 用途：工程跨盘移动或对话历史不可用后，供下一位 AI 恢复上下文。  
> 本文件是工程接续摘要，不是逐字聊天记录。下一次开始时应先读根目录 `AGENTS.md`，再完整阅读本文件。

## 当前目录与 Git 结构

当前旧位置：

```text
C:\Users\29800\Desktop\gpt-image-2-workload
```

这是外层协调 checkout，分支为 `main`，HEAD 为 `21f6599`。真正可运行的 Next.js 应用位于：

```text
.worktrees/gpt-image-platform
```

应用分支为 `feature/gpt-image-platform`，HEAD 为 `68e8ce5`。应用命令必须在该 worktree 中运行，不能在外层目录运行。

这是 Git linked worktree。其 `.git` 文件和外层 `.git/worktrees/` 目前记录了旧目录的绝对路径，所以跨盘移动整个目录后，通常需要修复路径。不要删除或重新创建 worktree，因为里面有大量未提交工作。

## 跨盘移动注意事项

1. 移动整个 `gpt-image-2-workload` 文件夹，不要只移动应用子目录。
2. 必须保留隐藏目录，尤其是 `.git/`、`.worktrees/`、`.agents/` 和 `.codex/`。
3. 更安全的做法是先复制到新盘，完成下列验证后再自行处理旧副本。
4. 不要在新位置重新 clone 后覆盖现有文件，也不要运行 `git clean`、`git reset --hard` 或 `git worktree remove`。
5. Docker 当前未运行。若移动时 Docker 已重新启动，应先停止应用进程；可以使用 `docker compose stop`，但绝不能使用 `docker compose down -v`。

移动完成后，在新外层目录运行：

```powershell
Set-Location "X:\你的新路径\gpt-image-2-workload"
git worktree repair ".worktrees\gpt-image-platform"
git worktree list
git status --short --branch
git -C ".worktrees\gpt-image-platform" status --short --branch
```

如果 `git worktree repair` 报错，不要删除 worktree。先检查：

```powershell
Get-Content ".worktrees\gpt-image-platform\.git"
Get-Content ".git\worktrees\gpt-image-platform\gitdir"
```

这两个文件原先分别指向旧位置下的 `.git/worktrees/gpt-image-platform` 和 `.worktrees/gpt-image-platform/.git`；应继续以修复路径为目标，而不是重新创建一个干净 worktree。

Docker 数据库、生成图片和容器 `node_modules` 使用名为 `postgres-data`、`image-storage`、`node-modules` 的 Docker named volumes，不存放在源码目录中。只在同一台电脑上换盘时，这些卷通常仍留在 Docker Desktop 中；移动源码不会把它们导出。不要删除卷。

## 用户目标与已经确认的设计方向

用户希望界面先尽量呈现参考图 `gpt-image-2 interface.png` 中能看到的完整内容，再逐项实现真实业务。用户明确选择了“方式 B”：未接后端的功能也应可见、可点击和可理解，而不是永久灰掉或完全不画出来。

当前产品边界如下：

- 登录、权限、Provider/Model、生成请求、Worker 轮询、归档、History、Download 和 Reuse 继续使用真实业务逻辑。
- Batch Jobs、Dataset、API Keys、Usage & Billing、部分 Settings、Ultra、Style、Seed、Guidance、输出格式、Safety Filter、Upscale、Variations 等属于界面预览。
- 预览功能只能更新前端本地状态并显示 `Interface preview` 说明，不得调用 API、写数据库、伪造任务、密钥、用量、账单、通知或图片。
- 已认证侧栏包含 Overview、Create、History、Batch Jobs、Dataset、Models、API Keys、Usage & Billing、Settings 九个入口。
- `/models` 对 ADMIN 复用真实 Provider/Model 管理，对 MEMBER 只显示安全的只读模型目录；`/admin/providers` 保留为兼容入口。
- Create 页已经按参考图完成 Prompt、Preview、Parameters、Recent Generations、Today's Usage 及桌面首屏密度优化。
- 后续视觉调整必须增量完成，不能重新设计整站，也不能为了匹配图片而改变 API、Prisma、Provider、Job、Worker、Archive 或 Storage 行为。

## 最近完成的语言问题

用户最后一个已完成的具体需求是修复全局语言切换：原来选择中文只翻译侧边栏，并且换页后会恢复 English。现已实现：

- Overview、Create、History、Batch Jobs、Dataset、Models、API Keys、Usage、Settings 以及 Models 管理表单均支持中英文。
- 页面导航后保持当前语言，刷新后恢复上次选择。
- 切回 English 后也会持久化。
- 使用 `localStorage` 键 `gpt-image-language`，只接受 `en` 或 `zh`。
- `<html lang>` 会同步为 `en` 或 `zh-CN`，并响应其他标签页的 storage event。
- 浏览器存储失败时仍保留当前内存语言，不影响页面渲染。
- 真实账号、模型名称、Prompt、URL、日期、文件名、Provider/API 错误不会被翻译。

主要相关文件：

```text
src/components/layout/ShellState.tsx
src/components/i18n/localization.ts
src/components/i18n/LocalizedPageHeading.tsx
src/components/overview/OverviewContent.tsx
src/components/history/HistoryToolbar.tsx
src/components/models/ProviderList.tsx
```

截至上次完整验证（2026-07-13）：

```text
npm.cmd test             -> 39 test files / 167 tests passed
npm.cmd run typecheck    -> passed
npm.cmd run build        -> passed
docker compose config --quiet -> passed
```

真实 Chrome 已验证 Create → Overview → History → Models 保持中文，Models 刷新后仍为中文，切回 English 并刷新后仍为 English；375px 下无横向溢出，中文移动导航抽屉正常。仅发现既有 `/favicon.ico` 404，与功能无关。以上是 2026-07-13 的证据，本次创建交接文件时没有重新运行完整测试；2026-07-16 检查时 Docker Desktop 未运行。

## 当前 Git 状态快照

创建本文件前，外层 checkout 状态为：

```text
## main...origin/main [ahead 3]
1 个 tracked 修改：AGENTS.md
5 个未跟踪项：CLAUDE.md、docs/project-review.md、gpt-image-2 interface.png、plans.md、storage/
无 staged 文件
```

本文件创建后，外层会再增加一个未跟踪项 `CONTINUE_HERE.md`。不要自动暂存或提交这些文件。

应用 worktree 当前为：

```text
## feature/gpt-image-platform
HEAD 68e8ce5 docs: add reference UI redesign spec
35 个 tracked 修改项
48 个未跟踪状态项（其中多项是包含多个文件的目录）
无 staged 文件
tracked diff: 35 files changed, 2460 insertions(+), 696 deletions(-)
```

关键未跟踪内容包括新的页面路由、`src/app/globals.css`、layout/i18n/prototype/generate/models 组件、测试以及 2026-07-12/13 的设计和实施文档。它们是已经完成工作的主体，绝不能因“未跟踪”而删除。移动后应重新运行 `git status --porcelain=v1`，确认这些修改仍然存在。

## 文档阅读顺序与冲突处理

下一位 AI 应按以下顺序读取：

1. 外层 `AGENTS.md`：目录、命令、代码风格和安全规则。
2. 本 `CONTINUE_HERE.md`：截至 2026-07-16 的最新接续状态。
3. `.worktrees/gpt-image-platform/docs/superpowers/specs/2026-07-12-reference-interface-visual-prototype-design.md`：用户批准的完整可见界面和真实/预览功能边界。
4. `docs/superpowers/specs/2026-07-13-global-language-persistence-design.md` 与对应 plan：最新语言实现。
5. 2026-07-13 的 Create desktop fidelity 和 first-viewport polish 规范及计划：桌面布局测量和响应式约束。
6. 外层和 worktree 的 `plans.md`：只作历史背景，不再代表最新实现状态。

特别注意：worktree 根 `plans.md` 仍写着“参考图实现尚未开始”，该描述已经过时；外层 `plans.md` 停留在 2026-07-12，也早于完整视觉原型和语言持久化。发生冲突时，以本文件和 2026-07-12/13 新规范为准。不要修改或重新执行 2026-07-11 及更早的旧计划。

## 新位置启动与查看效果

完成 worktree 修复后：

```powershell
Set-Location "X:\你的新路径\gpt-image-2-workload\.worktrees\gpt-image-platform"
docker compose config --quiet
docker compose up --build
```

然后打开：

```text
http://localhost:3000
```

默认本地登录：

```text
账号：admin
密码：admin123456
```

若提示无法连接 `dockerDesktopLinuxEngine`，先启动 Docker Desktop 并等待 Engine 就绪。非 Docker 开发使用 PowerShell 的 `npm.cmd`、`npx.cmd`，并在不同终端分别运行 app 和 worker。

需要做完整验证时，先在 Compose 停止状态下按顺序运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

宿主机和 Compose 会共享 `.next`，所以生产 build 应先于 Compose 启动。停止服务时只能使用 `docker compose down`；不得使用 `docker compose down -v`。

## 后续工作的边界

用户当前没有新的待修改项，正在逐页检查效果。下次应等待用户给出截图、页面、位置和期望效果，然后在现有视觉基础上增量调整。

- 修改前检查外层与 worktree 的 Git 状态。
- 行为改动使用失败测试 → 实现 → focused tests → 完整验证。
- 不 stage、commit、push、merge、reset、clean，除非用户另行明确授权。
- 不修改 2026-07-11 及更早的旧计划。
- 不添加虚假数据，不把预览功能伪装成已经接通。
- 视觉优化不得顺手改 API、Prisma、Provider、Job、Worker、Archive 或 Storage。
- 保留所有真实错误文本和安全边界。

## 可复制给新对话的提示

```text
这个项目从旧盘移动过来了。请先完整读取新目录根部的 AGENTS.md 和 CONTINUE_HERE.md，再检查两个 checkout 的 Git 状态。真正的应用在 .worktrees/gpt-image-platform，分支是 feature/gpt-image-platform。请保留全部 tracked/untracked 改动，不要 reset、clean、stage、commit 或重新创建 worktree。旧 plans.md 是历史快照；以 CONTINUE_HERE.md 和 2026-07-12/13 的新规范为准，然后从当前界面状态继续。
```
