# 技术实施方案（Plan）

> SDD 体系的**核心交付物**。它回答 spec.md 的"WHAT"如何落到代码上的"HOW"。
> 本文是工程师的"主地图"：架构、模块边界、数据流、迭代路线、风险与决策记录都在这里。
>
> **每个 PR 必须能在本文找到对应章节作为依据。**

---

## 目录

1. [现状评估](#1-现状评估where-we-are)
2. [目标架构](#2-目标架构target-architecture)
3. [模块边界](#3-模块边界module-boundaries)
4. [数据流与状态管理](#4-数据流与状态管理)
5. [Mock → Real API 演进路径](#5-mock--real-api-演进路径)
6. [质量保障体系](#6-质量保障体系)
7. [迭代路线图 M0–M4](#7-迭代路线图roadmap-m0m4)
8. [风险登记册](#8-风险登记册)
9. [架构决策记录 ADR](#9-架构决策记录adr)

---

## 1. 现状评估（Where We Are）

### 1.1 代码资产盘点

| 维度 | 数据 | 备注 |
|------|------|------|
| 前端路由页面 | 24 个（含 2 个重定向） | 6 大模块全覆盖 |
| Zustand Stores | 3 个 | demoRoleStore / taskStore / workbenchRoleStore |
| 后端 API 端点 | 30 个 | 7 个核心任务 + 3 个 dashboard + 3 个 alerts + 11 个 enterprises + 5 个 qcc + 3 个 post-loan |
| Mock 文件 | 5 个 | MSW browser.ts + handlers.ts + data.ts + test/mocks |
| 类型定义文件 | 7 个 | types/ 下，已 export 聚合 |
| 关键组件/页面 | 70+ 个 | pages/ + components/ |
| Git 提交数 | 6 次 | feat(post-loan) 为主 |

### 1.2 Vibe 阶段遗留的工程债（已识别）

| 债务项 | 体现 | 处置时机 |
|--------|------|---------|
| 无单元测试 | 无 vitest.config / `__tests__` | M3 引入 |
| 无 CI | 无 `.github/workflows` | M2 引入 |
| 部分页面超过 200 行 | Home/index.tsx 等大文件 | M1 拆分 |
| 无统一 logger | 直接 `console.log` 散落 | M2 抽 `utils/logger.ts` |
| 缺失 5 态覆盖审计 | 没有清单确认每页 loading/empty/error/disabled/hover | M1 完成审计 |
| 无错误边界 | 没有 `<ErrorBoundary>` | M2 引入 |
| MSW 18 个散落文件已合并 | ✅ 已解决 — 统一为 `mock/data.ts` 单一数据源 |

### 1.3 已沉淀的好资产（不要破坏）

- ✅ **角色化 UI 体系**：`demoRoleStore` + 角色切换器 + 菜单过滤 + 首页差异化
- ✅ **统一 Mock 层**：`mock/data.ts` 单一数据源，后端离线可完整演示
- ✅ **企业风险评估 Agent**：企查查 MCP 集成（65 tools），9 维度 + 18 类风险
- ✅ **MSW 拦截层**：浏览器端请求拦截，`VITE_USE_MOCKS` 控制切换
- ✅ **贷后场景 REST**：`/api/scenario/post-loan/*` 完整 CRUD
- ✅ **样式 Token 体系**：`src/styles/tokens.css` + Tailwind v4

---

## 2. 目标架构（Target Architecture）

### 2.1 总体分层

```
┌────────────────────────────────────────────────────────────────┐
│                    Pages (路由页面，24 个)                       │
│                       薄层，不放业务逻辑                          │
└─────────┬──────────────────────────────────────────────┬───────┘
          │                                              │
          ▼                                              ▼
┌─────────────────────────┐               ┌──────────────────────┐
│  Components (展示/业务)   │               │  Store (Zustand × 3) │
│  layout/ui/business      │               │  跨页面共享状态       │
└──────────┬──────────────┘               └──────────┬───────────┘
           │                                          │
           ▼                                          │
┌────────────────────────────────────────────────────┴──────────┐
│                  api/client.ts (统一 fetch 封装)                │
└──────────┬─────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│            MSW Mock (浏览器拦截)  /  FastAPI 后端               │
│         VITE_USE_MOCKS=true → MSW     VITE_USE_MOCKS=false → API│
└────────────────────────────────────────────────────────────────┘
```

### 2.2 关键约束

- **Pages 不能直接 import Mock**：必须经 store 或 api/client
- **Components 不能 import Stores**：UI 组件保持纯展示，状态由 page/hook 注入
- **Stores 之间不直接 import**：跨域通过组件编排
- **Mock 与真实 API 共享同一套接口签名**

### 2.3 目录结构

```text
frontend/src/
├── App.tsx                        # 路由聚合 (createBrowserRouter)
├── main.tsx                       # 应用入口
│
├── pages/                         # 24 个路由页面（薄层）
│   ├── Home/                      # 首页（含 postLoan/ 子包）
│   ├── Monitor/                   # 预警监控 (6 页)
│   ├── Strategy/                  # 策略模型 (7 页)
│   ├── Risk/                      # 处置闭环 (3 页)
│   ├── Knowledge/                 # 知识沉淀 (4 页)
│   ├── Feature/                   # 特征工作室
│   ├── Data/                      # 数据源管理
│   └── Architecture/              # 系统集成
│
├── components/
│   ├── layout/                    # AppLayout / AppHeader / AppSider
│   ├── ui/                        # KpiCard / RiskTag / AlertCard / Skeleton
│   └── business/                  # ModulePageShell / DemoFlowNav / MLOpsStatus
│
├── store/                         # Zustand，按业务域拆分
│   ├── demoRoleStore.ts           # 角色切换（persist localStorage）
│   ├── taskStore.ts               # 任务列表（轮询 + 可见性感知）
│   └── workbenchRoleStore.ts      # 工作台千人千面
│
├── api/
│   └── client.ts                  # 统一 fetch 封装（唯一 HTTP 出口）
│
├── mock/                          # MSW Mock
│   ├── browser.ts                 # Service Worker 启动/停止
│   ├── handlers.ts                # 请求处理器（14 个端点）
│   └── data.ts                    # ⭐ 单一 Mock 数据源
│
├── config/
│   ├── navigation.tsx             # 导航配置 (PRIMARY_NAV)
│   ├── routeMeta.ts               # 路由元信息
│   ├── brand.ts                   # 品牌常量
│   └── demoSession.ts             # 演示会话配置
│
├── types/                         # 全局类型定义
├── styles/                        # tokens.css + tailwind.css
└── test/                          # Vitest + MSW test server
```

---

## 3. 模块边界（Module Boundaries）

### 3.1 六大业务模块的边界

| 模块 | Pages | Store | 跨域依赖 |
|------|-------|-------|---------|
| 首页工作台 | Home/* (含 postLoan/) | demoRoleStore + taskStore | → 所有模块（下钻跳转） |
| 预警监控 | Monitor/* (6 页) | — | → 处置闭环（预警触发处置） |
| 处置闭环 | Risk/* (3 页) | workbenchRoleStore | ← 预警监控 |
| 策略模型 | Strategy/* (7 页) | — | → 处置闭环（FP/RC 引用） |
| 智能体 | Agents/* (1 已实现 + 6 待注册) | — | ← 预警监控 / 处置闭环（被调用） |
| 知识数据 | Knowledge/* + Feature + Data | — | ← 策略模型（RC/FP 引用） |

### 3.2 共享层

```
所有模块共享：
- types/                  # 类型契约
- styles/tokens.css       # 视觉契约
- components/ui/          # UI 组件契约
- components/layout/      # 布局契约
- api/client.ts           # HTTP 出口
- config/                 # 导航/路由元信息
```

### 3.3 跨模块通信规则

- ✅ 通过 **props / hooks** 传递
- ✅ 通过 **路由参数**：`/risk/workbench?alertId=xxx`
- ✅ 通过 **共享 types**
- ✅ Agent 间通过 **API 调用**
- ❌ **禁止**：A 模块的 store 内 import B 模块的 store
- ❌ **禁止**：A 模块组件 import B 模块的内部组件

---

## 4. 数据流与状态管理

### 4.1 状态分类

```
组件本地状态 (useState)         — 表单输入、临时 UI 开关
        │
        ▼
跨组件共享状态 (Zustand × 3)    — 角色、任务列表、工作台视角
        │
        ▼
派生状态 (selector)              — 过滤后的任务、KPI 聚合
        │
        ▼
持久化状态 (localStorage)        — 角色选择（demoRoleStore persist）
        │
        ▼
服务端状态 (api/client.ts)       — FAST API 调用 / MSW Mock 拦截
```

### 4.2 Zustand Store 设计模板

```typescript
interface XxxState {
  // 1. 数据
  items: Item[];
  loading: boolean;
  error: string | null;

  // 2. 同步 Action（只改 state）
  setItems: (items: Item[]) => void;

  // 3. 异步 Action（调 api/client）
  fetchItems: () => Promise<void>;

  // 4. 重置
  reset: () => void;
}
```

**约束**：
- 派生状态用 selector，不写进 state
- 异步 Action 内部统一 try/finally 处理 loading
- 所有 store 必须有 `reset()`（用于角色切换/路由离开）

### 4.3 Mock ↔ Real API 切换

```typescript
// 当前实现：
//   VITE_USE_MOCKS=true  → MSW 浏览器拦截，后端离线可用
//   VITE_USE_MOCKS=false → 请求直连 FastAPI 后端

// api/client.ts 内部统一 fetch 封装，页面/Store 不感知底层是 Mock 还是真实 API
export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
```

---

## 5. Mock → Real API 演进路径

### 5.1 隔离层设计

唯一允许触碰真实后端的层是 `api/client.ts`。其他所有代码都通过它访问数据，**不感知底层是 mock 还是 real**。

### 5.2 接入步骤

1. 保持 `api/client.ts` 接口签名不变
2. 后端 API 就绪后，设置 `VITE_USE_MOCKS=false`
3. MSW 自动退出，请求直连 FastAPI
4. `mock/data.ts` 保留作为离线演示模式

### 5.3 对 Stores / Pages 的影响

**零改动**目标。Store 内部只 `await client.get('/api/...')`，不关心是 MSW 还是 HTTP。

---

## 6. 质量保障体系

### 6.1 静态质量（已就位）

- ✅ TypeScript strict（`tsconfig.app.json`）
- ✅ ESLint + typescript-eslint
- ✅ `npm run build` = `tsc -b && vite build`（类型 + 构建双检）

### 6.2 动态质量（路线规划）

| 层级 | 工具 | 时机 | 目标覆盖率 |
|------|------|------|-----------|
| 单元 | Vitest + React Testing Library | M3 | 关键 hooks/store ≥ 70% |
| 集成 | Vitest + RTL（多组件） | M3 | 主流程 ≥ 50% |
| E2E | Playwright | M4 | 5 条主旅程 |
| 类型 | tsc --noEmit | 已就位 | 0 error |
| Lint | ESLint | 已就位 | 0 error |

### 6.3 PR 质量门

每个 PR 必过：
- 关联 spec/plan 编号
- `npm run build` 绿
- `npm run lint` 绿
- Reviewer 至少 1 人

---

## 7. 迭代路线图（Roadmap M0–M4）

### M0 - SDD 文档对齐期 ✅（本次）

**目标**：建立 SDD 文档体系，从 Vibe Coding 切换到 Spec-Driven Development。

- [x] 创建 `docs/sdd/` 目录与六件套（constitution/prd/spec/plan/tasks/test）
- [x] 按参考项目风格重构文档结构（扁平单文件 + 用例编号）
- [x] 创建 brainstorm/ 设计探索目录

**出口标准**：
- 所有文档链接有效
- 新 PR 模板要求关联 spec 编号

---

### M1 - 工程债清理期（建议 2 周）

**目标**：消除 Vibe 阶段遗留的工程债。

| 任务 | 关联 | 输出 |
|------|------|------|
| 拆分超过 200 行的 page | [plan-§1.2] | Home/index.tsx → 多组件 |
| 5 态审计 | [const-§5.1] | 每页 loading/empty/error/disabled/hover 清单 |
| 引入 `<ErrorBoundary>` | [plan-§1.2] | 顶层 + 模块层错误边界 |
| 抽 `utils/logger.ts` | [const-§2.2] | 替代裸 console.log |

**出口标准**：
- 所有 pages/*/index.tsx ≤ 200 行
- 5 态审计清单完成

---

### M2 - 后端接入准备期（建议 2-3 周）

**目标**：CI 基础设施 + 认证骨架 + service 隔离层。

| 任务 | 输出 |
|------|------|
| 引入 GitHub Actions CI | lint + build 阻塞 PR |
| 引入 Toast / Skeleton 全局组件 | 补全 ui/ |
| 设计认证 token 管理 | services/auth.ts |
| 以 1 条端到端样例走通 Mock→Real 切换 | enterprise.list 试点 |

**出口标准**：
- CI 阻塞 lint/build 不通过的 PR
- 切换 `VITE_USE_MOCKS=false` 后前端可连接后端

---

### M3 - 测试与可观测期（建议 3-4 周）

**目标**：引入自动化测试，覆盖率起步。

| 任务 | 输出 |
|------|------|
| 引入 Vitest + RTL | 单元测试基础设施 |
| 关键 store 全覆盖 | 3 个 store 单测 ≥ 70% |
| 关键 hooks 单测 | 自定义 hooks 100% |
| 覆盖率基线 | ≥ 50% 总行覆盖 |

---

### M4 - 智能体协议落地期（建议 3 周）

**目标**：AG-UI / A2UI 协议驱动业务，E2E 覆盖主旅程。

| 任务 | 输出 |
|------|------|
| AG-UI 协议流式渲染 | RiskChat / Analysis |
| 引入 Playwright | 5 条主旅程 E2E |
| 性能优化 | 路由懒加载、按需引入 |

---

### 路线总览

```
M0  M1   M2     M3        M4
 │   │    │      │         │
文档  债   CI +   测试      协议
对齐  务   认证   监控      E2E
 ✓   2w   2-3w   3-4w      3w
```

---

## 8. 风险登记册

| 编号 | 风险 | 等级 | 触发条件 | 应对 |
|------|------|------|---------|------|
| R-1 | 企查查 MCP 服务不稳定 | 高 | API Key 过期 / 服务降级 | 健康检查端点 + 3 次重试 + 降级响应 + 用户友好提示 |
| R-2 | 后端 API 长期不就绪 | 中 | 业务方排期延期 > 2 月 | MSW Mock 保持离线可用 |
| R-3 | 前端体积膨胀 | 中 | 单页 > 1MB | M4 路由懒加载 |
| R-4 | 文档与代码漂移 | 高 | SDD 流程未严格执行 | PR 模板强制 spec 编号；CR 先查文档 |
| R-5 | 角色化 UI 复杂度随角色增加 | 中 | 新增第 4 个角色 | 角色矩阵文档化；新角色需先更新 spec |
| R-6 | Agent 间调用链路过长 | 低 | 链式调用 > 3 层 | 单次调用不超过 2 层；超时 5s 熔断 |
| R-7 | 企业敏感数据泄露 | 高 | 日志中记录企业名称/法人/证件号 | `utils/logger.ts` 内置脱敏函数（mask 中间字符）；M2 安全审查 checklist；环境变量管理 API Key |
| R-8 | 预警认领并发竞争 | 中 | 多人同时认领同一预警 | `PATCH /api/alerts/:id/claim` 乐观锁（version 字段）；409 Conflict 返回；前端刷新列表 |

---

## 9. 架构决策记录（ADR）

> 所有重大决策必须以 ADR 形式记录在此，**禁止只在聊天里口头决定**。

### ADR-001：状态管理选 Zustand 而非 Redux

- **日期**：2026-04（Vibe 阶段决策）
- **状态**：✅ 已采纳
- **决策**：业务域级状态采用 Zustand v5
- **理由**：
  - Zustand 无 boilerplate，store 体积小（本项目 3 个 store 平均 < 100 行）
  - 项目状态相对扁平（角色 + 任务列表 + 工作台视角），无需 Redux DevTools
  - 与 React 18 / TypeScript 5 兼容良好
- **代价**：派生状态需要手写 selector，无内建 RTK Query
- **替代方案**：Redux Toolkit（过重）/ Context API（大量数据时性能差）

---

### ADR-002：MSW Mock 优先于真实后端开发

- **日期**：2026-04
- **状态**：✅ 已采纳
- **决策**：前端开发阶段使用 MSW 浏览器端拦截，`mock/data.ts` 单一数据源
- **理由**：
  - "后端离线可完整演示"是硬需求
  - 18 个散落 mock 文件已统一收敛为单一数据源，维护成本大幅降低
  - `VITE_USE_MOCKS` 环境变量一键切换，不影响生产代码
- **代价**：Mock 数据需要与真实 API 保持接口一致性
- **替代方案**：直接调 FastAPI（依赖后端稳定性）/ json-server（多一个进程）

---

### ADR-003：角色化 UI — 顶部切换器 + Store 驱动

- **日期**：2026-04
- **状态**：✅ 已采纳
- **决策**：首页/菜单/DemoFlowNav 全部由 `demoRoleStore.role` 驱动差异化展示
- **理由**：
  - 三种角色（RM / Risk Modeler / Strategy Approver）的日常工作完全不同
  - "客户经理优先"原则要求首页直接展示他最需要的信息
  - 顶部角色切换器 make 角色切换 visible and explicit
- **代价**：条件渲染增加；新角色接入需要修改多处
- **替代方案**：权限系统（过重，当前无认证）/ 多套首页（代码重复）

---

### ADR-004：企业风险评估做成独立 Agent 而非页面内嵌

- **日期**：2026-04
- **状态**：✅ 已采纳
- **决策**：企业风险评估作为底层能力 Agent（`/agents/vendor-risk-assessment`），可被预警归因 Agent、处置建议 Agent 调用
- **理由**：
  - "被调用"比"被嵌入"灵活——归因/处置/工作台 3 个场景都需要风险评估结果
  - 独立路由 + 独立 API 端点，边界清晰
  - 企查查 MCP（65 tools）的集成复杂度封装在一处
- **代价**：多一层 Agent 间通信；MCP 不可用时需降级
- **替代方案**：页面内嵌风险评估逻辑（需在 3 处重复实现）

---

### ADR-005：扁平 SDD 文档结构（单文件 > 子目录）

- **日期**：2026-05-06
- **状态**：✅ 已采纳
- **决策**：`docs/sdd/` 采用 6 个核心文件 + brainstorm/ 的扁平结构
- **理由**：
  - 参考 due-diligence-platform 项目的成熟 SDD 实践
  - 单文件更利于跨文档引用（`[spec-HOME-1]` 一个链接即可）
  - 新成员按顺序读完即可上手（45 分钟路线）
  - 避免子目录带来的索引维护和文档碎片化
- **代价**：单文件较长（plan.md ~500 行），需要目录导航
- **替代方案**：原 specs/plans/tasks/ 子目录结构（已重构为当前结构）

---

### ADR-006：样式方案 — Tailwind v4 + CSS 变量

- **日期**：2026-04
- **状态**：✅ 已采纳
- **决策**：Tailwind CSS v4 为主 + `src/styles/tokens.css` 定义全局变量
- **理由**：
  - "浅色金融玻璃台"风格需要大量玻璃拟态效果，Tailwind 原子类组合灵活
  - 全局 Token（品牌蓝、语义色、圆角、间距）收敛在 tokens.css
  - 禁止 styled-components / emotion 避免运行时开销
- **代价**：长 class 列表可能影响可读性
- **强制执行**：constitution §3 设计红线，CR 拦截硬编码颜色

---

### ADR-007：暂不做移动端原生

- **状态**：✅ 已采纳
- **决策**：仅响应式 Web，不做 RN / Flutter / 小程序
- **理由**：用户角色（客户经理/建模师/审批员）核心办公场景是桌面端
- **重新评估时机**：业务侧明确给出移动端 KPI 时

---

## 修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-05-06 | 合并 3 个独立 Plan，加入架构总图、模块边界矩阵、M0-M4 路线、风险登记册、7 条 ADR |
