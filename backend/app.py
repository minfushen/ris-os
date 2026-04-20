"""风控管理 OS - API 路由"""

from __future__ import annotations

import shutil
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from models import (
    TaskResponse,
    TaskListItem,
    ReviewResult,
    AnalysisResult,
    TaskEvent,
)
from store import (
    create_task,
    get_result,
    get_task,
    get_task_events,
    init_db,
    list_tasks,
    set_task_status,
    upsert_result,
)
from services.review import process_review
from services.analysis import process_analysis
from scenario_post_loan import router as post_loan_scenario_router

UPLOAD_ROOT = Path(__file__).resolve().parent / "uploads"


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    init_db()
    yield


app = FastAPI(title="风控管理 OS", version="1.0.0", lifespan=lifespan)

app.include_router(post_loan_scenario_router)
# 网关常只转发 /api/*：与无前缀路由并存，避免 404
app.include_router(post_loan_scenario_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ 健康检查 ============

@app.get("/health")
def health() -> dict:
    return {"ok": True}


# ============ 信审任务 ============

@app.post("/tasks/review", response_model=TaskResponse)
async def create_review_task(
    title: str = Form(...),
    description: str = Form(default=""),
    scenario_node: str = Form(default="credit"),
    files: list[UploadFile] = File(default=[]),
) -> TaskResponse:
    """创建信审任务"""
    if scenario_node not in ("credit", "draw", "post_loan"):
        raise HTTPException(status_code=422, detail="scenario_node 必须为 credit/draw/post_loan")

    task = create_task("review", title, description, scenario_node)
    task_id = task["task_id"]

    # 保存上传文件
    if files:
        task_dir = UPLOAD_ROOT / task_id
        task_dir.mkdir(parents=True, exist_ok=True)
        for f in files:
            dest = task_dir / f.filename
            with dest.open("wb") as out:
                shutil.copyfileobj(f.file, out)

    # 异步处理（当前为同步）
    _process_review_task(task_id, description, scenario_node)

    return TaskResponse(task_id=task_id, task_type="review", status=task["status"])


def _process_review_task(task_id: str, description: str, scenario_node: str) -> None:
    """处理信审任务"""
    set_task_status(task_id, "processing", event_type="TASK_PROCESSING")

    try:
        summary, result = process_review(task_id, description, scenario_node)
        upsert_result(task_id, summary, result)
        set_task_status(task_id, "completed", event_type="TASK_COMPLETED")
    except Exception as exc:  # noqa: BLE001
        set_task_status(
            task_id,
            "failed",
            error_message=str(exc),
            event_type="TASK_FAILED",
            payload={"error": str(exc)},
        )


# ============ 归因分析任务 ============

@app.post("/tasks/analysis", response_model=TaskResponse)
def create_analysis_task(
    title: str = Form(...),
    description: str = Form(...),
    scenario_node: str = Form(default="credit"),
) -> TaskResponse:
    """创建归因分析任务"""
    if len(description) < 10:
        raise HTTPException(status_code=422, detail="描述至少 10 个字符")
    if scenario_node not in ("credit", "draw", "post_loan"):
        raise HTTPException(status_code=422, detail="scenario_node 必须为 credit/draw/post_loan")

    task = create_task("analysis", title, description, scenario_node)
    task_id = task["task_id"]

    # 异步处理（当前为同步）
    _process_analysis_task(task_id, description, scenario_node)

    return TaskResponse(task_id=task_id, task_type="analysis", status=task["status"])


def _process_analysis_task(task_id: str, description: str, scenario_node: str) -> None:
    """处理分析任务"""
    set_task_status(task_id, "processing", event_type="TASK_PROCESSING")

    try:
        summary, result = process_analysis(description, scenario_node)
        upsert_result(task_id, summary, result)
        set_task_status(task_id, "completed", event_type="TASK_COMPLETED")
    except Exception as exc:  # noqa: BLE001
        set_task_status(
            task_id,
            "failed",
            error_message=str(exc),
            event_type="TASK_FAILED",
            payload={"error": str(exc)},
        )


# ============ 任务列表 ============

@app.get("/tasks")
def get_tasks(
    task_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
) -> list[TaskListItem]:
    """查询任务列表"""
    tasks = list_tasks(task_type, status, limit)
    return [
        TaskListItem(
            task_id=t["task_id"],
            task_type=t["task_type"],
            status=t["status"],
            title=t["title"],
            scenario_node=t["scenario_node"],
            created_at=t["created_at"],
            updated_at=t["updated_at"],
            summary=t.get("summary"),
        )
        for t in tasks
    ]


# ============ 任务详情 ============

@app.get("/tasks/{task_id}")
def get_task_detail(task_id: str) -> dict:
    """获取任务详情"""
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    result = get_result(task_id)
    events = get_task_events(task_id)

    return {
        "task": task,
        "result": result,
        "events": events,
    }


@app.get("/tasks/{task_id}/result")
def get_task_result(task_id: str) -> dict:
    """获取任务结果"""
    result = get_result(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="结果不存在")
    return result


@app.get("/tasks/{task_id}/events")
def get_events(task_id: str) -> list[TaskEvent]:
    """获取任务事件"""
    events = get_task_events(task_id)
    return [
        TaskEvent(
            id=e["id"],
            task_id=e["task_id"],
            event_type=e["event_type"],
            payload=e["payload"],
            created_at=e["created_at"],
        )
        for e in events
    ]
