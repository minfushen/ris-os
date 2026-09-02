"""
预警归因 Agent 路由：输入企业名称，基于元典司法 MCP 数据生成归因结论。
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.huayu_mcp_client import HuayuMcpClient
from services.attribution_agent import attribute_company

router = APIRouter(prefix="/api/agents", tags=["智能体协同"])

huayu_client = HuayuMcpClient()


class AttributionRequest(BaseModel):
    company_name: str


@router.post("/attribution")
async def attribute(payload: AttributionRequest):
    name = (payload.company_name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="company_name 不能为空")
    try:
        return await attribute_company(huayu_client, name)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/attribution/health")
async def attribution_health():
    """归因 Agent 数据源健康检查（不消耗业务积分）。"""
    return {"configured": huayu_client.configured, "provider": "huayu-yuandian-mcp"}
