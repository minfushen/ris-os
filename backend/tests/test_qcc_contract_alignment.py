import importlib
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import enterprise_db
from models.qcc_models import QccCompanyInfo, QccOperationInfo, QccRiskInfo, RiskLevel
from services.qcc_mcp_client import QccMcpClient


@pytest.mark.anyio
async def test_qcc_router_company_endpoint_uses_parsed_model(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    router_module = importlib.import_module("routers.qcc_assessment")
    router_module = importlib.reload(router_module)

    async def fake_get_company_info(_search_key: str):
        return QccCompanyInfo(
            企业名称="路由解析企业",
            统一社会信用代码="91310000ROUTERCODE",
            法定代表人="李四",
            注册资本="500万人民币",
            成立日期="2021-02-03",
            登记机关="某市市场监督管理局",
            登记状态="存续",
            经营范围="测试经营",
            注册地址="测试地址",
            通信地址="测试通信地址",
        )

    router_module.mcp_client._get_company_info = fake_get_company_info
    result = await router_module.get_company_info("原始企业名", search_key="优先搜索词")
    assert isinstance(result, QccCompanyInfo)
    assert result.企业名称 == "路由解析企业"


@pytest.mark.anyio
async def test_qcc_router_risk_endpoint_accepts_model_result(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    router_module = importlib.import_module("routers.qcc_assessment")
    router_module = importlib.reload(router_module)

    async def fake_batch_get_risks(_company_name: str):
        return QccRiskInfo(dishonest=[])

    router_module.mcp_client._batch_get_risks = fake_batch_get_risks
    result = await router_module.get_risk_info("测试企业")
    assert isinstance(result, QccRiskInfo)


@pytest.mark.anyio
async def test_qcc_router_operation_endpoint_accepts_model_result(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    router_module = importlib.import_module("routers.qcc_assessment")
    router_module = importlib.reload(router_module)

    async def fake_get_operation_info(_company_name: str):
        return QccOperationInfo(qualifications=[])

    router_module.mcp_client._get_operation_info = fake_get_operation_info
    result = await router_module.get_operation_info("测试企业")
    assert isinstance(result, QccOperationInfo)


@pytest.mark.anyio
async def test_register_enterprise_manual_archive_only(monkeypatch, tmp_path):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    monkeypatch.setattr(enterprise_db, "DB_PATH", tmp_path / "enterprise_hub_test.db")
    enterprise_db.init_enterprise_db()

    enterprise_hub_module = importlib.import_module("services.enterprise_hub")
    enterprise_hub_module = importlib.reload(enterprise_hub_module)
    hub = enterprise_hub_module.EnterpriseDataHub()

    enterprise = await hub.register_enterprise("输入企业名")

    assert enterprise["company_name"] == "输入企业名"
    assert enterprise["credit_code"] is None


def test_generate_risk_categories_contract_alignment(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    client = QccMcpClient()
    risk_info = QccRiskInfo(
        dishonest=[{}],
        judgment_debtor=[{}],
        high_consumption=[{}],
        abnormal_operation=[{}],
        serious_violation=[{}],
        cancellation_filing=[{}],
        equity_freeze=[{}],
        equity_pledge=[{}],
        chattel_mortgage=[{}],
        tax_arrears=[{}],
        abnormal_tax=[{}],
        final_case=[{}],
        administrative_penalty=[{}],
        environmental_penalty=[{}],
        bankruptcy_reorganization=[{}],
        judicial_auction=[{}],
    )

    categories = client._generate_risk_categories(risk_info)
    category_names = {category.category for category in categories}

    expected = {
        "破产重整",
        "失信信息",
        "被执行人",
        "环保处罚（停产）",
        "经营异常",
        "严重违法",
        "注销备案",
        "股权冻结",
        "限制高消费",
        "股权出质",
        "欠税公告",
        "税务异常",
        "终本案件",
        "动产抵押",
        "一般行政处罚",
        "司法拍卖",
    }
    assert expected.issubset(category_names)


def test_to_record_list_treats_no_record_hint_as_empty(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    client = QccMcpClient()
    data = {"企业名称": "华为技术有限公司", "搜索结果": "已全量扫描该主体破产重整数据库，未发现任何记录。"}
    assert client._to_record_list(data) == []

    data_with_summary = {
        "企业名称": "华为技术有限公司",
        "摘要": "经核查未发现任何失信信息记录。",
        "关联分析": "未查到相关风险条目。",
    }
    assert client._to_record_list(data_with_summary) == []

    data_with_brackets = {
        "企业名称": "华为技术有限公司",
        "搜索结果": "核查结果显示当前无【股权冻结】记录。",
    }
    assert client._to_record_list(data_with_brackets) == []


def test_overall_risk_defaults_to_low_when_no_risk_categories(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    client = QccMcpClient()
    assert client._calculate_overall_risk([]) == RiskLevel.LOW
