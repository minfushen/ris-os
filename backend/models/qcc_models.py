"""
企查查 MCP 数据模型定义

包含企业风险评估相关的所有数据结构
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime


class RiskLevel(str, Enum):
    """风险等级枚举"""
    CRITICAL = "CRITICAL"  # 立即供应中断
    HIGH = "HIGH"          # 供应不稳定
    MEDIUM = "MEDIUM"      # 财务/合规风险
    LOW = "LOW"            # 一般合规风险


class DimensionRisk(BaseModel):
    """维度风险评估"""
    level: RiskLevel = Field(..., description="风险等级")
    score: float = Field(..., ge=0, le=100, description="风险分数 0-100")
    key_findings: List[str] = Field(default_factory=list, description="关键发现")
    evidence: List[str] = Field(default_factory=list, description="证据列表")


class RiskCategory(BaseModel):
    """风险类别"""
    category: str = Field(..., description="风险类型")
    level: RiskLevel = Field(..., description="风险等级")
    description: str = Field(..., description="风险描述")
    evidence: str = Field(..., description="证据内容")
    impact: str = Field(..., description="供应链影响")
    suggestion: str = Field(..., description="处置建议")
    response_time: str = Field(..., description="响应时间要求")


class EvidenceItem(BaseModel):
    """证据项"""
    data_source: str = Field(..., description="数据来源")
    update_time: str = Field(..., description="更新时间")
    credibility: str = Field(..., description="可信度")
    content: str = Field(..., description="证据内容")


class DispositionSuggestion(BaseModel):
    """处置建议"""
    action: str = Field(..., description="处置动作")
    sla: str = Field(..., description="SLA")
    responsible_person: str = Field(..., description="责任人")
    materials: List[str] = Field(default_factory=list, description="需补充材料")


class VendorRiskAssessment(BaseModel):
    """企业风险评估结果"""
    company_name: str = Field(..., description="企业名称")
    overall_risk: RiskLevel = Field(..., description="整体风险等级")
    dimensions: Dict[str, DimensionRisk] = Field(
        default_factory=dict,
        description="9维度评估详情"
    )
    risk_categories: List[RiskCategory] = Field(
        default_factory=list,
        description="18类风险清单"
    )
    evidence_chain: List[EvidenceItem] = Field(
        default_factory=list,
        description="证据链"
    )
    disposition_suggestions: List[DispositionSuggestion] = Field(
        default_factory=list,
        description="处置建议"
    )
    assessment_time: str = Field(
        default_factory=lambda: datetime.now().isoformat(),
        description="评估时间"
    )


# 请求模型
class AssessVendorRiskRequest(BaseModel):
    """企业风险评估请求"""
    company_name: str = Field(..., min_length=1, description="企业名称或统一社会信用代码")
    dimensions: Optional[List[str]] = Field(
        None,
        description="可选：指定评估维度（默认9维度全量）"
    )


# 企查查原始数据模型
class QccCompanyInfo(BaseModel):
    """企查查企业工商信息"""
    企业名称: str
    统一社会信用代码: str
    法定代表人: str
    注册资本: str
    成立日期: str
    登记机关: str
    登记状态: str
    经营范围: str
    注册地址: Optional[str] = None
    通信地址: Optional[str] = None


class QccRiskInfo(BaseModel):
    """企查查风险信息"""
    dishonest: Optional[List[Dict]] = None              # 失信信息
    judgment_debtor: Optional[List[Dict]] = None        # 被执行人
    high_consumption: Optional[List[Dict]] = None       # 限制高消费
    abnormal_operation: Optional[List[Dict]] = None     # 经营异常
    serious_violation: Optional[List[Dict]] = None      # 严重违法
    cancellation_filing: Optional[List[Dict]] = None   # 注销备案
    equity_freeze: Optional[List[Dict]] = None          # 股权冻结
    equity_pledge: Optional[List[Dict]] = None          # 股权出质
    chattel_mortgage: Optional[List[Dict]] = None       # 动产抵押
    tax_arrears: Optional[List[Dict]] = None            # 欠税公告
    abnormal_tax: Optional[List[Dict]] = None           # 税务异常
    final_case: Optional[List[Dict]] = None             # 终本案件
    administrative_penalty: Optional[List[Dict]] = None # 行政处罚
    environmental_penalty: Optional[List[Dict]] = None  # 环保处罚
    bankruptcy_reorganization: Optional[List[Dict]] = None  # 破产重整
    judicial_auction: Optional[List[Dict]] = None       # 司法拍卖


class QccOperationInfo(BaseModel):
    """企查查经营信息"""
    qualifications: Optional[List[Dict]] = None         # 资质证书
    administrative_licenses: Optional[List[Dict]] = None  # 行政许可
    bidding_info: Optional[List[Dict]] = None           # 招投标信息
    credit_rating: Optional[List[Dict]] = None          # 信用评级
    spot_check_records: Optional[List[Dict]] = None     # 抽查检查记录
    financing_records: Optional[List[Dict]] = None      # 融资记录
