# 产品规范（Specification）

> WHAT 与 WHY — 用业务语言描述系统该具备什么能力、为什么。
> 任何 plan.md / tasks.md 中的工作都必须能在本文找到对应的"用例编号"。

---

## 1. 产品目标

### 1.1 一句话目标

让银行客户经理在**单一工作台**完成贷后预警发现 → 核查处置 → 策略实验的全链路作业，**AI 辅助风险评估与处置建议生成**，人工只做高价值判断与决策。

### 1.2 北极星指标

| 指标 | 当前值（Demo） | 目标 | 备注 |
|------|----------------|------|------|
| 预警处置时效（CRITICAL） | — | ≤ 4 小时 | 预警触发到处置完成 |
| 策略命中率 | 87.2%（Demo） | ≥ 80% | 命中预警的策略占比 |
| 企业风险评估响应时间 | < 3s（Demo） | < 3s（P95） | 企查查 MCP 耗时 |
| 数据引擎健康度 | 80%（4/5 数据源） | ≥ 95% | 已连接数据源 / 总数 |

---

## 2. 用户旅程

### 2.1 P1 - 客户经理（张明）日常

```
09:00 打开 / → 首页 → 看 KPI + 任务列表 → 锁定高优先预警
09:30 处理预警 → /monitor/dashboard → 预警探照灯
10:00 核查     → /risk/workbench → 认领 → 查看风险画像 → 核查
11:00 处置     → /risk/collection → M1/M2/M3 分池处置
14:00 入池     → /monitor/watchlist-upload → CSV 批量导入 → 风险评估
16:30 复盘     → /risk/inspection → 质检归档
```

### 2.2 P2 - 风控建模师（张三）日常

```
09:00 打开 / → 首页 → 看模型实验状态
10:00 特征工程 → /feature/studio → 查看 PSI 漂移
11:00 模型实验 → /strategy/model-factory → 训练/评估
14:00 决策流   → /strategy/decision-flow → 编排规则
16:00 提交审批 → /strategy/publish → 发起发布
```

### 2.3 P3 - 策略审批员（王五）日常

```
10:00 打开 / → 首页 → 看待审批列表
10:30 审批     → /strategy/publish → 看 Diff + 回测结果 → 通过/退回
14:00 回溯     → /strategy/backtest → 验证策略效果
```

---

## 3. 模块规范（按业务域划分）

> 编号规则：`SPEC-<模块代号>-<序号>`，PR 与 tasks 引用此编号。
> 
> 模块代号：HOME=首页、MON=监控、RISK=处置、STRAT=策略、AGENT=智能体、KNOW=知识、FEAT=特征数据、ARCH=架构
>
> **验收标准定位**：本节验收标准聚焦**工程契约**（接口签名、状态流转、数据格式、边界条件）。
> 业务验收（用户视角）见 [`prd.md`](./prd.md) 用户故事的 AC。两者不重复。

### 3.1 SPEC-HOME 首页与工作台

**业务定位**：角色差异化首页 + 任务分发台。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-HOME-1 | 按角色差异化展示首页内容 | 首页内容由 `demoRoleStore.role` 驱动；角色枚举值：`relationship_manager` / `risk_modeler` / `strategy_approver`；切换后 ≤ 1s 刷新 |
| SPEC-HOME-2 | 顶部角色切换器切换角色 | 切换触发 `demoRoleStore.setRole()`；首页内容、侧栏菜单（`PRIMARY_NAV` 按角色过滤）、DemoFlowNav 三处联动 |
| SPEC-HOME-3 | 贷后核心 KPI 卡片组（仅 RM） | 4 个卡片：逾期 M1+ 余额、新增预警数、超时未处置、策略命中率；数据接口 `GET /api/dashboard/kpi`；含趋势枚举（`up`/`down`/`stable`）+ 点击下钻路由跳转 |
| SPEC-HOME-4 | 任务列表展示与筛选 | 列表字段：企业名/状态/风险等级/主操作按钮；筛选参数：status/type/search；轮询间隔 ≤ 30s；数据接口 `GET /api/tasks` |
| SPEC-HOME-5 | 在贷资产驾驶舱 | 五级分类占比（饼图数据格式：`{category: string, amount: number, ratio: number}[]`）+ 客户经理资产分布 + 经理维度趋势折线 |
| SPEC-HOME-6 | 快捷入口 | 4 个入口路由：`/risk/workbench`（新建任务）/ `/monitor/watchlist-upload`（监控名单上传）/ `/monitor/reports`（报表中心）/ `/monitor/dashboard`（预警探照灯） |

### 3.2 SPEC-MON 预警监控

**业务定位**：贷后资产质量看板 + 预警信号发现 + 监控名单管理。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-MON-1 | 资产质量看板 | 数据接口 `GET /api/dashboard/asset-quality`；五级分类结构占比（饼图）+ 客户经理资产分布 + 经理维度趋势折线；支持时间窗口参数 |
| SPEC-MON-2 | 预警探照灯（大盘） | 数据接口 `GET /api/alerts`；列表字段：级别/企业/类型/触发时间/SLA；筛选参数：status/level/search；分页（page/pageSize）；SLA 超时字段 `slaDeadline < now` 标红 |
| SPEC-MON-3 | 监控名单 CSV 批量上传 | 接口 `POST /api/watchlist/upload`；流程：模板下载 → 上传解析（CSV 校验）→ 额度预检 → 批量风险评估（调用 Agent）→ 结果反馈（成功/失败统计） |
| SPEC-MON-4 | 策略效果追踪（O2O） | 策略上线后监控指标：命中率、误报率、覆盖率；数据来源：策略执行日志 |
| SPEC-MON-5 | 标注飞轮 | 预警标注接口 `POST /api/alerts/:id/label`；标注类型枚举：TP/FP/unknown；标注结果反馈至模型训练数据集 |
| SPEC-MON-6 | 报表中心（含监控报告库） | 报告 CRUD 接口；支持在线预览、PDF 下载、审计留档（操作人/时间戳） |

### 3.3 SPEC-RISK 处置闭环

**业务定位**：预警核查 → 催收作业 → 复盘质检的完整闭环。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-RISK-1 | 预警核查工作台（核心） | 数据接口 `GET /api/alerts`（列表）+ `GET /api/alerts/:id`（详情）；右侧抽屉字段：基本信息/风险画像/触发信号/处置建议；列表字段：级别/企业/类型/状态/时间/SLA/操作 |
| SPEC-RISK-2 | 预警状态流转 | 状态枚举：`pending | processing | verified | disposing | closed`；流转接口 `PATCH /api/alerts/:id/status`；非法跳态返回 400；异常路径：processing→pending（退回）、pending/processing→closed（超时自动关闭）；认领接口 `PATCH /api/alerts/:id/claim` 乐观锁防并发（409 Conflict） |
| SPEC-RISK-3 | 催收作业（M1/M2/M3 分池） | 数据接口 `GET /api/collection/:pool`；池枚举：M1/M2/M3；每池字段：逾期笔数/金额/处置进度；催收动作记录接口 `POST /api/collection/:pool/actions` |
| SPEC-RISK-4 | 复盘与质检 | 质检评分接口；抽检规则配置；问题归档（关联 alertId） |
| SPEC-RISK-5 | 与策略模块双向关联 | FP/RC 编号跨模块引用；引用接口 `GET /api/knowledge/:type/:id` |

### 3.4 SPEC-STRAT 策略与模型

**业务定位**：模型实验管理 + 决策流编排 + 仿真回溯 + 发布审批。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-STRAT-1 | 产品线策略集 | 数据接口 `GET /api/strategies`；按产品线分组；策略集 CRUD |
| SPEC-STRAT-2 | 预警规则配置 | 规则 CRUD 接口；规则字段：名称/条件/阈值/启用状态；启用/停用接口 `PATCH /api/rules/:id/toggle` |
| SPEC-STRAT-3 | 模型工厂（实验管理） | 实验 CRUD 接口；实验状态枚举：draft/training/evaluating/completed/failed；实验详情字段：特征列表/参数/评估指标 |
| SPEC-STRAT-4 | 模型版本库（Champion/Challenger） | 版本列表接口；版本对比指标：KS/PSI/AUC；Champion/Challenger 标记枚举；版本上线申请接口 |
| SPEC-STRAT-5 | 决策流编排 | 可视化节点编排；节点类型枚举：规则/模型/人工/分支；决策流 JSON 序列化存储 |
| SPEC-STRAT-6 | 仿真回溯 | 回测接口 `POST /api/backtest`；输入参数：时间范围/样本集/策略版本；输出：命中率/误报率/覆盖率；新旧策略对比表 |
| SPEC-STRAT-7 | 发布审批 | 审批接口 `POST /api/strategies/:id/approve`；审批操作枚举：approve/reject/return；策略 Diff 格式化；回测摘要关联 |

### 3.5 SPEC-AGENT 智能体

**业务定位**：底层能力 Agent，可被其他模块调用。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-AGENT-1 | 企业风险评估（9 维度 + 18 类风险） | 接口 `POST /api/agents/vendor-risk-assessment`；输入：企业名称；输出结构：`{overallRisk: string, dimensions: Dimension[], risks: Risk[], evidence: Evidence[], suggestions: Suggestion[]}`；响应 ≤ 3s（P95） |
| SPEC-AGENT-2 | 企查查 MCP 数据查询 | 4 个 GET 端点：`/api/qcc/business`（工商）/ `/api/qcc/risk`（风险）/ `/api/qcc/operation`（经营）/ `/api/qcc/health`（健康检查） |
| SPEC-AGENT-3 | Agent 协同调用 | 归因/处置 Agent 通过 `POST /api/agents/vendor-risk-assessment` 调用风险评估；调用链 ≤ 2 层；超时 5s 熔断 |
| SPEC-AGENT-4 | MCP 降级处理 | MCP 不可用时返回 `{status: "degraded", message: string}`；HTTP 状态码 200（非 5xx）；前端展示降级提示组件 |

### 3.6 SPEC-KNOW 知识沉淀

**业务定位**：话术库、案例库、风险模式库，跨模块引用。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-KNOW-1 | 催收话术库 | 数据接口 `GET /api/knowledge/scripts`；按场景分类（枚举：逾期提醒/催收沟通/法律告知）；支持搜索 |
| SPEC-KNOW-2 | 规则调优案例（RC） | RC 编号格式 `RC-YYYY-NNN`；CRUD 接口 `GET/POST /api/knowledge/rc`；可被策略模块通过编号引用 |
| SPEC-KNOW-3 | 风险模式库（FP） | FP 编号格式 `FP-YYYY-NNN`；CRUD 接口 `GET/POST /api/knowledge/fp`；可被预警模块通过编号引用 |

### 3.7 SPEC-FEAT 特征与数据

**业务定位**：特征工作室 + 数据源管理。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-FEAT-1 | 特征工作室 | 数据接口 `GET /api/features`；特征卡片字段：总数/可用/PSI 告警数；PSI 漂移矩阵数据格式：`{feature: string, psi: number}[][]`；特征列表字段：名称/来源/PSI/IV/状态 |
| SPEC-FEAT-2 | 数据源管理 | 变量字典接口 `GET /api/dictionary`；支持搜索和来源筛选；数据源列表接口 `GET /api/data-sources` |

### 3.8 SPEC-ARCH 系统架构

**业务定位**：系统集成架构展示 + 演示导航。

| 编号 | 用例 | 验收标准（工程契约） |
|------|------|---------|
| SPEC-ARCH-1 | 系统集成架构图 | 展示前后端/Agent/Mock/数据源的集成关系；组件可点击跳转到对应模块 |
| SPEC-ARCH-2 | 演示流程导航（DemoFlowNav） | 按角色分流演示路径；路由配置 `config/demoSession.ts`；分节跳转支持 query param `?section=` |

---

## 4. 跨模块共享规范

### 4.1 角色系统

```
角色枚举：RM (relationship_manager) | Risk Modeler (risk_modeler) | Strategy Approver (strategy_approver)

作用范围：首页内容、侧栏菜单、DemoFlowNav、KPI 可见性、操作权限
存储方式：demoRoleStore (Zustand + persist localStorage)
```

**不允许**：在页面组件中硬编码角色判断。必须从 `demoRoleStore` 读取。

### 4.2 预警状态机

```
正常流转：
  预警触发 → pending（待认领）
            → 认领 → processing（核查中）
                    → 提交核查结果 → verified（核查完成）
                                      ├→ 触发处置 → disposing（处置中）→ closed
                                      └→ 直接关闭 → closed

异常流转：
  processing → 退回 → pending（核查不通过，退回重新认领）
  pending → 超时自动关闭 → closed（SLA + 24h 无人认领）
  processing → 超时自动关闭 → closed（核查超时 SLA + 48h）
```

**状态枚举**：`pending | processing | verified | disposing | closed`

**不允许**：在 spec / plan / 代码中出现这 5 个之外的状态值。

**竞争条件处理**：
- 多人同时认领同一预警：接口 `PATCH /api/alerts/:id/claim` 使用乐观锁（`version` 字段）
- 认领失败返回 `409 Conflict`，前端提示"已被他人认领"并刷新列表
- 超时自动关闭由后端定时任务执行，前端通过轮询感知状态变更

### 4.3 风险等级

`low | medium | high | critical` —— 全站统一，色值统一（见 `src/styles/tokens.css`）。

### 4.4 角色化 UI 原则

- ✅ 首页内容按角色差异化（不是"一个平台所有人看同一套界面"）
- ✅ 顶部角色切换器全局可见
- ✅ 侧栏菜单按角色过滤（不是全部展示然后靠权限隐藏）
- ✅ KPI 卡片组仅 RM 可见

### 4.5 Agent 协同协议

- 企业风险评估 Agent 作为底层能力，暴露评估接口
- 其他 Agent（归因/处置）通过 API 调用获取风险评估结果
- 前端 Agent 页面独立路由（`/agents/:agent-id`）

---

## 5. 非功能性规范

| 维度 | 规范 | 测量方案 |
|------|------|---------|
| 性能 | 首屏可交互 ≤ 1.5 秒（本地 dev）；API 响应 < 500ms（P95，Agent < 3s） | M2 引入 Lighthouse CI（`npm run build` 后自动跑）；API 响应通过 `api/client.ts` 埋点 `performance.now()` 计时 |
| 兼容性 | Chrome ≥ 90 / Firefox ≥ 90 / Safari ≥ 14 | M4 Playwright 多浏览器矩阵 |
| 响应式 | 支持 1280 / 1440 / 1920 三个断点 | M3 人工验证清单 + M4 视觉回归（可选） |
| 可访问性 | 所有可点击元素有 hover / focus；趋势用图标+颜色双通道；色盲友好 | M1 5 态审计时同步检查；axe-core 集成（M3 可选） |
| 安全 | API Key 通过环境变量管理；企业敏感数据不记录日志；敏感字段（企业名称/法人/证件号）在日志中脱敏 | M2 安全审查 checklist；`utils/logger.ts` 内置脱敏函数 |
| Mock | MSW 拦截浏览器请求，后端离线可完整演示 | M2 引入 Mock 契约校验：mock 数据的 TypeScript 类型必须与 api/client 返回类型一致（编译时检查） |

---

## 6. 已知未实现 / 临时方案（透明清单）

| 项 | 现状 | 后续 |
|----|------|------|
| 用户登录认证 | 无（Demo 角色切换模拟） | M2 接真后端时纳入 |
| 真实数据源 | Mock（MSW + FastAPI 演示数据） | M3 引入 service 层适配真实 API |
| 多租户 / RBAC 权限 | Demo 角色模拟 | M2 评估 |
| 单元测试 | 无 | M3 引入 Vitest + RTL |
| E2E 测试 | 无 | M4 评估 Playwright |
| CI/CD | 无 | M2 引入 GitHub Actions |
| 错误监控 | 无 | M3 评估 Sentry |
| 移动端优化 | 响应式基础可用 | v1.1 深度优化 |

---

## 7. 范围边界（本规范不涵盖）

❌ 移动端原生 App
❌ 银行核心交易系统对接
❌ 贷款放款/还款/计息
❌ 智能体训练 / 微调（前端只消费推理结果）
❌ 多语言国际化
❌ 大屏数据可视化

---

## 修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-05-06 | 合并 3 个独立 Spec，引入用例编号体系（SPEC-XXX-NN），补充跨模块共享规范 |
