"""
预警管理 API 路由
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from services.enterprise_hub import EnterpriseDataHub

router = APIRouter(prefix="/api/alerts", tags=["预警管理"])

# 初始化企业数据中心
hub = EnterpriseDataHub()


@router.get("/")
def get_alert_list(
    status: Optional[str] = Query(None, description="预警状态"),
    level: Optional[str] = Query(None, description="预警等级"),
    limit: int = Query(50, ge=1, le=100)
):
    """
    获取预警列表

    支持按状态和等级筛选
    """
    alerts = hub.get_alert_list(status, level, limit)
    return alerts


@router.get("/loan-overdue")
def get_loan_overdue_alert_candidates(
    limit: int = Query(20, ge=1, le=200),
):
    """获取逾期贷款预警候选（真实数据兜底）。"""
    return hub.get_overdue_loan_alert_candidates(limit)


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int):
    """
    解决预警

    将预警状态更新为 resolved
    """
    try:
        alert = hub.resolve_alert(alert_id)
        return alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))