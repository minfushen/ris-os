"""
大盘统计 API 路由
"""

from fastapi import APIRouter
from services.enterprise_hub import EnterpriseDataHub

router = APIRouter(prefix="/api/dashboard", tags=["大盘统计"])

# 初始化企业数据中心
hub = EnterpriseDataHub()


@router.get("/stats")
def get_dashboard_stats():
    """
    获取大盘统计数据

    包括企业总数、风险分布、预警统计等
    """
    stats = hub.get_dashboard_stats()
    return stats
