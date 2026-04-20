"""
贷后场景（post_loan）REST 资源：特征工作室、数据字典。
挂载路径（app 双注册）：/scenario/post-loan/* 与 /api/scenario/post-loan/*
"""

from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/scenario/post-loan", tags=["scenario-post-loan"])

ScenarioCode = Literal["post_loan"]


# ─── 特征工作室 ───────────────────────────────────────────────────────────────


class OverviewCard(BaseModel):
    label: str
    value: int
    subtitle: str
    warn: bool = False


class PsiByProductRow(BaseModel):
    feature: str
    biz_psi: float = Field(..., description="经营贷 PSI")
    tax_psi: float = Field(..., description="税易贷 PSI")
    note: str


class FeatureRow(BaseModel):
    id: str
    name: str
    category: str
    value_type: str
    source: str
    psi_biz_loan: float
    psi_tax_easy_loan: float
    drift_status: Literal["normal", "warning"]


class PsiAlarmDefaults(BaseModel):
    enabled: bool
    threshold: float = Field(..., ge=0, le=1, description="任一产品线 PSI 超过即告警")


class FeatureStudioBundle(BaseModel):
    scenario: ScenarioCode = "post_loan"
    overview_cards: list[OverviewCard]
    psi_by_product: list[PsiByProductRow]
    features: list[FeatureRow]
    psi_alarm_defaults: PsiAlarmDefaults


_STUDIO_FEATURES: list[FeatureRow] = [
    FeatureRow(
        id="feat_001",
        name="还款规律性指数",
        category="还款行为",
        value_type="数值型",
        source="核心账务",
        psi_biz_loan=0.06,
        psi_tax_easy_loan=0.09,
        drift_status="normal",
    ),
    FeatureRow(
        id="feat_002",
        name="提前还款率_30d",
        category="还款行为",
        value_type="数值型",
        source="核心账务",
        psi_biz_loan=0.11,
        psi_tax_easy_loan=0.14,
        drift_status="normal",
    ),
    FeatureRow(
        id="feat_003",
        name="承诺履约率",
        category="催收反馈",
        value_type="数值型",
        source="催收系统",
        psi_biz_loan=0.18,
        psi_tax_easy_loan=0.22,
        drift_status="warning",
    ),
    FeatureRow(
        id="feat_004",
        name="联系成功率_7d",
        category="催收反馈",
        value_type="数值型",
        source="催收系统",
        psi_biz_loan=0.09,
        psi_tax_easy_loan=0.12,
        drift_status="normal",
    ),
    FeatureRow(
        id="feat_005",
        name="在贷余额环比",
        category="还款行为",
        value_type="数值型",
        source="核心账务",
        psi_biz_loan=0.13,
        psi_tax_easy_loan=0.19,
        drift_status="warning",
    ),
]

_STUDIO_PSI_MATRIX: list[PsiByProductRow] = [
    PsiByProductRow(feature="还款规律性指数", biz_psi=0.06, tax_psi=0.09, note="分产品线独立基线"),
    PsiByProductRow(feature="承诺履约率", biz_psi=0.18, tax_psi=0.22, note="税易贷客群波动略高"),
    PsiByProductRow(feature="提前还款率_30d", biz_psi=0.11, tax_psi=0.14, note="均在阈值内"),
]


def _build_studio_bundle() -> FeatureStudioBundle:
    threshold = 0.2
    drift_cnt = sum(
        1
        for f in _STUDIO_FEATURES
        if f.psi_biz_loan > threshold or f.psi_tax_easy_loan > threshold
    )
    cards = [
        OverviewCard(label="还款行为类", value=42, subtitle="规律性 / 提前还款 / 余额波动"),
        OverviewCard(label="催收反馈类", value=28, subtitle="履约率 / 触达成功率"),
        OverviewCard(label="司法税务衍生", value=36, subtitle="企信 / 裁判 / 纳税信用衍生"),
        OverviewCard(label="漂移需关注", value=drift_cnt, subtitle="超产品线 PSI 阈值", warn=drift_cnt > 0),
    ]
    return FeatureStudioBundle(
        overview_cards=cards,
        psi_by_product=_STUDIO_PSI_MATRIX,
        features=_STUDIO_FEATURES,
        psi_alarm_defaults=PsiAlarmDefaults(enabled=True, threshold=threshold),
    )


@router.get("/feature-studio", response_model=FeatureStudioBundle)
def get_feature_studio() -> FeatureStudioBundle:
    """聚合贷后特征工作室页所需数据（列表、分产品线 PSI、概览卡、默认告警配置）。"""
    return _build_studio_bundle()


# ─── 数据字典 ─────────────────────────────────────────────────────────────────

RefreshFreq = Literal["实时", "T+1", "月更", "按需"]
VarType = Literal["raw", "derived", "model"]
VarStatus = Literal["active", "draft"]
SourceConn = Literal["connected", "error"]


class DataDictionaryVariable(BaseModel):
    id: str
    name: str
    cn_name: str
    var_type: VarType
    source: str
    source_code: str = Field(
        ...,
        description="筛选用编码：core|collection|enterprise_credit|court|golden_tax_3",
    )
    refresh: RefreshFreq
    status: VarStatus


class DataDictionarySource(BaseModel):
    id: str
    name: str
    category: str
    refresh: RefreshFreq
    connection_status: SourceConn
    last_sync_at: str = Field(..., description="展示用时间字符串")


_VARIABLES_SEED: list[DataDictionaryVariable] = [
    DataDictionaryVariable(
        id="V101",
        name="repay_regularity_idx",
        cn_name="还款规律性指数",
        var_type="derived",
        source="核心账务",
        source_code="core",
        refresh="T+1",
        status="active",
    ),
    DataDictionaryVariable(
        id="V102",
        name="prepay_rate_30d",
        cn_name="提前还款率_30d",
        var_type="derived",
        source="核心账务",
        source_code="core",
        refresh="T+1",
        status="active",
    ),
    DataDictionaryVariable(
        id="V103",
        name="promise_keep_rate",
        cn_name="承诺履约率",
        var_type="derived",
        source="催收系统",
        source_code="collection",
        refresh="实时",
        status="active",
    ),
    DataDictionaryVariable(
        id="V104",
        name="ent_legal_change_flag",
        cn_name="法人变更标识",
        var_type="raw",
        source="国家企信",
        source_code="enterprise_credit",
        refresh="月更",
        status="active",
    ),
    DataDictionaryVariable(
        id="V105",
        name="court_exec_cnt_12m",
        cn_name="近12月被执行次数",
        var_type="raw",
        source="裁判文书/执行",
        source_code="court",
        refresh="T+1",
        status="active",
    ),
    DataDictionaryVariable(
        id="V106",
        name="tax_credit_level",
        cn_name="纳税信用等级",
        var_type="raw",
        source="金税三期",
        source_code="golden_tax_3",
        refresh="月更",
        status="draft",
    ),
]

_SOURCES_SEED: list[DataDictionarySource] = [
    DataDictionarySource(
        id="DS201",
        name="国家企业信用信息公示系统",
        category="工商司法",
        refresh="月更",
        connection_status="connected",
        last_sync_at="2026-04-17 06:00",
    ),
    DataDictionarySource(
        id="DS202",
        name="裁判文书 / 执行信息公开",
        category="司法",
        refresh="T+1",
        connection_status="connected",
        last_sync_at="2026-04-17 08:30",
    ),
    DataDictionarySource(
        id="DS203",
        name="金税三期 · 纳税信用",
        category="税务",
        refresh="月更",
        connection_status="connected",
        last_sync_at="2026-04-16 22:00",
    ),
    DataDictionarySource(
        id="DS204",
        name="核心账务系统",
        category="内部",
        refresh="实时",
        connection_status="connected",
        last_sync_at="2026-04-17 10:35",
    ),
    DataDictionarySource(
        id="DS205",
        name="催收作业平台",
        category="内部",
        refresh="实时",
        connection_status="connected",
        last_sync_at="2026-04-17 10:34",
    ),
]


def _filter_variables(
    rows: list[DataDictionaryVariable],
    q: Optional[str],
    source_code: Optional[str],
    refresh: Optional[str],
) -> list[DataDictionaryVariable]:
    out = list(rows)
    if source_code:
        out = [r for r in out if r.source_code == source_code]
    if refresh:
        out = [r for r in out if r.refresh == refresh]
    if q:
        qn = q.strip().lower()
        out = [
            r
            for r in out
            if qn in r.name.lower() or qn in r.cn_name.lower() or qn in r.id.lower()
        ]
    return out


@router.get("/data-dictionary/variables", response_model=list[DataDictionaryVariable])
def list_data_dictionary_variables(
    q: Optional[str] = Query(default=None, description="变量名 / 中文名 / ID 模糊匹配"),
    source_code: Optional[str] = Query(
        default=None,
        description="core|collection|enterprise_credit|court|golden_tax_3",
    ),
    refresh: Optional[str] = Query(default=None, description="实时|T+1|月更|按需"),
) -> list[DataDictionaryVariable]:
    """变量字典（贷后场景数据源）；支持查询参数过滤。"""
    return _filter_variables(_VARIABLES_SEED, q, source_code, refresh)


@router.get("/data-dictionary/sources", response_model=list[DataDictionarySource])
def list_data_dictionary_sources() -> list[DataDictionarySource]:
    """数据源列表（企信 / 司法 / 金税等）。"""
    return list(_SOURCES_SEED)
