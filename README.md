# RIS OS · 风控管理 OS

[![Repo](https://img.shields.io/badge/GitHub-ris--os-24292e?logo=github)](https://github.com/minfushen/ris-os)
[![Branch](https://img.shields.io/badge/branch-scenario%2Fpost--loan-0969da)](https://github.com/minfushen/ris-os/tree/scenario/post-loan)

面向信贷全生命周期的 **风控工作台（Risk Intelligence System OS）** 前后端原型。本仓库 **`scenario/post-loan`（贷后场景）** 分支在导航、页面与接口上对齐 **贷后预警与处置**：资产态势、策略追踪、核查工作台、催收作业、特征与数据 REST 等；前端为「浅色金融玻璃台」骨架，后端为 FastAPI 最小可运行 API，便于本地演示与二次开发。

**远程仓库：** [https://github.com/minfushen/ris-os](https://github.com/minfushen/ris-os)

---

## 贷后场景分支说明（`scenario/post-loan`）

| 项 | 说明 |
|----|------|
| **分支名** | `scenario/post-loan` |
| **与主线** | 自 `main` 同一起点延伸，可独立演进；合并回 `main` 前建议走 PR 评审 |
| **前端入口** | Hash 路由：`http://localhost:5173/#/` |
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
| **指挥台首页** | 贷后核心 KPI（M1+、新增预警、逾期工单等）、处置队列、预警探照灯与快捷入口；任务列表仍对接 `/tasks` |
| **资产监控** | 资产质量看板、预警探照灯（原战情看板口径调整）、策略效果追踪、报表中心、标注飞轮（URL 保留） |
| **预警策略** | 产品线策略集、规则配置（含行业阈值矩阵示意）、规则仿真回测、发布审批与护栏 |
| **案件处置** | 预警核查工作台、催收作业管理（M1/M2/M3 分池）、复盘与质检 |
| **知识沉淀** | 话术库、规则调优案例、风险模式库 |
| **特征与数据** | **贷后特征工作室**（还款/催收反馈特征、分产品线 PSI、阈值告警）；**数据源管理**（企信/司法/金税等 + 刷新频率元数据），数据来自 **`GET /api/scenario/post-loan/*`** |
| **任务流（通用）** | 创建/查询分析任务、信审任务（`POST /tasks/analysis`、`POST /tasks/review`、`GET /tasks` 等） |

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
├── sampledata/           示例数据
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

浏览器访问：**http://localhost:5173/#/**（Hash 路由）

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
