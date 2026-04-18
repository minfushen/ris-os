# Backend API

这是当前前端原型使用的最小后端，技术栈为 `FastAPI + SQLite`。

当前实现状态：

1. 支持创建分析任务
2. 支持创建信审任务
3. 支持查询任务列表、详情、结果、事件
4. 任务处理为同步最小闭环

当前没有独立 `worker` 进程，也没有异步任务队列。

## 启动

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## 主要接口

### 健康检查

```bash
GET /health
```

### 创建分析任务

```bash
POST /tasks/analysis
```

表单字段：

1. `title`
2. `description`
3. `scenario_node`

### 创建信审任务

```bash
POST /tasks/review
```

表单字段：

1. `title`
2. `description`
3. `scenario_node`
4. `files`

### 查询任务

```bash
GET /tasks
GET /tasks/{task_id}
GET /tasks/{task_id}/result
GET /tasks/{task_id}/events
```

## 说明

1. 数据库文件默认是 `backend/dev.db`
2. 上传文件默认保存在 `backend/uploads/`
3. 如需重置数据，可以删除 `dev.db` 和 `uploads/` 后重新启动

## 快速验证

```bash
curl -s -X POST http://127.0.0.1:8000/tasks/analysis \
  -F 'title=授信通过率异动分析' \
  -F 'description=分析本周授信通过率相对上周的变化，并按渠道拆解' \
  -F 'scenario_node=credit'

curl -s http://127.0.0.1:8000/tasks
```
