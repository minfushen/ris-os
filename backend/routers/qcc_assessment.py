"""
企查查风险评估 API 路由
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.qcc_models import (
    AssessVendorRiskRequest,
    VendorRiskAssessment,
    QccCompanyInfo,
    QccRiskInfo,
    QccOperationInfo
)
from services.qcc_mcp_client import QccMcpClient

router = APIRouter(prefix="/api/qcc", tags=["企查查风险评估"])

# 初始化 MCP 客户端
mcp_client = QccMcpClient()


@router.post(
    "/assess-vendor-risk",
    response_model=VendorRiskAssessment,
    summary="企业风险评估",
    description="""
    企业风险评估 Agent 核心接口

    - **company_name**: 企业名称或统一社会信用代码
    - **dimensions**: 可选，指定评估维度（默认9维度全量）

    返回：
    - 整体风险等级（CRITICAL/HIGH/MEDIUM/LOW）
    - 9 维度评估详情
    - 18 类风险清单
    - 证据链
    - 处置建议
    """
)
async def assess_vendor_risk(request: AssessVendorRiskRequest):
    """
    企业风险评估 Agent 核心接口

    执行 9 维度风险评估和 18 类风险排查
    """
    try:
        assessment = await mcp_client.assess_vendor_risk_risk_only(
            request.company_name,
            low_cost=False,
        )
        return assessment
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"企业风险评估失败: {str(e)}"
        )


@router.get(
    "/company/{company_name}",
    response_model=QccCompanyInfo,
    summary="获取企业工商信息",
    description="从企查查 MCP 获取企业工商信息（名称、法人、注册资本、经营范围等）"
)
async def get_company_info(
    company_name: str,
    search_key: Optional[str] = Query(None, description="搜索关键字（可选）")
):
    """
    获取企业工商信息

    - **company_name**: 企业名称或统一社会信用代码
    """
    try:
        return await mcp_client._get_company_info(search_key or company_name)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取企业工商信息失败: {str(e)}"
        )


@router.get(
    "/risk/{company_name}",
    response_model=QccRiskInfo,
    summary="获取企业风险信息",
    description="从企查查 MCP 获取企业风险信息（失信、被执行人、经营异常等18类风险）"
)
async def get_risk_info(company_name: str):
    """
    获取企业风险信息（18类）

    - **company_name**: 企业名称或统一社会信用代码

    返回：
    - 失信信息
    - 被执行人信息
    - 限制高消费
    - 经营异常
    - 严重违法
    - 注销备案
    - 股权冻结
    - 股权出质
    - 动产抵押
    - 欠税公告
    - 税务异常
    - 终本案件
    - 行政处罚
    - 环保处罚
    - 破产重整
    - 司法拍卖
    """
    try:
        result = await mcp_client._batch_get_risks(company_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取企业风险信息失败: {str(e)}"
        )


@router.get(
    "/operation/{company_name}",
    response_model=QccOperationInfo,
    summary="获取企业经营信息",
    description="从企查查 MCP 获取企业经营信息（资质证书、行政许可、招投标、信用评级等）"
)
async def get_operation_info(company_name: str):
    """
    获取企业经营信息

    - **company_name**: 企业名称或统一社会信用代码

    返回：
    - 资质证书
    - 行政许可
    - 招投标信息
    - 信用评级
    - 抽查检查记录
    - 融资记录
    """
    try:
        result = await mcp_client._get_operation_info(company_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取企业经营信息失败: {str(e)}"
        )


@router.get(
    "/health",
    summary="健康检查",
    description="检查企查查 MCP 服务连接状态"
)
async def health_check():
    """
    健康检查接口

    验证 MCP 客户端配置是否正确
    """
    try:
        # 尝试调用一个简单的 MCP 工具验证连接
        # 这里可以添加实际的连接检查逻辑
        return {
            "status": "healthy",
            "mcp_base_url": mcp_client.base_url,
            "api_key_configured": bool(mcp_client.api_key)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
