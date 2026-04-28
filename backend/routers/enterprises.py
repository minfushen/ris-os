"""
企业管理 API 路由
"""

import csv
import io

from fastapi import APIRouter, HTTPException, Query
from fastapi import File, Form, UploadFile
from typing import Optional
from pydantic import BaseModel

from services.enterprise_hub import EnterpriseDataHub

router = APIRouter(prefix="/api/enterprises", tags=["企业管理"])

# 初始化企业数据中心
hub = EnterpriseDataHub()


class RegisterEnterpriseRequest(BaseModel):
    """企业注册请求"""
    company_name: str


class CreateCustomerRequest(BaseModel):
    """创建客户请求"""
    enterprise_id: int
    customer_name: str
    customer_type: Optional[str] = None
    loan_amount: Optional[float] = None
    loan_status: Optional[str] = None


class BatchOnboardWatchlistRequest(BaseModel):
    """批量入池监控名单请求"""
    company_names: list[str]
    mode: str = "low_cost"  # low_cost | full


class WatchlistPrecheckRequest(BaseModel):
    """批量入池前额度预检请求"""
    mode: str = "low_cost"
    planned_count: int = 0


@router.post("/register")
async def register_enterprise(request: RegisterEnterpriseRequest):
    """
    注册企业（仅本地建档，不调用外部 MCP）
    """
    try:
        enterprise = await hub.register_enterprise(request.company_name)
        return enterprise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlist/batch-onboard")
async def batch_onboard_watchlist(request: BatchOnboardWatchlistRequest):
    """
    批量上传监控名单并执行评估：
    1) 注册企业（如不存在）
    2) 调用企查查 MCP 评估风险
    3) HIGH/CRITICAL 自动进入预警队列
    """
    if not request.company_names:
        raise HTTPException(status_code=400, detail="company_names 不能为空")
    if request.mode not in {"low_cost", "full"}:
        raise HTTPException(status_code=400, detail="mode 必须为 low_cost 或 full")
    try:
        return await hub.onboard_watchlist_batch(
            request.company_names,
            mode=request.mode,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlist/precheck")
async def watchlist_precheck(request: WatchlistPrecheckRequest):
    """批量入池前额度预检。"""
    if request.mode not in {"low_cost", "full"}:
        raise HTTPException(status_code=400, detail="mode 必须为 low_cost 或 full")
    try:
        return await hub.precheck_watchlist_capacity(
            mode=request.mode,
            planned_count=request.planned_count,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlist/import-csv")
async def import_watchlist_csv(
    file: UploadFile = File(...),
    mode: str = Form("low_cost"),
):
    """
    CSV 导入企业档案并自动触发 qcc-risk 批量评估。

    必填列：company_name
    推荐列：credit_code, legal_person, registered_capital, paid_in_capital,
            established_date, registration_status, registered_address,
            actual_address, phone/phone_number, industry_code/industry_category,
            company_type, major_shareholders, shareholding_ratio,
            ultimate_beneficiary, email, website, employee_count,
            tax_credit_level, annual_revenue, is_dishonest, court_cases,
            business_scope
    关联列（可选）：shareholder_name, shareholder_type, contribution_amount,
                  contribution_ratio, loan_account_no, loan_amount, credit_limit,
                  loan_balance, interest_rate, start_date, end_date,
                  status/loan_status, manager_id
    """
    if mode not in {"low_cost", "full"}:
        raise HTTPException(status_code=400, detail="mode 必须为 low_cost 或 full")
    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="仅支持 CSV 文件")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="CSV 文件为空")

    text = raw.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or "company_name" not in reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV 表头必须包含 company_name")

    rows = [dict(row) for row in reader]
    if not rows:
        raise HTTPException(status_code=400, detail="CSV 无有效数据行")

    try:
        return await hub.import_watchlist_csv_rows(rows, mode=mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{enterprise_id}")
def get_enterprise(enterprise_id: int):
    """获取企业档案"""
    enterprise = hub.get_enterprise(enterprise_id)
    if not enterprise:
        raise HTTPException(status_code=404, detail="企业不存在")
    return enterprise


@router.get("/")
def list_enterprises(limit: int = Query(50, ge=1, le=100)):
    """获取企业列表"""
    enterprises = hub.list_enterprises(limit)
    return enterprises


@router.post("/{enterprise_id}/assess")
async def assess_enterprise_risk(enterprise_id: int):
    """
    评估企业风险

    调用 qcc-risk 风险评估并触发预警（如果需要）
    """
    try:
        # 评估风险
        assessment = await hub.assess_risk(enterprise_id, risk_only=True)

        # 检查并触发预警
        alert = await hub.check_and_trigger_alerts(
            enterprise_id,
            assessment
        )

        return {
            "assessment": assessment.model_dump(),
            "alert": alert
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{enterprise_id}/assessments/latest")
def get_latest_assessment(enterprise_id: int):
    """获取企业最新的风险评估"""
    assessment = hub.get_latest_assessment(enterprise_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="暂无风险评估记录")
    return assessment


@router.get("/{enterprise_id}/assessments/history")
def get_assessment_history(
    enterprise_id: int,
    limit: int = Query(10, ge=1, le=50)
):
    """获取企业风险评估历史"""
    assessments = hub.get_assessment_history(enterprise_id, limit)
    return assessments


@router.post("/customers")
def create_customer(request: CreateCustomerRequest):
    """创建客户关联"""
    try:
        customer = hub.create_customer(
            request.enterprise_id,
            request.customer_name,
            request.customer_type,
            request.loan_amount,
            request.loan_status
        )
        return customer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{enterprise_id}/customers")
def get_enterprise_customers(enterprise_id: int):
    """获取企业的客户列表"""
    customers = hub.get_customers_by_enterprise(enterprise_id)
    return customers
