import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.enterprise_hub import EnterpriseDataHub


def test_onboard_watchlist_batch_summary_counts(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()

    created = {"A企业"}

    async def fake_register(name: str):
        if name == "失败企业":
            raise RuntimeError("注册失败")
        return {"id": abs(hash(name)) % 10000, "company_name": name}

    assessed_flags = []

    async def fake_assess(
        _enterprise_id: int,
        low_cost: bool = False,
        persist: bool = True,
        risk_only: bool = False,
    ):
        assessed_flags.append(low_cost)
        class _Assessment:
            overall_risk = "HIGH"
            risk_categories = [{"category": "失信信息"}]
        return _Assessment()

    async def fake_trigger(_enterprise_id: int, _assessment):
        return {"alert_level": "HIGH"}

    monkeypatch.setattr(hub, "register_enterprise", fake_register)
    monkeypatch.setattr(hub, "assess_risk", fake_assess)
    monkeypatch.setattr(hub, "check_and_trigger_alerts", fake_trigger)
    monkeypatch.setattr(
        hub,
        "get_enterprise_by_name",
        lambda name: None if name in created else {"id": 1, "company_name": name},
    )

    data = asyncio.run(
        hub.onboard_watchlist_batch(["A企业", "B企业", "失败企业", "A企业", ""])
    )

    assert data["total_submitted"] == 5
    assert data["total_valid"] == 3
    assert data["processed"] == 2
    assert data["created_enterprises"] == 1
    assert data["assessed"] == 2
    assert data["alerts_triggered"] == 2
    assert len(data["failures"]) == 1
    assert assessed_flags == [True, False, True, False]
    assert data["escalated_to_full"] == 2


def test_onboard_watchlist_short_circuit_on_credit_exhausted(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()

    async def fake_register(name: str):
        if name == "A企业":
            raise RuntimeError("企查查 MCP 积分余额不足，请充值后重试")
        return {"id": abs(hash(name)) % 10000, "company_name": name}

    async def fake_assess(
        _enterprise_id: int,
        low_cost: bool = False,
        persist: bool = True,
        risk_only: bool = False,
    ):
        class _Assessment:
            overall_risk = "LOW"
            risk_categories = []
        return _Assessment()

    async def fake_trigger(_enterprise_id: int, _assessment):
        return None

    monkeypatch.setattr(hub, "register_enterprise", fake_register)
    monkeypatch.setattr(hub, "assess_risk", fake_assess)
    monkeypatch.setattr(hub, "check_and_trigger_alerts", fake_trigger)
    monkeypatch.setattr(hub, "get_enterprise_by_name", lambda _name: None)

    data = asyncio.run(hub.onboard_watchlist_batch(["A企业", "B企业", "C企业"]))

    assert data["processed"] == 0
    assert data["assessed"] == 0
    assert len(data["failures"]) == 3
    assert all("积分余额不足" in item["error"] for item in data["failures"])


def test_onboard_watchlist_full_mode_passes_low_cost_false(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()
    assessed_flags = []

    async def fake_register(name: str):
        return {"id": abs(hash(name)) % 10000, "company_name": name}

    async def fake_assess(
        _enterprise_id: int,
        low_cost: bool = False,
        persist: bool = True,
        risk_only: bool = False,
    ):
        assessed_flags.append(low_cost)
        class _Assessment:
            overall_risk = "LOW"
            risk_categories = []
        return _Assessment()

    async def fake_trigger(_enterprise_id: int, _assessment):
        return None

    monkeypatch.setattr(hub, "register_enterprise", fake_register)
    monkeypatch.setattr(hub, "assess_risk", fake_assess)
    monkeypatch.setattr(hub, "check_and_trigger_alerts", fake_trigger)
    monkeypatch.setattr(hub, "get_enterprise_by_name", lambda _name: None)

    data = asyncio.run(hub.onboard_watchlist_batch(["A企业", "B企业"], mode="full"))
    assert data["processed"] == 2
    assert assessed_flags == [False, False]


def test_onboard_watchlist_low_cost_without_risk_does_not_escalate(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()
    calls = []

    async def fake_register(name: str):
        return {"id": abs(hash(name)) % 10000, "company_name": name}

    async def fake_assess(
        _enterprise_id: int,
        low_cost: bool = False,
        persist: bool = True,
        risk_only: bool = False,
    ):
        calls.append((low_cost, persist))
        class _Assessment:
            overall_risk = "LOW"
            risk_categories = []
        return _Assessment()

    async def fake_trigger(_enterprise_id: int, _assessment):
        return None

    monkeypatch.setattr(hub, "register_enterprise", fake_register)
    monkeypatch.setattr(hub, "assess_risk", fake_assess)
    monkeypatch.setattr(hub, "check_and_trigger_alerts", fake_trigger)
    monkeypatch.setattr(hub, "get_enterprise_by_name", lambda _name: None)
    monkeypatch.setattr(hub, "_persist_assessment", lambda *_args, **_kwargs: None)

    data = asyncio.run(hub.onboard_watchlist_batch(["A企业"], mode="low_cost"))
    assert data["processed"] == 1
    assert data["escalated_to_full"] == 0
    assert calls == [(True, False)]


def test_precheck_watchlist_capacity_blocks_when_credit_exhausted(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()

    async def fake_call_tool(*_args, **_kwargs):
        raise RuntimeError("企查查 MCP 积分余额不足，请充值后重试")

    monkeypatch.setattr(hub.qcc_client, "call_tool", fake_call_tool)
    data = asyncio.run(hub.precheck_watchlist_capacity(mode="low_cost", planned_count=10))
    assert data["can_submit"] is False
    assert "积分余额不足" in data["message"]


def test_precheck_watchlist_uses_risk_server(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()
    calls = []

    async def fake_call_tool(server: str, tool_name: str, arguments):
        calls.append((server, tool_name, arguments.get("searchKey")))
        return {"result": {"content": [{"text": "[]"}]}}

    monkeypatch.setattr(hub.qcc_client, "call_tool", fake_call_tool)
    data = asyncio.run(hub.precheck_watchlist_capacity(mode="low_cost", planned_count=2))
    assert data["can_submit"] is True
    assert calls[0][0] == "risk"
    assert calls[0][1] == "get_dishonest_info"


def test_register_enterprise_does_not_call_qcc_company(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()

    async def should_not_be_called(*_args, **_kwargs):
        raise RuntimeError("should not call external mcp")

    monkeypatch.setattr(hub.qcc_client, "_get_company_info", should_not_be_called)
    name = f"手工建档测试-{uuid.uuid4().hex[:8]}"
    data = asyncio.run(hub.register_enterprise(name))
    assert data["company_name"] == name


def test_import_watchlist_csv_rows_upserts_and_triggers_onboard(monkeypatch):
    monkeypatch.setenv("QCC_MCP_API_KEY", "test-key")
    hub = EnterpriseDataHub()

    async def fake_onboard(company_names, mode="low_cost"):
        return {
            "mode": mode,
            "total_valid": len(company_names),
            "results": [{"company_name": n} for n in company_names],
        }

    monkeypatch.setattr(hub, "onboard_watchlist_batch", fake_onboard)
    rows = [
        {
            "company_name": "A企业",
            "credit_code": "CODE-A",
            "shareholder_name": "张三",
            "shareholder_type": "自然人",
            "contribution_amount": "100",
            "contribution_ratio": "60",
            "loan_amount": "2000000",
            "interest_rate": "4.2",
            "start_date": "2026-01-01",
            "end_date": "2027-01-01",
            "status": "normal",
            "manager_id": "RM001",
        },
        {
            "company_name": "A企业",
            "credit_code": "CODE-A-NEW",
            "shareholder_name": "李四",
            "shareholder_type": "自然人",
            "contribution_amount": "80",
            "contribution_ratio": "40",
            "loan_amount": "3000000",
            "interest_rate": "4.8",
            "start_date": "2026-02-01",
            "end_date": "2027-02-01",
            "status": "watch",
            "manager_id": "RM002",
        },
        {"company_name": "", "credit_code": "INVALID"},
    ]

    data = asyncio.run(hub.import_watchlist_csv_rows(rows, mode="full"))
    assert data["imported"] == 2
    assert data["failed_count"] == 1
    assert data["onboard_summary"]["mode"] == "full"
    assert data["onboard_summary"]["total_valid"] == 1

    enterprise = hub.get_enterprise_by_name("A企业")
    detail = hub.get_enterprise(enterprise["id"])
    assert detail["credit_code"] == "CODE-A-NEW"
    assert len(detail["shareholders"]) >= 2
    assert len(detail["loans"]) >= 2
