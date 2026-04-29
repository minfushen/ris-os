# RIS OS · 风控管理 OS

[![Repo](https://img.shields.io/badge/GitHub-ris--os-24292e?logo=github)](https://github.com/minfushen/ris-os)
[![Branch](https://img.shields.io/badge/branch-scenario%2Fpost--loan-0969da)](https://github.com/minfushen/ris-os/tree/scenario/post-loan)

面向信贷全生命周期的 **风控工作台（Risk Intelligence System OS）** 前后端原型。本仓库 **`scenario/post-loan`（贷后场景）** 分支在导航、页面与接口上对齐 **贷后预警与处置**；产品展示名为 **贷后风险智能运营平台**（副标题：预警监控 · 处置闭环 · 策略仿真 · 智能体协同）。前端为「浅色金融玻璃台」骨架（Browser 路径路由），后端为 FastAPI 最小可运行 API，便于本地演示与二次开发。

**远程仓库：** [https://github.com/minfushen/ris-os](https://github.com/minfushen/ris-os)

---

## 贷后场景分支说明（`scenario/post-loan`）

| 项 | 说明 |
|----|------|
| **分支名** | `scenario/post-loan` |
| **与主线** | 自 `main` 同一起点延伸，可独立演进；合并回 `main` 前建议走 PR 评审 |
| **前端入口** | Browser 路径路由：`http://localhost:5173/`（例：`/monitor/dashboard`、`/risk/workbench`、`/reports`） |
| **后端默认** | `http://127.0.0.1:8000`（与 `frontend/.env.development` 中 `VITE_API_BASE_URL` 一致） |
| **贷后 REST** | 前端调用 **`/api/scenario/post-loan/*`**（后端同时挂载无前缀 `/scenario/post-loan/*`，便于兼容旧网关） |

拉取并切换到本分支：

```bash
git fetch origin
git switch scenario/post-loan
```

---

## 功能概览（贷后分支）

| 模块 | 说明 |
|------|------|
| **指挥台首页** | **按角色差异化展示**（客户经理/风控建模师/策略审批员），贷后核心 KPI、处置队列、预警探照灯与快捷入口；**在贷资产驾驶舱**（状态结构占比、客户经理资产分布、经理维度趋势） |
| **角色化演示系统** | **顶部角色切换器**（张明·客户经理 / 张三·风控建模师 / 王五·策略审批员），**侧栏菜单按角色过滤**，**DemoFlowNav 按角色分流**，首页内容联动切换 |
| **预警监控** | 资产质量看板、预警探照灯、策略效果追踪、**报表中心**（含**监控报告库** Tab）、标注飞轮 |
| **名单入池与建档** | 新增**监控名单上传**，支持 CSV 模板下载、批量导入、入池前额度预检、批量风险评估 |
| **处置闭环** | 预警核查工作台（含**监控报告**生成/预览/下载/审计留档）、催收作业（M1/M2/M3 分池）、复盘与质检，**与策略模块双向关联**（FP/RC 引用体系） |
| **策略与模型** | 产品线策略集、规则配置、**模型工厂**（实验管理）、**模型版本库**（Champion/Challenger）、**决策流编排**、**仿真回溯**、发布审批与护栏 |
| **知识沉淀** | 话术库、规则调优案例、风险模式库，**FP（欺诈模式）/ RC（调优案例）跨模块引用** |
| **特征与数据** | **贷后特征工作室**、**数据源管理**，数据来自 **`GET /api/scenario/post-loan/*`** |
| **统一 Mock 层** | MSW (Mock Service Worker) 浏览器端拦截，18 个散落 mock 文件统一收敛为单一数据源，后端离线可完整演示 |
| **任务流（通用）** | `POST /tasks/analysis`、`POST /tasks/review`、`GET /tasks` 等 |

更多接口见 **[backend/README.md](./backend/README.md)**。

---

## Git 分支（场景延伸）

| 场景 | 分支名 |
|------|--------|
| 贷前 | `scenario/pre-loan` |
| 贷中 | `scenario/in-loan` |
| **贷后** | **`scenario/post-loan`**（当前文档默认描述对象） |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18、TypeScript、Vite 6、React Router 6、Ant Design 5、Tailwind CSS v4、Zustand |
| 后端 | Python 3、FastAPI、SQLite（开发） |

---

## 仓库结构

```text
.
├── backend/              FastAPI：任务 API + 贷后场景 REST（scenario_post_loan）
├── frontend/             Vite + React 工作台与模块路由
├── docs/                 信息架构清单、视觉与规格说明等
├── sampledata/           示例数据（含 `post-loan/watchlist-demo-2rows.csv`）
└── 线框图原型/            产品方向说明
```

---

## 环境要求

- **Node.js** ≥ 18（推荐 20+）
- **Python** ≥ 3.10
- **npm** 或 **pnpm** / **yarn**（文档以 npm 为例）

---

## 快速开始

### 1. 克隆并切换到贷后分支

```bash
git clone https://github.com/minfushen/ris-os.git
cd ris-os
git fetch origin
git switch scenario/post-loan
```

若使用 SSH：

```bash
git clone git@github.com:minfushen/ris-os.git
cd ris-os && git switch scenario/post-loan
```

### 2. 启动后端（默认端口 8000）

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

**验证贷后接口：**

```bash
curl -s http://127.0.0.1:8000/api/scenario/post-loan/feature-studio | head -c 200
```

### 3. 启动前端（默认 Vite 5173）

```bash
cd frontend
npm install
npm run dev
```

浏览器访问：**http://localhost:5173/**（路径路由，直接打开子路径亦可）

### 4. 前端环境变量

- 开发环境使用 **`frontend/.env.development`**，默认 `VITE_API_BASE_URL=http://127.0.0.1:8000`。
- **不要将 `VITE_API_BASE_URL` 设为空字符串**：否则请求会发到 Vite 同源路径，易返回 404（界面提示「资源不存在」）。
- Vite 已配置 **`/api` → 127.0.0.1:8000** 的开发代理；若改为同源相对路径访问 `/api`，开发时亦可转发到后端。

---

## 常用脚本（前端）

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run test` | Vitest 单测 |
| `npm run preview` | 预览构建产物 |

---

## 🆕 企业风险评估 Agent（企查查 MCP 集成）

### 功能特性

- ✅ **9 维度风险评估**：基础 6 维 + 供应链特有 3 维
- ✅ **18 类风险排查**：CRITICAL/HIGH/MEDIUM/LOW 四级分类
- ✅ **结构化证据链**：数据来源、更新时间、可信度
- ✅ **处置建议生成**：响应时间、责任人、行动清单
- ✅ **企查查 MCP 实时数据**：评估链路统一走 `qcc-risk` 服务
- ✅ **动态进度展示**：实时推理过程可视化

### 访问地址

```
http://localhost:5173/agents/vendor-risk-assessment
```

### API 端点

```
POST /api/qcc/assess-vendor-risk    # 企业风险评估
GET  /api/qcc/company/{name}        # 获取企业工商信息
GET  /api/qcc/risk/{name}           # 获取企业风险信息
GET  /api/qcc/operation/{name}      # 获取企业经营信息
GET  /api/qcc/health                # 健康检查
```

### 配置要求

在 `backend/.env` 文件中配置企查查 API Key：

```bash
QCC_MCP_API_KEY=your_api_key_here
QCC_MCP_BASE_URL=https://agent.qcc.com/mcp
```

### 设计文档

- [PRD-企业风险评估Agent.md](./docs/prd/PRD-企业风险评估Agent.md)
- [架构设计-企业风险评估Agent.md](./docs/architecture/架构设计-企业风险评估Agent.md)
- [技术方案-企查查MCP集成.md](./docs/technical/技术方案-企查查MCP集成.md)
- [API文档-企业风险评估.md](./docs/api/API文档-企业风险评估.md)
- [用户手册-企业风险评估Agent.md](./docs/user-guide/用户手册-企业风险评估Agent.md)

---

## 文档索引

1. [后端 API 说明（含贷后 REST）](./backend/README.md)
2. [线框图原型](./线框图原型)
3. [首页信息架构改版建议清单](./docs/首页信息架构改版建议清单.md)
4. [新首页 / 全局导航骨架视觉设计方案](./docs/superpowers/specs/2026-04-17-home-navigation-tailwind-glass-design.md)（若路径存在）

---

## 推送到本仓库（维护者）

在已配置 [GitHub 认证](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories) 的机器上：

```bash
git remote add origin https://github.com/minfushen/ris-os.git
git push -u origin scenario/post-loan
```

若远程已初始化且需强推（慎用）：

```bash
git push -u origin scenario/post-loan --force
```

---

## 说明

- 后端任务处理为**同步**最小闭环，无独立 worker；生产化需自行扩展队列、鉴权与审计。
- 贷后「特征工作室」「数据源管理」页依赖上述 **REST**；任务列表等仍使用原有 `/tasks` 接口。若后端未启动或端口不一致，前端会提示连接错误。
- 部分页面仍为演示数据或占位交互，便于产品走查与对接真实网关。

---

## License

代码默认由仓库所有者保留权利；如需开源协议请自行补充 `LICENSE` 文件。
