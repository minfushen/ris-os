"""归因分析服务"""

from __future__ import annotations

import sqlite3
from pathlib import Path

# 教学数据库路径
ROOT = Path(__file__).resolve().parents[2]
DEMO_DB = ROOT / "sampledata" / "sqlite_04" / "demo_04.db" if (ROOT / "sampledata").exists() else None


def _query_row(conn: sqlite3.Connection, sql: str) -> dict:
    conn.row_factory = sqlite3.Row
    row = conn.execute(sql).fetchone()
    return dict(row) if row else {}


def process_analysis(description: str, scenario_node: str) -> tuple[str, dict]:
    """处理归因分析任务，返回 (摘要, 结果字典)"""

    # 检查数据库是否存在
    if not DEMO_DB or not DEMO_DB.exists():
        summary = "分析失败：数据源不可用"
        result = {
            "scenario_node": scenario_node,
            "metrics": {},
            "charts": [],
            "key_findings": ["数据源 demo_04.db 不存在"],
            "next_actions": ["初始化数据源后重试"],
        }
        return summary, result

    # 查询指标数据
    conn = sqlite3.connect(DEMO_DB)

    credit_data = _query_row(
        conn,
        """
        SELECT
            COUNT(*) AS apply_cnt,
            SUM(CASE WHEN approved=1 THEN 1 ELSE 0 END) AS approved_cnt,
            ROUND(SUM(CASE WHEN approved=1 THEN 1 ELSE 0 END) * 1.0 / COUNT(*), 4) AS approval_rate
        FROM credit_result
        """,
    )

    conn.close()

    # 提取指标
    apply_cnt = credit_data.get("apply_cnt", 0)
    approved_cnt = credit_data.get("approved_cnt", 0)
    approval_rate = credit_data.get("approval_rate")

    metrics = {
        "apply_cnt": int(apply_cnt),
        "approved_cnt": int(approved_cnt),
        "approval_rate": float(approval_rate) if approval_rate else None,
    }

    # 图表数据
    charts = [
        {
            "type": "bar",
            "title": "授信申请与通过",
            "labels": ["申请量", "通过量"],
            "values": [int(apply_cnt), int(approved_cnt)],
        },
        {
            "type": "table",
            "title": "核心指标",
            "columns": ["指标", "数值", "说明"],
            "rows": [
                ["授信通过率", f"{float(approval_rate):.2%}" if approval_rate else "N/A", "credit_result"],
                ["申请总量", str(int(apply_cnt)), "credit_result"],
            ],
        },
    ]

    # 生成摘要
    rate_str = f"{float(approval_rate):.2%}" if approval_rate else "N/A"
    summary = f"{scenario_node} 节点分析：通过率 {rate_str}，申请量 {apply_cnt}"

    result = {
        "scenario_node": scenario_node,
        "description": description,
        "metrics": metrics,
        "charts": charts,
        "key_findings": [
            f"授信通过率 {rate_str}",
            f"申请总量 {apply_cnt}",
            "数据来源：教学数据库",
        ],
        "next_actions": [
            "按渠道拆解",
            "按客群拆解",
            "导出报告",
        ],
    }

    return summary, result
