# 关键证据
- `app/projects/page.tsx` 当前是阶段条加项目列表，尚未体现客户列表、看板和详情三栏。
- `app/projects/new/page.tsx` 当前是普通表单，项目类型是自由输入，不支持模板选择。
- `lib/data.ts` 已有客户、项目、任务、确认事项、时间线等 mock 数据，可直接用于第一版原型。
- `components/Shell.tsx` 已提供左侧导航和顶部状态栏，适合保留。
- `middleware.ts` 需要把 `/production/:path*` 加入受保护路由，否则生产管理页不会跟其他业务页面保持一致的登录保护。
- `lib/auth.ts` 当前客户账号只有角色，没有客户 ID 绑定；客户门户无法真正按客户过滤。
- `app/portal/page.tsx` 当前只展示项目，没有展示生产订单。
- `lib/production.ts` 已作为生产订单共享数据源，客户详情、客户门户和 `/production` 均可按客户复用。
- `app/portal/projects/[id]/page.tsx` 已按登录客户 ID 限制项目详情访问，非本人项目返回 404。

# 命令结果
- `git status --short --branch` 显示初始分支为 `master...origin/master`，存在未跟踪概念图和 `AGENTS.md`。
- `git switch -c codex/project-kanban-redesign` 已成功切换到新分支。
- `rg --files` 已确认项目管理相关页面位于 `app/projects`。
- `npm.cmd run build` 通过；仅保留 `app/umbrella-catalog/page.tsx` 既有 `<img>` lint 警告。
- Playwright/Edge 检查 `http://localhost:3000/projects`，确认包含“客户列表 / 项目看板 / 项目详情”。
- Playwright/Edge 检查 `http://localhost:3000/projects/new`，确认包含“打样项目 / 售后问题 / 自动生成流程”。
- 移动端 390px 检查 `/projects` 和 `/projects/new`，`scrollWidth` 等于 `clientWidth`，无横向溢出。
- 已新增 `app/production/page.tsx`，第一版用页面内 mock 订单展示接单到出货流程。
- `npm.cmd run build` 再次通过，路由表包含 `/production`。
- Playwright/Edge 检查 `http://localhost:3000/production`，确认包含“生产管理 / 生产订单 / 生产流程看板 / 订单详情”。
- `/production` 移动端 390px 检查 `scrollWidth` 等于 `clientWidth`。
- `npm.cmd run build` 最终通过；仅保留 `app/umbrella-catalog/page.tsx:93` 和 `app/umbrella-catalog/page.tsx:113` 的既有 `<img>` lint 警告。
- 浏览器最终烟测通过后台路由：`/`、`/mail`、`/umbrella-catalog`、`/customers`、`/projects`、`/projects/new`、`/production`、`/tasks`。
- 浏览器最终烟测通过按钮/表单：邮件设置打开关闭、伞款搜索清空、新建客户、新建项目模板、客户门户 Have Question、Submit Message、任务“标记已处理”。
- 补充验证邮件中心“模拟拉取”按钮通过；未新增持久测试邮件，`data/emails.json` 无 git diff。
- 浏览器最终烟测确认客户详情 `/customers/abc-malaysia` 同时展示“马来西亚折叠伞开发”和“21寸三折自动伞”。
- 浏览器最终烟测确认客户门户只展示 ABC Malaysia 自己的项目和生产订单，访问 `/portal/projects/korea-cobrand-sample` 返回 404。
- 390px 移动端最终检查通过：`/projects`、`/production`、`/customers/abc-malaysia`、`/portal`。
- 最终截图已写入 `test-results/final-projects-desktop.png`、`test-results/final-production-desktop.png`、`test-results/final-portal-desktop.png`、`test-results/final-projects-mobile.png`、`test-results/final-production-mobile.png`、`test-results/final-customer-detail-mobile.png`、`test-results/final-portal-mobile.png`。
- 本轮烟测清理了 1 个临时客户、1 个临时项目和 2 条临时门户提交。
- `scripts/deploy-fnos.ps1` 已完成：远端 Docker 镜像构建成功，`umbrella-trade-hub` 容器已重建并启动。
- `curl -I https://crm.arkumbrella.com` 返回 `307 /login?next=%2F`，`curl -I https://portal.arkumbrella.com` 返回 `307 /login?next=%2Fportal`。
- 线上登录后检查通过：CRM `/production` 包含“生产管理 / 生产流程看板”，`/projects` 包含“客户列表 / 项目看板”，`/projects/new` 包含“选择项目类型 / 打样项目”。
- 线上客户门户检查通过：`/portal` 包含“客户项目与订单门户 / 马来西亚折叠伞开发 / 21寸三折自动伞”，不包含“韩国联名款样品项目”，访问其他客户项目返回 404。
- 远端 `sudo docker logs --tail 80 umbrella-trade-hub` 显示 Next.js Ready，容器状态为 Up。
- 已新增 `/settings` 设置页、`/api/backups` 和 `/api/backups/config`，构建路由表显示三者均为动态路由。
- 本地 HTTP/API 验证通过：`/settings` 包含“备份与恢复设置 / 立即手动备份”，`/api/backups` 返回 `crm-records.json` 等目标文件，配置保存接口返回成功。
- 本地 Playwright/Edge 验证通过：设置页可保存自动备份间隔，可执行手动备份，点击“恢复此备份”会出现确认弹窗；测试中已取消恢复，没有覆盖数据。
- 备份文件写入 `data/backups`，本地测试生成自动备份和手动备份；`data/` 已在 `.gitignore` 中，不会进入代码提交。
- `npm.cmd run build` 在备份功能加入后通过；仅保留 `app/umbrella-catalog/page.tsx` 既有 `<img>` lint 警告。
- 备份功能线上部署完成：`https://crm.arkumbrella.com/settings` 包含“备份与恢复设置 / 立即手动备份”，`/api/backups` 返回备份目标，`/api/backups/config` 保存成功。
- 线上手动备份创建成功，远端容器内 `/app/data/backups` 出现 `auto` 和 `manual` 备份文件，`umbrella-trade-hub` 容器状态为 Up。

# 失败尝试
- `npm run build` 被 PowerShell 执行策略拦截，已改用 `npm.cmd run build`。
- 构建期间同时运行 dev server 导致 Next dev 缓存模块报错，重启 dev server 后恢复。
- Codex in-app browser 因虚拟剪贴板未安装无法向登录框输入；已改用 HTTP/API 与本机 Playwright/Edge 完成验证。

# 决策原因
- 先做页面级原型，能最快验证三栏信息架构和模板选择是否符合用户工作流。
- 生产订单先用共享本地数据层接入客户、项目和门户，避免第一版扩大到 ERP/工厂系统集成。
- 部署到网站会产生远程写入和线上影响，必须等待用户明确授权、域名和部署平台信息。
- 备份采用 JSON 快照而非数据库迁移，能贴合当前 `data/*.json` 持久化结构；恢复前自动备份降低误恢复风险。

## 2026-05-23 备份下载验证
- 本地构建：`npm.cmd run build` 通过，构建路由表包含 `ƒ /api/backups/[id]`。
- 远端部署：原 `scripts/deploy-fnos.ps1` 分片上传在第 8/32 片被 SSH 关闭；随后通过 `scp -O` 增量上传 `lib/backup.ts`、`app/settings/BackupPanel.tsx`、`app/api/backups/[id]/route.ts`，三者 SHA256 与本地一致。
- 远端构建：`sudo docker compose --env-file .env.cloudflared build umbrella-trade-hub` 通过，容器 `umbrella-trade-hub` 重建后状态为 `Up`，日志显示 Next.js Ready。
- 线上验证：登录 `https://crm.arkumbrella.com` 后，`/settings` 包含“下载备份”；`/api/backups/backup-20260523-060204-manual-k3yx` 返回 `200`、附件响应头，下载 JSON 的 `id` 匹配。

## 2026-05-23 部署脚本验证
- `scripts/deploy-fnos.ps1` 已改为优先 `scp -O -o ServerAliveInterval=15 -o ServerAliveCountMax=4` 上传发布包，减少多次 SSH 分片写入导致的中断概率。
- 上传完成后脚本会执行远端 `gzip -t`、`sha256sum` 和 `ls -lh`，确认压缩包可解压且哈希与本地一致。
- 回退路径仍保留 base64 分片上传，但分片大小改为 128KB，并给每次 SSH 写入增加 keepalive。
- 验证命令：PowerShell Parser 解析 `scripts/deploy-fnos.ps1` 通过；`git diff --check -- scripts/deploy-fnos.ps1` 通过。

## 2026-05-23 客户门户新建项目验证
- 新增接口：`app/api/portal/projects/route.ts` 只允许 `umbrella_session=customer` 且能从 `umbrella_identity` 解析出客户 ID 的登录客户提交。
- 同步路径：接口调用 `addProject()` 写入 CRM 项目记录，自动生成“客户提交 / 待内部确认”阶段、跟进任务、时间线和客户初始留言。
- 浏览器验证：客户账号提交 `AUTOTEST_PORTAL_PROJECT_*` 后跳转 `/portal/projects/autotest-portal-project-*`，页面包含项目名、阶段和需求说明。
- 后台验证：管理员访问 `/projects?customer=abc-malaysia`、`/projects/{id}`、`/customers/abc-malaysia` 均能看到该客户提交的新项目。
- 安全验证：ABC 客户尝试向 `korea-cobrand-sample` 提交留言和确认，`/api/portal/messages` 与 `/api/portal/confirmations` 均返回 `404 {"error":"Project not found."}`。
- 清理验证：已从 `data/crm-records.json` 移除 1 条 `AUTOTEST_PORTAL_PROJECT_*` 测试项目，重新搜索无残留。
- 构建验证：`npm.cmd run build` 通过，路由表包含 `ƒ /api/portal/projects`；仅保留 `app/umbrella-catalog/page.tsx` 既有 `<img>` lint 警告。

## 2026-05-23 项目看板调整验证
- UI 验证：`/projects?customer=abc-malaysia` 不再包含“活跃项目 / 今日基准”顶部统计卡，包含“客户列表 / 项目看板 / 项目详情 / 上传附件 / 结束项目”。
- 同页选择验证：项目卡链接已变为 `/projects?customer=...&project=...`，中间栏点击后第三栏显示选中项目详情。

## 2026-05-23 生产管理交互证据
- `app/production/page.tsx` 当前包含顶部 5 个统计卡，且中间主体是“生产流程看板”分阶段静态展示。
- `lib/production.ts` 当前只导出静态 `productionOrders` 和 `getProductionOrders()`，没有阶段推进、附件或关闭订单的写入函数。
- 项目模块已有可复用模式：`/api/projects/[id]/stage`、`/api/projects/[id]/attachments`、`/api/projects/[id]/close` 都通过表单 POST 更新本地 JSON 状态后重定向。
- `npm.cmd run build` 已通过，路由表包含 `/api/production/orders/[id]/stage`、`attachments`、`attachments/[file]` 和 `close`。
- 浏览器验证 `/production` 不再包含“生产流程看板”，包含“订单列表 / 订单详情 / 上传生产资料附件 / 结束订单”。
- 浏览器实际点击 `Korea Brand` 演示订单“推进到：验货”成功，右侧详情变为“当前节点：验货”，下一步变为“推进到：包装入库”。
- 浏览器客户门户验证 `customer@example.com` 只能看到 ABC Malaysia 的 `21寸三折自动伞`，不显示 Korea Brand 订单，并展示流程节点、资料检查和下一步。

## 2026-05-23 生产三栏需求证据
- `app/production/page.tsx` 当前网格为两栏 `订单列表 / 订单详情`，未按客户先筛选。
- `ProductionOrder` 当前只有 `milestones` 静态节点，没有独立可编辑 `tasks` 或 `comments` 字段。
- `app/portal/page.tsx` 当前只展示生产订单摘要卡，没有 `/portal/production/[id]` 详情页入口。
- 构建验证：`npm.cmd run build` 通过，路由表包含 `/api/production/orders/[id]/tasks`、`/api/production/orders/[id]/comments` 和 `/portal/production/[id]`。
- HTTP 验证：管理员访问 `/production?customer=korea-brand&order=po-korea-260512` 返回三栏内容，包含“客户列表 / 订单列表 / 订单详情 / 生产子任务 / 自定义子任务 / COMMENTS”。
- API 验证：`AUTOTEST_TASK_*` 通过生产任务接口完成新增、勾选和删除，均返回 `303 See Other`；测试任务已清理。
- API 验证：客户对 `po-abc-260518` 添加 `AUTOTEST_COMMENT_*` 成功写入后已清理；客户访问 `po-korea-260512` 返回 `404 Not Found`。
- 截图验证：Edge 生成 `test-results/production-three-column-current.png` 和 `test-results/portal-production-detail-current.png`，关键文案均可见。
- 空栏目验证：页面不再输出“暂无项目”空分组文案，只有有项目的分组会显示。
- 附件验证：临时项目 `AUTOTEST_BOARD_PROJECT_*` 上传 `AUTOTEST-board-attachment.txt` 后，第三栏附件列表显示该文件，磁盘目录 `data/project-attachments/{projectId}` 存在。
- 结束验证：调用 `/api/projects/{id}/close` 后跳回客户项目页，已结束项目不再出现在项目看板中。
- 清理验证：已移除 1 条 `AUTOTEST_BOARD_PROJECT_*` 测试项目和对应附件目录，重新搜索无残留。
- 构建验证：`npm.cmd run build` 通过，路由表包含 `ƒ /api/projects/[id]/attachments` 和 `ƒ /api/projects/[id]/close`。
- 视觉截图：`test-results/project-board-refined.png`。

## 2026-05-23 项目交互增强验证
- 构建验证：`npm.cmd run build` 通过，路由表包含 `ƒ /api/projects/[id]/attachments/[file]`、`ƒ /api/projects/[id]/stage`、`ƒ /api/projects/[id]/tasks`。
- API 验证：临时项目 `AUTOTEST_INTERACTIVE_PROJECT_*` 调用 stage 接口后数据阶段变为“打样”，调用 tasks 接口后第 1 个任务变为“已完成”。
- 附件验证：临时项目上传 `AUTOTEST-interactive-attachment.txt` 后，下载接口返回 `200`、`Content-Disposition: attachment`，下载内容与上传文本一致。
- 页面验证：重启 dev server 后，`/projects?customer=abc-malaysia&project=...` 包含三栏、流程节点、子任务清单、下载、上传附件和结束项目。
- 浏览器验证：已打开 `http://localhost:3000/projects?customer=abc-malaysia&project=foldable-umbrella-malaysia`，页面包含“客户项目 / 项目详情 / 结束项目 / 上传附件 / 流程节点 / 子任务清单”。
- 清理验证：已移除 1 条 `AUTOTEST_INTERACTIVE_PROJECT_*` 测试项目和对应附件目录，重新搜索无残留。

## 2026-05-23 项目详情任务与 COMMENTS 验证
- 构建验证：`npm.cmd run build` 通过，路由表包含 `ƒ /api/projects/[id]/comments`。
- API 验证：临时项目 `AUTOTEST_DIRECT_*` 通过 `add / delete / toggle / comments / portal messages` 全流程后，`.next/standalone/data/crm-records.json` 里的任务、时间线和 COMMENTS 都已更新，门户提交也写入 `portal-submissions.json`。
- 页面验证：后台三栏页不再显示“项目字段”，任务区可新增自定义任务并删除默认任务，底部 `COMMENTS` 同时展示管理员和客户留言。
- 门户验证：`/portal/projects/[id]` 的留言区已改为 `COMMENTS`，客户留言继续通过原门户接口提交并同步显示到后台。
- 清理验证：已清空根目录 `data/` 与 `.next/standalone/data/` 中的临时 `AUTOTEST_*` 项目与留言。

## 2026-05-23 生产文档识别验证
- 构建验证：`npm.cmd run build` 通过；仅保留 `app/umbrella-catalog/page.tsx` 既有 `<img>` lint 警告。
- 依赖验证：`xlsx` 未重新引入；使用 `exceljs` 解析 `.xlsx`，并为已有 `playwright.config.ts` 补回 `@playwright/test` 以通过类型检查。
- API 验证：上传 `production-contract-test.xlsx` 到 `/api/production/orders/po-abc-260518/attachments` 返回 `303`，识别出客户名字、订单号、订单数量、订单金额和交货日期。
- API 验证：上传 `production-sheet-test.xlsx` 返回 `303`，识别出伞面、伞骨、包装、布标、吊牌、外箱、手柄和印刷。
- 权限验证：客户账号访问其它客户生产订单 `/portal/production/po-korea-260512` 返回 `404 Not Found`。
- 页面验证：in-app browser 打开 `http://localhost:3101/production?customer=korea-brand&order=po-korea-260512`，确认不是 404，且包含客户列表、订单列表、订单详情、上传合同、上传生产单；1440px Edge 检查三栏宽度为 `260px / 360px / 484px`。
- 清理验证：已恢复 `data/production-records.json`，移除测试附件，`rg` 未再发现 `AUTOTEST Excel Customer`、`AUTOTEST 客户醒目留言`、`production-contract-test`、`production-sheet-test` 或 `190T pongee` 残留。

## 2026-05-23 模拟数据回归测试
- 模拟项目：创建 `simtest-sample-*` 打样项目，绑定 `ABC Malaysia`，默认任务为确认面料库存、安排供应商打样、获取快递单号。
- 后台任务验证：新增“客户临时要求增加吊牌确认”成功；删除默认“确认面料库存”成功；勾选“安排供应商打样”后状态变为“已完成”。
- COMMENTS 验证：后台添加“已联系供应商...”成功；客户门户添加 “Please confirm if the sample can ship before Friday.” 成功；后台和门户页面均能看到双方 Comments。
- 权限验证：ABC 客户向 `korea-cobrand-sample` 提交留言返回 `HTTP/1.1 404 Not Found`，越权被拦截。
- 结束验证：结束模拟项目后，后台客户项目列表不再显示该项目，客户门户访问该项目返回 404。
- 清理验证：`data/crm-records.json` 和 `data/portal-submissions.json` 中无 `SIMTEST/simtest` 残留，且没有 data 文件 diff。

## 2026-05-23 生产管理回归测试
- 发现并修复：`/production` 页面展示生产子任务，但任务 API 只支持新增/删除，不支持勾选完成；已补 `intent=toggle` 并在页面增加“完成 / 重新打开”按钮。
- 构建验证：`npm.cmd run build` 通过；仅保留 `app/umbrella-catalog/page.tsx` 既有 `<img>` lint 警告。
- API 验证：`po-abc-260518` 模拟阶段推进返回 303，任务新增返回 303，任务完成返回 303，任务重新打开返回 303，内部/客户 COMMENTS 返回 303。
- 附件验证：生产资料附件上传返回 303，下载接口返回 `HTTP/1.1 200 OK`。
- 权限验证：ABC 客户向 `po-korea-260512` 添加生产订单评论返回 `HTTP/1.1 404 Not Found`。
- 浏览器验证：`/production?customer=abc-malaysia&order=po-abc-260518` 显示订单详情、阶段推进、任务勾选、自定义任务、COMMENTS 和附件上传入口。
- 清理验证：已恢复 `data/production-records.json` 测试前内容，并确认无 `SIMTEST/simtest` 残留。
# 2026-05-23 客户账号管理验证
- 代码证据：`lib/auth.ts` 登录查找已接入 `lib/customer-accounts.ts`，`getCustomerIdForIdentity()` 会按登录邮箱返回绑定客户 ID。
- 代码证据：`app/portal/page.tsx` 使用 `getProductionOrders(customerId, { includeClosed: true })`，客户门户生产订单列表按客户过滤。
- 代码证据：`app/portal/projects/[id]/page.tsx` 和 `app/portal/production/[id]/page.tsx` 均检查资源 `customerId`，不匹配时 `notFound()`。
- HTTP 验证：临时 Korea 客户账号创建成功，登录后访问 Korea 项目 `200`、ABC 项目 `404`、Korea 生产订单 `200`、ABC 生产订单 `404`。
- 构建验证：停止 dev server 后执行 `npm.cmd run build` 通过；保留既有 `app/umbrella-catalog/page.tsx` `<img>` lint 警告。
- 浏览器验证：`http://127.0.0.1:3000/settings` 显示“客户门户账号”表单和正常“系统设置”页头。
# 2026-05-23 手机端测试验证
- 移动视口：使用 390x844 检查 `/`、`/mail`、`/customers`、`/customers/abc-malaysia`、`/projects`、`/projects/new`、`/production`、`/settings`、`/portal`、`/portal/projects/foldable-umbrella-malaysia`、`/portal/production/po-abc-260518`。
- 问题：`/settings` 在手机端 `scrollWidth` 曾达到 592/567，来源是备份策略与备份目标卡片内网格项不能收缩。
- 修复：`app/settings/BackupPanel.tsx` 增加 `min-w-0`、`minmax(0,...)`、`break-all/truncate`，并放大备份开关。
- 修复：`app/customers/page.tsx`、`app/customers/[id]/page.tsx`、`app/customers/new/page.tsx`、`app/projects/new/page.tsx`、`app/portal/projects/[id]/page.tsx`、`app/portal/production/[id]/page.tsx`、`app/production/page.tsx` 放大手机端文字链接/删除按钮触控区域。
- 点击验证：手机端移动导航“客户管理”、设置页“刷新状态”、客户门户“查看项目详情”、客户门户“查看生产订单”均可点击并正确跳转。
- 复测：修复后 `/settings` 和 `/production` 手机视口 `scrollWidth` 均等于 `clientWidth`，无页面级横向滚动，且没有小于 28px 的可见按钮。

# 2026-05-25 项目审阅与生产订单新建验证
- 发现：`app/api/production/orders/route.ts` 已存在生产订单创建接口，但没有 `/production/new` 页面，也没有从 `/production` 进入创建流程的按钮，导致管理员无法从界面新建生产订单。
- 修复：新增 `app/production/new/page.tsx`，并在 `app/production/page.tsx` 订单列表区加入 `/production/new` 入口。
- 构建验证：`npm.cmd run build` 通过，路由表包含 `ƒ /production/new` 和 `ƒ /api/production/orders`；仅保留 `app/umbrella-catalog/page.tsx:93`、`:113` 既有 `<img>` lint 警告。
- API 验证：管理员创建 `SIMTEST-PO-*` 返回 `303 See Other`，订单写入 `data/production-records.json`；阶段推进、任务完成、内部 COMMENTS、客户 COMMENTS 均返回 `303`。
- 权限验证：ABC 客户访问自己的新订单详情返回 `200`，访问 `po-korea-260512` 返回 `404`。
- 浏览器验证：`/production/new` 显示“新建生产订单 / 默认生产子任务 / 保存生产订单”；`/production?customer=abc-malaysia&order=po-simtest-*` 显示新建订单、任务和双向 COMMENTS。
- 清理验证：已从 `data/production-records.json` 移除本轮 `SIMTEST-PO-*` 订单和更新记录，`rg -n "SIMTEST|AUTOTEST" data -S` 无残留。

# 2026-05-25 第二轮审阅证据
- 发现：`app/customers/[id]/page.tsx` 的生产订单卡是静态 `div`，客户详情页无法跳转到订单详情。
- 修复：生产订单卡改为链接到 `/production?customer={customerId}&order={orderId}`，关联项目链接改为 `/projects?customer={customerId}&project={projectId}`。
- 发现：`app/projects/page.tsx` 右侧项目提醒卡只区分红色和黄色，绿色项目也会显示黄色提醒。
- 修复：新增 `reminderClasses()`，按红/黄/绿三种状态渲染提醒色值。
- 构建验证：`npm.cmd run build` 通过；仅保留 `app/umbrella-catalog/page.tsx` 既有 `<img>` lint 警告。
- 本地服务验证：构建后 dev server 出现 `.next` chunk 缓存冲突，清理 `.next` 并重启后 `/customers/abc-malaysia`、`/production?customer=abc-malaysia&order=po-abc-260518` 返回 200。
- 浏览器验证：`/customers/abc-malaysia` 可见 `ABC Malaysia / 关联项目 / 生产订单`，页面 href 包含 `/projects?customer=abc-malaysia&project=foldable-umbrella-malaysia` 和 `/production?customer=abc-malaysia&order=po-abc-260518`。

# 2026-05-25 第三轮附件与移动端验证
- 发现：`app/portal/projects/[id]/page.tsx` 文件区渲染 `Download` 文案但不是链接，客户无法下载后台上传的项目附件。
- 发现：`app/api/projects/[id]/attachments/[file]/route.ts` 和 `app/api/production/orders/[id]/attachments/[file]/route.ts` 只允许管理员访问，客户门户无法下载自己项目/订单附件。
- 修复：两个附件下载接口支持 `umbrella_session=customer`，并用 `umbrella_identity` 校验客户归属；不匹配返回 `404`，未登录返回 `401`。
- 修复：两个下载接口在 `readFileSync` 前检查文件是否存在，缺失文件返回 `404 Attachment file not found.`。
- 修复：客户门户项目详情对真实上传附件输出下载链接，对历史记录文件输出 `Record only`；客户门户生产订单详情新增附件资料列表和下载链接。
- 构建验证：`npm.cmd run build` 通过；仅保留 `app/umbrella-catalog/page.tsx:93`、`:113` 既有 `<img>` lint 警告。
- API 验证：临时项目 `simtest-attachment-project-*` 上传项目附件后，ABC 客户下载返回 `200 OK`，缺少客户身份返回 `404 Not Found`。
- API 验证：临时生产订单 `po-simtest-attach-po-*` 上传生产附件后，ABC 客户下载返回 `200 OK`，缺少客户身份返回 `404 Not Found`。
- 清理验证：已移除本轮临时项目、临时订单、项目附件目录、生产附件目录和 `.tmp` 测试文件；`rg -n "SIMTEST|AUTOTEST" data .tmp -S` 无残留。
- 移动端验证：Playwright 390px 检查 `/portal/projects/foldable-umbrella-malaysia`、`/portal/production/po-abc-260518`、`/customers/abc-malaysia`、`/projects?customer=abc-malaysia&project=foldable-umbrella-malaysia`、`/production?customer=abc-malaysia&order=po-abc-260518`，`scrollWidth` 均等于 `clientWidth`。
# 2026-05-25 第四轮关闭与备份验证
- 发现：`app/portal/page.tsx` 使用 `getProductionOrders(customerId, { includeClosed: true })`，导致已结束生产订单仍会出现在客户门户。
- 修复：客户门户生产订单列表改为默认隐藏已关闭订单，`app/portal/production/[id]/page.tsx` 对已关闭订单返回 404。
- 发现：生产订单附件下载和客户 COMMENTS 接口只校验客户归属，未校验订单是否已关闭；已关闭订单仍可能被客户继续访问附件或留言。
- 修复：`app/api/production/orders/[id]/attachments/[file]/route.ts` 和 `app/api/production/orders/[id]/comments/route.ts` 对客户侧访问增加 `orderIsClosed()` 检查，关闭后返回 404。
- 发现：`lib/backup.ts` 恢复 JSON 快照时会覆盖记录文件，但不会删除备份快照之外的附件文件，可能造成恢复后仍残留后续上传的旧附件。
- 修复：`restoreBackup()` 在写回快照前调用 `clearManagedBackupDirectories()`，清空 `project-attachments` 和 `production-attachments` 后再恢复备份内文件。
- 验证：`npm.cmd run build` 通过；临时关闭订单回归通过；隔离备份恢复夹具确认 extra 附件被删除、pre-restore 备份被创建；`rg -n "SIMTEST|AUTOTEST" data .tmp -S` 无残留。
