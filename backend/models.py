"""风控管理 OS - 数据模型"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional, List

from pydantic import BaseModel, Field


# ============ 枚举类型 ============

TaskType = Literal["review", "analysis"]
TaskStatus = Literal["pending", "processing", "completed", "failed"]
ScenarioNode = Literal["credit", "draw", "post_loan"]


# ============ 请求模型 ============

class CreateReviewTaskRequest(BaseModel):
    """创建信审任务"""
    title: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=1000)
    scenario_node: ScenarioNode = "credit"


class CreateAnalysisTaskRequest(BaseModel):
    """创建归因分析任务"""
    title: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10, max_length=2000)
    scenario_node: ScenarioNode = "credit"


# ============ 响应模型 ============

class TaskResponse(BaseModel):
    """任务创建响应"""
    task_id: str
    task_type: TaskType
    status: TaskStatus


class TaskListItem(BaseModel):
    """任务列表项"""
    task_id: str
    task_type: TaskType
    status: TaskStatus
    title: str
    scenario_node: ScenarioNode
    created_at: datetime
    updated_at: datetime
    summary: Optional[str] = None


class ReviewResult(BaseModel):
    """信审结果"""
    task_id: str
    summary: str
    file_count: int
    missing_items: List[dict]
    risk_flags: List[dict]
    review_sheet: dict
    key_findings: List[str]
    next_actions: List[str]


class AnalysisResult(BaseModel):
    """归因分析结果"""
    task_id: str
    summary: str
    metrics: dict[str, Any]
    charts: List[dict]
    key_findings: List[str]
    next_actions: List[str]
    export_ref: Optional[str] = None


class TaskEvent(BaseModel):
    """任务事件"""
    id: int
    task_id: str
    event_type: str
    payload: dict[str, Any]
    created_at: datetime
