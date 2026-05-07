# 测试策略与规范（Test Plan）

> 本文是 [`plan.md`](./plan.md) §6（质量保障体系）的**展开**。
> **当前状态**：M1 阶段已启动 smoke test 基础设施，3 个 store 测试文件已就位。M3 阶段将全面引入自动化测试。

---

## 1. 测试理念

### 1.1 我们的立场

| 立场 | 说明 |
|------|------|
| ✅ 测试是**长期维护**的杠杆，不是早期 vibe 阶段的奢侈品 | 进入 SDD 后必须建立 |
| ✅ 测试**金字塔**而非冰激凌锥 | 单元 > 集成 > E2E |
| ✅ 测试**信任度** > 测试**覆盖率** | 70% 覆盖率但每个测试都关键，胜过 95% 覆盖率但充满样板 |
| ✅ 不测**显而易见**的代码 | 不测 getter/setter / 简单类型映射 |
| ✅ 测试是**第一公民代码** | 与生产代码同等的 Lint / 评审标准 |

### 1.2 不做的事

- ❌ **不追求 100% 覆盖率** — 投入产出比低
- ❌ **不测第三方库** — 不测 React Router / Ant Design 本身
- ❌ **不测 UI 像素级渲染** — 视觉回归留到 M4 评估
- ❌ **不写"为了测试而测试"的占位测试**

---

## 2. 测试金字塔

```
        ╱─────╲
       ╱  E2E  ╲          ← 5 条主旅程，Playwright（M4）
      ╱─────────╲
     ╱  集成测试  ╲        ← 跨组件 / 跨 store / API 端点，~20 个（M3）
    ╱─────────────╲
   ╱   单元测试    ╲      ← hooks / store / utils / api client，~80 个（M3）
  ╱─────────────────╲
```

| 层级 | 数量级 | 速度 | 工具 | 引入时机 |
|------|--------|------|------|---------|
| 单元 | 60-100 | < 5s 全跑 | Vitest + RTL | plan-M3 |
| 集成 | 15-30 | < 30s 全跑 | Vitest + RTL + MSW | plan-M3 |
| E2E | 5 | < 5min 全跑 | Playwright | plan-M4 |

---

## 3. 测试范围矩阵

> 决定"什么必测、什么可选、什么不测"。

| 模块 | 单元测试 | 集成测试 | E2E | 优先级 |
|------|---------|---------|------|-------|
| `store/*` | ✅ 必测 | ✅ 必测 | — | P0 |
| `api/client.ts` | ✅ 必测（请求构造/错误映射） | ✅ 必测（MSW 拦截） | — | P0 |
| `utils/*` | ✅ 必测 | — | — | P0 |
| `hooks/*` | ✅ 必测 | ✅ 必测 | — | P0 |
| `mock/data.ts` | ⚠️ 选测 | ✅ 必测（数据一致性） | — | P1 |
| `components/ui/*` | ⚠️ 选测 | ✅ 必测（KpiCard/RiskTag） | — | P1 |
| `components/business/*` | ⚠️ 选测 | ✅ 必测 | — | P1 |
| `components/layout/*` | — | ✅ 必测（路由集成） | — | P1 |
| `pages/*` | ❌ 不测（薄层） | ✅ 必测（关键页面） | ✅ 主旅程 | P0 |
| `styles/tokens.css` | ❌ 不测（纯常量） | — | — | — |

> "薄层"指 page 应该只做组合，业务逻辑下沉到 hooks/store。如果 page 需要单测，说明该重构。

---

## 4. 工具链与配置

### 4.1 选型决策

| 工具 | 选型 | 理由 |
|------|------|------|
| 测试运行器 | **Vitest** | 与 Vite 同源，零配置，快 |
| React 组件测试 | **@testing-library/react** | 社区标准，鼓励"用户视角" |
| DOM 模拟 | **happy-dom** | 比 jsdom 快 2-3 倍 |
| 断言 | Vitest 内置 expect | 兼容 Jest |
| Mock | Vitest vi.mock + MSW | 分层 mock |
| HTTP Mock | **MSW** | 已在使用，可复用 handlers |
| 用户交互 | **@testing-library/user-event** | 真实模拟 |
| 覆盖率 | **@vitest/coverage-v8** | 原生 V8，最快 |
| E2E | **Playwright** | 多浏览器、自动等待、调试好 |

### 4.2 安装清单（M3 第一周执行）

```bash
npm i -D vitest @vitest/coverage-v8 @vitest/ui happy-dom \
        @testing-library/react @testing-library/user-event \
        @testing-library/jest-dom msw

# E2E（M4）
npm i -D @playwright/test
npx playwright install
```

### 4.3 目录结构

```
frontend/src/
├── store/
│   ├── demoRoleStore.ts
│   └── demoRoleStore.test.ts           # 单元测试与源码同目录
├── utils/
│   ├── logger.ts
│   └── logger.test.ts
├── test/
│   ├── mocks/
│   │   ├── handlers.ts                 # 已存在：测试用 MSW handlers
│   │   └── server.ts                   # 已存在：setupServer
│   └── helpers/
│       └── render.tsx                  # 自定义 renderWithProviders
│
tests/                                   # E2E（M4）
├── e2e/
│   ├── home.spec.ts
│   ├── alert-workflow.spec.ts
│   └── agent-risk.spec.ts
└── playwright.config.ts
```

---

## 5. 覆盖率目标

> **覆盖率是结果不是目标**。下面的数字是健康基线，不是 KPI。
> **原则**：先保证关键路径有测试，再追求覆盖率数字。

| 指标 | M3 出口 | 长期 |
|------|--------|------|
| 总行覆盖 | ≥ 50% | ≥ 70% |
| store/ | ≥ 70% | ≥ 85% |
| utils/ | ≥ 75% | ≥ 90% |
| api/client.ts | ≥ 60% | ≥ 80% |
| hooks/ | ≥ 60% | ≥ 80% |
| components/ui/ | ≥ 40% | ≥ 65% |
| pages/ | — | E2E 覆盖主旅程 |

---

## 6. 关键 E2E 旅程（5 条主旅程）

> 这 5 条是产品的"生命线"，必须每次构建都跑过。引入时机：plan-M4。

### Journey-1：角色化首页（最高优先级）

```
打开 / → RM 视角看 KPI + 任务列表
      → 切换角色到 Risk Modeler → 首页内容变化
      → 切换角色到 Strategy Approver → 首页内容变化
      → 侧栏菜单联动
```

**关键断言**：
- RM 看到 4 个 KPI 卡片
- Risk Modeler 不看到 KPI 卡片
- 切换角色后 3 秒内首页刷新

---

### Journey-2：预警核查闭环

```
RM 打开 /risk/workbench → 预警列表加载
                        → 筛选 critical 级别 → 列表过滤
                        → 点击一行 → 右侧抽屉打开
                        → 点击认领 → 状态变"核查中"
                        → 提交核查结果 → 状态变"核查完成"
                        → 触发处置 → 状态变"处置中"
```

**关键断言**：
- 状态流转不允许跳态
- 操作按钮在非允许状态 disabled
- SLA 超时行标红

---

### Journey-3：监控名单入池 + 风险评估

```
打开 /monitor/watchlist-upload → 下载 CSV 模板
                               → 上传 CSV → 解析校验
                               → 触发批量风险评估
                               → 查看导入结果
```

**关键断言**：
- CSV 解析错误行有明确提示
- 批量评估调用企业风险评估 Agent
- 导入完成展示成功/失败统计

---

### Journey-4：企业风险评估 Agent

```
打开 /agents/vendor-risk-assessment → 输入企业名称
                                     → 点击开始评估
                                     → 进度动画展示
                                     → 评估完成展示 9 维度 + 18 类风险 + 证据链
```

**关键断言**：
- 3 秒内返回评估结果
- 整体风险等级颜色正确
- 证据链包含来源/时间/可信度

---

### Journey-5：策略仿真回溯

```
打开 /strategy/backtest → 配置回测参数
                        → 点击执行回测
                        → 查看新策略 vs 旧策略对比
                        → 生成回测报告
```

**关键断言**：
- 回测结果展示命中率/误报率/覆盖率
- 对比图表正确渲染
- 报告可下载

---

## 7. Mock 策略

### 7.1 不同层级的 Mock

| 层级 | 工具 | 用法 |
|------|------|------|
| HTTP 网络层 | **MSW** | 复用 `mock/handlers.ts`；测试与开发共享同一套 mock |
| 模块依赖 | `vi.mock()` | 单元测试隔离 store |
| 时间 | `vi.useFakeTimers()` | 测 SLA 超时/轮询 |
| 浏览器 API | happy-dom 内置 | localStorage / matchMedia |

### 7.2 MSW 复用

项目已有的 `frontend/src/test/mocks/` 可直接用于测试：

```typescript
// 测试 setup 中
import { server } from '@/test/mocks/server';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 8. 当前阶段的过渡方案（M0-M2）

由于 M3 才全面引入测试基础设施，**M1 先建立测试习惯**：

| 阶段 | 质量保障措施 |
|------|---------|
| M0 | TypeScript strict + ESLint + 手工 5 态自测清单 |
| M1 | + **smoke test**（vitest 配置 + api/client + 3 个 store 基础测试）+ Mock 类型契约校验（tsc -b）+ 性能基线 |
| M2 | + CI lint/build 阻塞 + 1 条样例冒烟 |
| M3 | 正式引入单元 + 集成测试（覆盖率目标） |
| M4 | 正式引入 E2E |

### 8.1 M1 Smoke Test 范围

> 目标：建立测试基础设施和习惯，不追求覆盖率。
> **状态**：✅ vitest 配置已就绪，3 个 store 测试文件已创建。

| 测试对象 | 最低用例数 | 测什么 | 状态 |
|---------|-----------|--------|------|
| `api/client.ts` | 3 | 请求构造（URL 拼接）、错误映射（status → ApiError）、超时处理 | ⬜ 待开始 |
| `demoRoleStore` | 2 | 初始化（默认角色）、reset（恢复默认） | ✅ 已完成 |
| `taskStore` | 2 | 初始化（空列表）、fetchItems（mock 数据加载） | ✅ 已完成 |
| `workbenchRoleStore` | 2 | 初始化、reset | ✅ 已完成 |

**已安装依赖**：

```bash
npm i -D vitest @testing-library/react happy-dom @testing-library/jest-dom
```

**配置文件**：`vitest.config.ts` 已就绪

**测试文件位置**：
- `frontend/src/store/demoRoleStore.test.ts`
- `frontend/src/store/taskStore.test.ts`
- `frontend/src/store/workbenchRoleStore.test.ts`

---

## 修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-05-06 | 首版，测试金字塔 + 5 条 E2E 主旅程 + 工具链选型 + 覆盖率分阶段目标 |
| v1.1 | 2026-05-07 | 更新 M1 smoke test 状态：3 个 store 测试已完成，vitest 配置已就绪 |
