# 项目宪法（Constitution）

> 这是本项目最高优先级的文档。违反任意一条红线都会被 PR Block。
> 修改宪法需要：① 项目负责人评审；② 在修订记录说明动因；③ 同步评估对 plan.md 的级联影响。

---

## 第一章 项目身份

### 1.1 一句话定义

**面向商业银行小微企业贷后场景的风险预警、处置闭环与智能体协同平台**：让客户经理 / 风控建模师 / 策略审批员在同一个 Web 平台上完成预警发现、核查处置、策略实验、发布审批的全链路作业。

### 1.2 核心用户（按优先级）

| 优先级 | 角色 | 代号 | 使用频率 | 核心场景 |
|--------|------|------|---------|---------|
| P1 | 客户经理 | RM | 每日 | 预警发现、认领核查、处置闭环 |
| P2 | 风控建模师 | Risk Modeler | 每周 | 特征工程、模型实验、决策流部署 |
| P3 | 策略审批员 | Strategy Approver | 每月 | 回溯验证、Diff 审查、发布审批 |

> 当出现需求冲突时，**客户经理优先**。

### 1.3 不在范围（Out of Scope）

以下内容**永久排除**，不接受讨论：

- ❌ 移动端原生 App（仅响应式 Web）
- ❌ 直接对接银行核心交易系统（合规风险，由银行内部中台统一封装）
- ❌ 放款、还款等资金操作（这是核心银行系统的领域）
- ❌ 替代客户经理/审批员的最终决策（平台只做辅助，决策权永远在人）
- ❌ 移动端推送（钉钉/企微等，依赖 IT 通道，暂不纳入）

---

## 第二章 技术红线

以下条款**禁止违反**。CR 中发现立即驳回，不接受"特殊情况"。

### 2.1 技术栈锁定

| 维度 | 锁定值 | 理由 |
|------|--------|------|
| UI 框架 | React 18+ | 已选定，跨版本迁移成本高 |
| 语言 | TypeScript 5.0+ (strict) | 大型应用必须类型化 |
| 构建 | Vite 6+ | 不引入 webpack |
| 样式 | Tailwind CSS v4 + CSS 变量 | 禁止 styled-components / emotion / sass |
| UI 组件库 | Ant Design 5+ | 企业级表格/表单/抽屉骨架 |
| 状态 | Zustand 5+ | 禁止 Redux / MobX |
| 路由 | React Router 6+ | 禁止 TanStack Router |
| 后端 | Python 3.10+ / FastAPI | 已选定 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产待定） | 开发阶段零配置 |

> 引入新的运行时依赖必须在 plan.md 留 ADR。

### 2.2 编码红线

- ❌ **禁止使用 `any`**：必须显式 unknown / 泛型 / 联合类型
- ❌ **禁止裸 `console.log` 进生产代码**：使用统一的日志封装
- ❌ **禁止硬编码颜色值**：必须从 `src/styles/tokens.css` 或 Tailwind 语义类引用
- ❌ **禁止把业务逻辑写在 `pages/*/index.tsx`**：超过 200 行必须拆分到 hooks / components / store
- ❌ **禁止跨模块直接 import 别人的内部组件**：只能 import 模块顶层导出
- ❌ **禁止直接调用 `fetch`**：必须经过 `api/client.ts` 统一封装

### 2.3 状态管理红线

- ✅ **按业务域拆分 Store**（如 `demoRoleStore`、`taskStore`、`workbenchRoleStore`）
- ✅ **Store 内只放"跨页面共享"的状态**，组件内部状态用 `useState`
- ❌ **禁止在 Store 里放派生状态**：派生用 selector 即时算
- ❌ **禁止 Store 之间直接 import**：跨域协作走 props 或事件

### 2.4 数据层红线

- 当前所有数据来自 MSW Mock + FastAPI 后端
- ❌ **禁止页面组件直接 import mock 文件**：必须经过 store 或 api client
- ❌ **禁止把 Mock 数据 hardcode 进组件**
- ✅ **Mock 与真实 API 共享同一套接口签名**：切换时只改 `api/client.ts` 内部

---

## 第三章 设计红线（视觉与交互）

详见 `docs/UI优化总结.md` 与 `docs/第一阶段优化总结.md`，本节只列**绝对底线**：

- ✅ 全站采用"浅色金融玻璃台"风格（品牌蓝主色，玻璃拟态卡片）
- ✅ 状态语义色 1:1 映射：成功绿 / 警告橙 / 危险红 / 信息蓝，全站统一
- ✅ 卡片圆角 8-16px，内边距 16-24px，间距 16px
- ✅ 内容最大宽度 1600px
- ✅ **角色化 UI**：按 RM / Risk Modeler / Strategy Approver 三种角色差异化展示内容
- ✅ **Agent-First**：智能体作为核心能力独立路由，可被其他模块调用
- ✅ **Mock-Ready**：后端离线时前端可完整演示
- ❌ 禁止页面级重复大 Hero
- ❌ 禁止固定死 `h-[600px]` 主内容高度
- ❌ 禁止无断点的 `grid-cols-3 / grid-cols-4`

---

## 第四章 流程红线

### 4.1 SDD 工作流

> "**先改文档，再改代码**" — 没有 plan/spec 支撑的 PR 一律驳回。

```
新增功能：prd.md（评估）→ spec.md（用例）→ plan.md（方案+ADR）→ tasks.md（任务）→ 代码 → PR
修复 bug：tasks.md（登记，关联 spec 条目）→ 代码 → PR
重构：   plan.md（追加 ADR）→ tasks.md → 多次小 PR
```

### 4.2 SDD 硬指标

- 任何一个 PR 都能在 spec.md / plan.md / tasks.md 里找到对应条目
- 新成员只读 SDD 文档（不看代码）就能在 1 小时内说出系统骨架
- 出现争议时，先改文档再改代码

### 4.3 提交信息

约定式提交（Conventional Commits）：

```
feat(post-loan): 贷后核心 KPI 卡片组  [spec-HOME-1]
fix(monitor): 修复预警列表 SLA 时间错位  [tasks-#42]
refactor(theme): 抽取玻璃拟态 Token 到 tokens.css  [plan-ADR-005]
docs(sdd): 更新 plan.md 角色化 UI 章节
```

---

## 第五章 质量红线

### 5.1 必须做

- ✅ 每个**业务页面**必须覆盖 5 态：loading / empty / error / disabled / hover
- ✅ 每个 **store** 必须有初始化函数和重置函数
- ✅ 每个**类型定义**必须导出，且禁止 `as any` 兜底
- ✅ `npm run build` 绿（含 `tsc -b`）+ `npm run lint` 绿
- ✅ PR 描述贴出 `[spec-XX]` 关联编号

### 5.2 暂不强制（但鼓励）

- ⚠️ 单元测试：M3 阶段引入 Vitest + RTL
- ⚠️ E2E 测试：M4 阶段评估 Playwright
- ⚠️ CI/CD：M2 阶段引入 GitHub Actions

---

## 第六章 不在宪法中的事

以下事项**故意不约束**，留给 plan.md 按迭代灵活决策：

- 具体目录结构调整
- 新增/删减页面
- Mock 数据扩展方式
- 智能体协议（AG-UI / A2UI）的细节演进
- 性能优化策略
- 后端数据库选型升级

---

## 修订记录

| 版本 | 日期 | 修改人 | 变更摘要 |
|------|------|--------|---------|
| v1.0 | 2026-05-06 | - | 初始版本 |
| v2.0 | 2026-05-06 | - | 按参考项目 SDD 风格重构，加入具体红线/禁止清单/设计约束 |
| v2.1 | 2026-05-07 | - | 更新质量红线：M1 阶段 smoke test 已启动，ErrorBoundary 已引入 |
