# 任务清单（Tasks）

> 本文是**当前迭代**的可执行任务表。每个任务必须能链接到 [`spec.md`](./spec.md) 或 [`plan.md`](./plan.md) 的条目。
>
> 完成的任务移入"已完成归档"，过期未启动的任务在每周清理。

---

## 0. 任务编号规则

```
TASK-<MILESTONE>-<编号>
```

例如 `TASK-M1-01`、`TASK-M2-12`。

每条任务字段：

- **关联**：`[spec-XX]` 或 `[plan-§Y]` 或 `[ADR-NNN]`
- **类型**：feat / fix / refactor / docs / chore / test
- **优先级**：P0（阻塞迭代）/ P1（迭代内必做）/ P2（有空就做）
- **预估**：S（≤0.5d）/ M（0.5-2d）/ L（2-5d）/ XL（>5d，必须拆）
- **验收**：每条必须有可验证的产出物

---

## 1. 当前迭代：M1 工程债清理期（进行中）

> M0 文档对齐已完成。M1 工程债清理进行中。
> **建议节奏**：2 周完成。

### 1.1 P0 阻塞任务（不做完不能进 M2）

| ID | 任务 | 关联 | 类型 | 预估 | 验收 | 状态 |
|----|------|------|------|------|------|------|
| TASK-M1-01 | 拆分 `pages/Home/index.tsx` | [plan-§1.2][spec-HOME-1] | refactor | M | 主文件 ≤ 200 行；KPI/任务列表/快捷入口拆为独立组件 | ⬜ 待开始 |
| TASK-M1-02 | 拆分 `pages/Strategy/` 大文件 | [plan-§1.2] | refactor | M | 超过 200 行的 strategy page 拆分 | ⬜ 待开始 |
| TASK-M1-03 | 全站 5 态审计清单 | [plan-§1.2][const-§5.1] | docs | M | `docs/sdd/audit-5states.md` 列出每个 page 当前 5 态实现情况 | ⬜ 待开始 |
| TASK-M1-04 | 移除 page 直接 import mock | [plan-§2.2] | refactor | M | `rg "from.*mock/data"` 仅 api/client 和 store 命中 | ⬜ 待开始 |
| TASK-M1-16 | 清理无用/冗余代码 | [refactor-cleaner] | refactor | M | 删除 19 个未使用文件 + 6 个未使用依赖 | ⬜ 待开始 |

### 1.2 P1 迭代内任务

| ID | 任务 | 关联 | 类型 | 预估 | 验收 | 状态 |
|----|------|------|------|------|------|------|
| TASK-M1-17 | 预警证据链组件化（核查工作台） | [spec-RISK-6] | feat | M | 提取 `EvidenceChain` 组件复用 `EvidenceItem` 类型（消除 `any`）；证据按 8 大变量域分组展示 + 可信度标识；导出证据链按钮生成 Markdown 报告下载；`npm run build` 绿 | ⬜ 待开始 |
| TASK-M1-05 | 抽 `utils/logger.ts` | [plan-§1.2][const-§2.2] | feat | S | dev 环境 console，prod 收口；内置脱敏函数（mask 企业名称/法人/证件号中间字符）；替换裸 console.log | ⬜ 待开始 |
| TASK-M1-06 | 添加全局 `<ErrorBoundary>` | [plan-§1.2] | feat | S | 顶层 + 6 大模块各一层；错误页有"刷新/返回首页" | ✅ 已完成 |
| TASK-M1-07 | 增加 PR 模板 `.github/PULL_REQUEST_TEMPLATE.md` | [const-§4.2] | docs | S | 必填 spec/plan 编号 | ⬜ 待开始 |
| TASK-M1-08 | 5 态审计后修复缺漏 | [TASK-M1-03] | fix | L | 至少补全 RM 主路径的 loading/empty/error 态 | ⬜ 待开始 |
| TASK-M1-09 | 补 `src/styles/` 下 token 使用说明 | [ADR-006] | docs | S | tokens.css 注释完整 | ⬜ 待开始 |
| TASK-M1-12 | 为 `api/client.ts` 写 smoke test | [plan-§6.2][test-§4] | test | S | vitest 配置 + client.ts 基础测试（请求构造/错误映射/超时）≥ 3 个用例 | ⬜ 待开始 |
| TASK-M1-13 | 为 3 个 store 写 smoke test | [plan-§6.2][test-§4] | test | M | demoRoleStore/taskStore/workbenchRoleStore 各 ≥ 2 个用例（初始化/reset/核心 action） | ✅ 已完成 |
| TASK-M1-14 | Mock 数据类型契约校验 | [spec-§5][plan-§5.1] | test | S | mock/data.ts 导出值的 TypeScript 类型与 api/client 返回类型一致（编译时检查，`tsc -b` 通过） | ⬜ 待开始 |
| TASK-M1-15 | 性能基线测量 | [spec-§5] | test | S | Lighthouse 跑首页得分记录；api/client.ts 关键接口响应时间埋点（console.table 输出） | ⬜ 待开始 |

### 1.3 P2 选做任务

| ID | 任务 | 关联 | 类型 | 预估 | 验收 | 状态 |
|----|------|------|------|------|------|------|
| TASK-M1-10 | 检查 `dist/` 是否应纳入 gitignore | repo | chore | S | 确认构建产物不提交 | ⬜ 待开始 |
| TASK-M1-11 | 给每个 store 加 `reset()` | [const-§5.1] | refactor | M | 3 个 store 全部具备 reset | ⬜ 待开始 |

---

## 2. 下一迭代：M2 后端接入准备期（草案）

> 进入 M2 前必须完成 M1 全部 P0/P1。

| ID | 任务 | 关联 | 预估 |
|----|------|------|------|
| TASK-M2-01 | 引入 GitHub Actions CI（lint + build） | [plan-§6.3] | S |
| TASK-M2-02 | 引入 Toast / Skeleton 全局组件 | [plan-§1.2] | M |
| TASK-M2-03 | 设计认证 token 管理骨架 | [plan-§5.2] | M |
| TASK-M2-04 | spike：以 1 条 API 走通 Mock→Real 切换 | [plan-§5.2] | M |
| TASK-M2-05 | 6 个 Agent 路由注册到 App.tsx | [spec-AGENT] | M |
| TASK-M2-06 | 配置 `.env.example` | repo | S |

---

## 3. 已完成归档

> 完成后从上方移到这里，每月清理一次。

### M0 - SDD 文档对齐期 ✅ 2026-05-06 完成

| ID | 任务 | 产出 | 状态 |
|----|------|------|------|
| TASK-M0-01 | 创建 `docs/sdd/` 六件套 | constitution + prd + spec + plan + tasks + test | ✅ 已完成 |
| TASK-M0-02 | 引入用例编号体系 | spec.md 全模块 SPEC-XXX-NN | ✅ 已完成 |
| TASK-M0-03 | 合并独立 Spec → 单文件 spec.md | 合并 3 个 Spec | ✅ 已完成 |
| TASK-M0-04 | 合并独立 Plan → 单文件 plan.md | 合并 3 个 Plan + 7 条 ADR | ✅ 已完成 |
| TASK-M0-05 | 合并独立 PRD → 单文件 prd.md | 用户画像 + RICE + 版本路线 | ✅ 已完成 |
| TASK-M0-06 | 创建 brainstorm/ 目录 | 架构关键决策回顾 | ✅ 已完成 |
| TASK-M0-07 | 更新 SDD README 为扁平结构入口 | 45 分钟阅读路线 | ✅ 已完成 |
| TASK-M0-08 | 清理旧子目录结构 | 删除冗余独立文件 | ✅ 已完成 |

---

## 4. Bug / Issue 跟踪

> 任何 PR 修复 bug 必须先在此登记，并关联到 spec 哪条用例失效。

| ID | 描述 | 关联 | 严重度 | 状态 |
|----|------|------|--------|------|
| — | （暂无） | — | — | — |

---

## 修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-05-06 | 合并 6 个独立 Task，加入 M0 归档、M1 任务、M2 草案 |
| v1.1 | 2026-05-07 | 更新 M1 进度：TASK-M1-06（ErrorBoundary）已完成、TASK-M1-13（store smoke test）已完成；新增 TASK-M1-16（清理无用代码） |
