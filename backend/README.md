# Backend API

当前前端原型使用的最小后端，技术栈为 **FastAPI + SQLite**。

## 实现状态

### 通用任务流

1. 创建分析任务（`POST /tasks/analysis`）
2. 创建信审任务（`POST /tasks/review`）
3. 查询任务列表、详情、结果、事件（`GET /tasks`、`GET /tasks/{id}` 等）

任务处理为**同步**最小闭环；无独立 `worker` 与异步队列。

### 贷后场景 REST（`scenario_post_loan` 模块）

与 **`scenario/post-loan`** 前端分支配套，资源路径在应用上 **双挂载**（避免网关只转发 `/api` 时出现 404）：

| 方法 | 路径（推荐，前端默认） | 兼容路径（无前缀 `/api`） |
|------|------------------------|---------------------------|
| `GET` | `/api/scenario/post-loan/feature-studio` | `/scenario/post-loan/feature-studio` |
| `GET` | `/api/scenario/post-loan/data-dictionary/variables` | `/scenario/post-loan/data-dictionary/variables` |
| `GET` | `/api/scenario/post-loan/data-dictionary/sources` | `/scenario/post-loan/data-dictionary/sources` |

**变量字典查询参数（`GET .../variables`）：**

| 参数 | 说明 |
|------|------|
| `q` | 变量名 / 中文名 / ID 模糊匹配 |
| `source_code` | `core` \| `collection` \| `enterprise_credit` \| `court` \| `golden_tax_3` |
| `refresh` | `实时` \| `T+1` \| `月更` \| `按需` |

**`GET .../feature-studio` 响应概要：** `overview_cards`、`psi_by_product`、`features`（含 `psi_biz_loan`、`psi_tax_easy_loan`、`drift_status`）、`psi_alarm_defaults` 等（JSON 字段为 snake_case，与 Pydantic 一致）。

## 启动

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

也可直接 `python main.py`（同样默认监听 `127.0.0.1:8000`，与前端 `VITE_API_BASE_URL` 对齐）。

## 主要接口（任务流）

### 健康检查

```bash
GET /health
```

### 创建分析任务

```bash
POST /tasks/analysis
```

表单字段：`title`、`description`、`scenario_node`（`credit` \| `draw` \| `post_loan`）

### 创建信审任务

```bash
POST /tasks/review
```

表单字段：`title`、`description`、`scenario_node`、`files`（可选）

### 查询任务

```bash
GET /tasks
GET /tasks/{task_id}
GET /tasks/{task_id}/result
GET /tasks/{task_id}/events
```

## 贷后接口快速验证

```bash
curl -s http://127.0.0.1:8000/api/scenario/post-loan/feature-studio | python3 -m json.tool | head -40

curl -s "http://127.0.0.1:8000/api/scenario/post-loan/data-dictionary/variables?source_code=core"
curl -s http://127.0.0.1:8000/api/scenario/post-loan/data-dictionary/sources
```

## 说明

1. 数据库文件默认是 `backend/dev.db`
2. 上传文件默认保存在 `backend/uploads/`
3. 如需重置数据，可以删除 `dev.db` 和 `uploads/` 后重新启动

## 任务流快速验证（与主线相同）

```bash
curl -s -X POST http://127.0.0.1:8000/tasks/analysis \
  -F 'title=授信通过率异动分析' \
  -F 'description=分析本周授信通过率相对上周的变化，并按渠道拆解' \
  -F 'scenario_node=credit'

curl -s http://127.0.0.1:8000/tasks
```
