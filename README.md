# RIS OS · 风控管理 OS

[![Repo](https://img.shields.io/badge/GitHub-ris--os-24292e?logo=github)](https://github.com/minfushen/ris-os)

面向信贷 / 反欺诈场景的 **风控工作台（Risk Intelligence System OS）** 前后端原型：态势总览 → 异动与待办 → 处置闭环。前端为「浅色金融玻璃台」工作台骨架，后端为最小可运行 API，便于本地演示与二次开发。

**远程仓库：** [https://github.com/minfushen/ris-os](https://github.com/minfushen/ris-os)

---

## 功能概览

| 模块 | 说明 |
|------|------|
| **工作台** | **指挥台首页**：当班简报条、异动探照灯（认领排他 / 影响量化 / SLA / 推荐动作与展开佐证）、核心指标分析师卡、风险工单池、策略与复核摘要、快捷入口；筛选与 URL / session 同步，顶栏与导航回首页可恢复状态 |
| **监控与分析** | 战情看板、O2O、标注飞轮、报表等页面骨架 |
| **策略管控** | 策略集、规则引擎、回测、发布等页面骨架 |
| **风险核查** | 团伙欺诈、专家抽检等页面骨架 |
| **特征工程** | 特征工作室占位 |
| **数据资产** | 数据字典占位 |

---

## Git 分支（场景延伸）

在 `main` 主线稳定迭代的基础上，已建立与 **贷前 / 贷中 / 贷后** 对齐的长期分支（与当时 `main` 同一起点，可各自演进）：

| 场景 | 分支名 |
|------|--------|
| 贷前 | `scenario/pre-loan` |
| 贷中 | `scenario/in-loan` |
| 贷后 | `scenario/post-loan` |

```bash
git fetch origin
git switch scenario/post-loan   # 示例：开发贷后
```

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
├── backend/          FastAPI 最小 API（任务创建、列表、详情）
├── frontend/       Vite + React 工作台与模块路由
├── docs/             信息架构清单、视觉与规格说明等
├── sampledata/       示例数据
└── 线框图原型/        产品方向说明
```

---

## 环境要求

- **Node.js** ≥ 18（推荐 20+）
- **Python** ≥ 3.10
- **npm** 或 **pnpm** / **yarn**（文档以 npm 为例）

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/minfushen/ris-os.git
cd ris-os
```

若使用 SSH：

```bash
git clone git@github.com:minfushen/ris-os.git
cd ris-os
```

### 2. 启动后端（默认端口 8000）

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### 3. 启动前端（默认 Vite 5173）

```bash
cd frontend
npm install
npm run dev
```

浏览器访问：**http://localhost:5173/#/**（Hash 路由）

### 4. 前端环境变量

开发环境可使用仓库内 `frontend/.env.development`（已指向 `http://127.0.0.1:8000`）。若后端端口变更，请同步修改 `VITE_API_BASE_URL`。

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

1. [线框图原型](./线框图原型)
2. [首页信息架构改版建议清单](./docs/首页信息架构改版建议清单.md)
3. [新首页 / 全局导航骨架视觉设计方案](./docs/superpowers/specs/2026-04-17-home-navigation-tailwind-glass-design.md)（若路径存在）

---

## 推送到本仓库（维护者）

在已配置 [GitHub 认证](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories) 的机器上：

```bash
git remote add origin https://github.com/minfushen/ris-os.git
git branch -M main
git push -u origin main
```

若远程已初始化且需强推（慎用）：

```bash
git push -u origin main --force
```

---

## 说明

- 后端为**同步执行**的最小闭环，无独立 worker；生产化需自行扩展队列、鉴权与审计。
- 部分页面为占位与演示数据；接口失败时前端会降级展示演示列表并提示检查 API。

---

## License

代码默认由仓库所有者保留权利；如需开源协议请自行补充 `LICENSE` 文件。
