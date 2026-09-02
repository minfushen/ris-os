"""
预警归因 Agent 服务：基于元典司法数据生成可解释的预警归因结论。

归因逻辑为确定性规则（可解释优先，与评分卡方法论一致）：
司法涉诉规模与结构 → 驱动因子分解 → 风险等级与置信度 → 核查方向。
不引入黑盒模型，每一步结论可由证据链回放。
"""

import asyncio
from typing import Dict, List

from services.huayu_mcp_client import HuayuMcpClient

# 触发预警关注的经营类案由关键词（区别于知识产权等中性案由）
OPERATING_CASE_KEYWORDS = ["合同", "借贷", "买卖", "租赁", "劳动", "建设工程", "承揽"]


def _top_items(distribution: List[Dict], top_n: int = 3) -> List[Dict]:
    items = sorted(distribution or [], key=lambda x: x.get("count", 0), reverse=True)
    return items[:top_n]


def _pct(part: int, total: int) -> int:
    return round(part / total * 100) if total > 0 else 0


async def attribute_company(client: HuayuMcpClient, company_name: str) -> Dict:
    """检索企业 → 拉取司法数据 → 规则归因 → 结构化结论。"""
    company = await client.search_company(company_name)
    enterprise_id = company["id"]

    # 三路数据并发拉取，降低整体时延
    writ, executed, dishonest = await asyncio.gather(
        client.get_litigation_summary(enterprise_id),
        client.get_executed_persons(enterprise_id),
        client.get_dishonest_list(enterprise_id),
    )

    total_writs = int(writ.get("total") or 0)
    case_types = writ.get("案件类别") or []
    causes = writ.get("一级案由") or []
    execution_cases = next(
        (int(c.get("count") or 0) for c in case_types if c.get("key") == "执行案件"), 0
    )
    executed_total = int(executed.get("total") or 0)
    dishonest_total = int(dishonest.get("total") or 0)
    top_causes = _top_items(causes)

    # ── 风险等级（确定性规则）──
    if dishonest_total > 0:
        level, level_text = "CRITICAL", "关键风险"
        conclusion = f"存在 {dishonest_total} 条失信被执行记录，已触及贷后预警红色信号，建议立即启动处置预案"
    elif executed_total > 0:
        level, level_text = "HIGH", "高风险"
        conclusion = f"存在 {executed_total} 条被执行人记录，偿债压力已有司法确认，需核实履行安排与资产状况"
    elif execution_cases > 0 and _pct(execution_cases, total_writs) >= 10:
        level, level_text = "HIGH", "高风险"
        conclusion = (
            f"涉诉 {total_writs} 件中执行案件占 {execution_cases} 件"
            f"（占比 {_pct(execution_cases, total_writs)}%），回款与偿付能力存在恶化信号"
        )
    elif total_writs == 0:
        level, level_text = "LOW", "低风险"
        conclusion = "公开司法渠道未检索到涉诉记录，司法维度暂无归因信号"
    else:
        level, level_text = "MEDIUM", "中风险"
        main_cause = top_causes[0]["key"] if top_causes else "经营类纠纷"
        conclusion = f"涉诉 {total_writs} 件，以「{main_cause}」为主，需关注经营性纠纷对回款的影响"

    # ── 驱动因子分解（权重 = 占比口径，百分制）──
    factors: List[Dict] = []
    for item in top_causes:
        factors.append({
            "name": f"案由 · {item['key']}",
            "weight": max(6, _pct(int(item.get("count") or 0), total_writs)),
            "note": f"{item.get('count')} 件，占涉诉总量 {_pct(int(item.get('count') or 0), total_writs)}%",
        })
    operating_hits = sum(
        int(c.get("count") or 0)
        for c in causes
        if any(kw in (c.get("key") or "") for kw in OPERATING_CASE_KEYWORDS)
    )
    if operating_hits > 0:
        factors.append({
            "name": "经营类纠纷合计",
            "weight": max(8, _pct(operating_hits, total_writs)),
            "note": f"合同/借贷/买卖等经营性案由共 {operating_hits} 件，直接关联回款能力",
        })
    if executed_total > 0:
        factors.append({"name": "被执行人记录", "weight": 30, "note": f"{executed_total} 条，司法强制偿债信号"})
    if dishonest_total > 0:
        factors.append({"name": "失信被执行记录", "weight": 35, "note": f"{dishonest_total} 条，信用惩戒名单"})
    factors.sort(key=lambda x: x["weight"], reverse=True)
    factors = factors[:5]

    # ── 置信度：数据规模越大越可信（演示口径，封顶 95）──
    confidence = min(95, 55 + total_writs // 50 * 5 + (10 if executed_total or dishonest_total else 0))
    if total_writs == 0:
        confidence = 60

    # ── 建议核查方向 ──
    suggestions: List[str] = []
    if dishonest_total > 0:
        suggestions.append("调取失信被执行决定书，确认履行状态与解除条件")
    if executed_total > 0:
        suggestions.append("核对被执行标的金额与账户冻结情况，评估划扣风险")
    if top_causes:
        suggestions.append(f"抽取「{top_causes[0]['key']}」典型文书，判断纠纷是否指向核心经营")
    suggestions.append("比对近 90 天结算流水，验证涉诉对回款的实际冲击")
    if level in ("HIGH", "CRITICAL"):
        suggestions.append("同步报授信政策室，评估是否升级处置等级")

    return {
        "company_name": company["company_name"],
        "credit_code": company.get("tyshxydm"),
        "risk_level": level,
        "risk_level_text": level_text,
        "conclusion": conclusion,
        "confidence": confidence,
        "stats": {
            "total_writs": total_writs,
            "execution_cases": execution_cases,
            "executed_total": executed_total,
            "dishonest_total": dishonest_total,
        },
        "factors": factors,
        "suggestions": suggestions,
        "evidence_chain": [
            {
                "data_source": "元典法律智能 MCP · 涉诉统计（enterpriseWritAgg）",
                "content": f"涉诉文书 {total_writs} 件；主要案件类别：{('、'.join(c['key'] for c in _top_items(case_types, 3))) or '无'}",
            },
            {
                "data_source": "元典法律智能 MCP · 被执行人（enterpriseExecutedPerson）",
                "content": f"被执行人记录 {executed_total} 条",
            },
            {
                "data_source": "元典法律智能 MCP · 失信被执行（enterpriseExecutions）",
                "content": f"失信被执行记录 {dishonest_total} 条",
            },
        ],
    }
