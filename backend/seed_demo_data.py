"""
backend/seed_demo_data.py

演示数据种子脚本：向 dev.db 注入覆盖所有 UI 状态和业务场景的演示任务与结果。
用法：python -m backend.seed_demo_data
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "backend" / "dev.db"
SCHEMA_PATH = ROOT / "backend" / "schema.sql"
SAMPLEDATA = ROOT / "sampledata"


# ─── 工具函数 ────────────────────────────────────────────────────────────────

def ts(hours_ago: float = 0) -> str:
    """返回 hours_ago 小时前的 ISO 8601 时间戳。"""
    t = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
    return t.isoformat()


def jdump(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False)


# ─── 数据库初始化 ─────────────────────────────────────────────────────────────

def force_init_db() -> None:
    """强制重建 dev.db（DROP + CREATE），确保幂等。"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(schema)
        conn.commit()
    finally:
        conn.close()


# ─── 从 sampledata 读取真实指标 ───────────────────────────────────────────────

def load_real_metrics() -> dict[str, Any]:
    """从 sqlite_04、sqlite_06、sqlite_07 提取真实字段值。"""
    metrics: dict[str, Any] = {}

    # sqlite_04：授信通过率 + 渠道名
    db04 = SAMPLEDATA / "sqlite_04" / "demo_04.db"
    if db04.exists():
        conn = sqlite3.connect(db04)
        conn.row_factory = sqlite3.Row
        try:
            r = conn.execute(
                "SELECT COUNT(*) AS apply_cnt, SUM(approved) AS approved_cnt "
                "FROM credit_result"
            ).fetchone()
            apply_cnt = r["apply_cnt"] or 3
            approved_cnt = r["approved_cnt"] or 2
            metrics["credit_approval_rate"] = round(approved_cnt / apply_cnt, 4)
            metrics["credit_apply_cnt"] = apply_cnt
            metrics["credit_approved_cnt"] = approved_cnt

            ch = conn.execute("SELECT channel_name FROM dim_channel LIMIT 1").fetchone()
            metrics["channel_name"] = ch["channel_name"] if ch else "手机银行"
        finally:
            conn.close()
    else:
        metrics.update({
            "credit_approval_rate": 0.6667,
            "credit_apply_cnt": 3,
            "credit_approved_cnt": 2,
            "channel_name": "手机银行",
        })

    # sqlite_06：支用通过率 + 拒绝原因码
    db06 = SAMPLEDATA / "sqlite_06" / "demo_06.db"
    if db06.exists():
        conn = sqlite3.connect(db06)
        conn.row_factory = sqlite3.Row
        try:
            rows = conn.execute(
                "SELECT decision, COUNT(*) AS cnt FROM draw_application GROUP BY decision"
            ).fetchall()
            approved = next((r["cnt"] for r in rows if r["decision"] == "APPROVED"), 3)
            rejected = next((r["cnt"] for r in rows if r["decision"] == "REJECTED"), 2)
            total = approved + rejected
            metrics["draw_approval_rate"] = round(approved / total, 4) if total else 0.60
            metrics["draw_approved_cnt"] = approved
            metrics["draw_rejected_cnt"] = rejected

            reasons = conn.execute(
                "SELECT DISTINCT reject_reason_code FROM draw_application "
                "WHERE reject_reason_code IS NOT NULL"
            ).fetchall()
            metrics["draw_reject_reasons"] = [r["reject_reason_code"] for r in reasons]
        finally:
            conn.close()
    else:
        metrics.update({
            "draw_approval_rate": 0.60,
            "draw_approved_cnt": 3,
            "draw_rejected_cnt": 2,
            "draw_reject_reasons": ["DEVICE_HIGH_RISK", "LIMIT_NOT_ENOUGH"],
        })

    # sqlite_07：贷后额度变更事件
    db07 = SAMPLEDATA / "sqlite_07" / "demo_07.db"
    if db07.exists():
        conn = sqlite3.connect(db07)
        conn.row_factory = sqlite3.Row
        try:
            events = conn.execute(
                "SELECT event_type, reason_code FROM limit_change_event"
            ).fetchall()
            metrics["postloan_event_types"] = list({r["event_type"] for r in events})
            metrics["postloan_reason_codes"] = list({r["reason_code"] for r in events if r["reason_code"]})

            contracts = conn.execute(
                "SELECT status, COUNT(*) AS cnt FROM revolve_contract GROUP BY status"
            ).fetchall()
            metrics["contract_status_dist"] = {r["status"]: r["cnt"] for r in contracts}
        finally:
            conn.close()
    else:
        metrics.update({
            "postloan_event_types": ["ADJUST_UP", "FREEZE", "ADJUST_DOWN"],
            "postloan_reason_codes": ["BEHAVIOR_GOOD", "DPD30", "RISK_POLICY"],
            "contract_status_dist": {"ACTIVE": 2, "FROZEN": 1, "CLOSED": 1},
        })

    return metrics


# ─── 插入辅助函数 ─────────────────────────────────────────────────────────────

def insert_task(conn: sqlite3.Connection, task_id: str, task_type: str, status: str,
                title: str, description: str, scenario_node: str,
                created_at: str, updated_at: str,
                error_message: str | None = None) -> None:
    conn.execute(
        """
        INSERT INTO tasks(task_id, task_type, status, title, description,
                          scenario_node, created_by, created_at, updated_at, error_message)
        VALUES(?, ?, ?, ?, ?, ?, 'demo-user', ?, ?, ?)
        """,
        (task_id, task_type, status, title, description,
         scenario_node, created_at, updated_at, error_message),
    )


def insert_result(conn: sqlite3.Connection, task_id: str, summary: str,
                  result: dict[str, Any]) -> None:
    conn.execute(
        """
        INSERT INTO task_results(task_id, summary, result_json, updated_at)
        VALUES(?, ?, ?, ?)
        """,
        (task_id, summary, jdump(result), ts(0)),
    )


# ─── 分析类演示结果构建 ────────────────────────────────────────────────────────

def build_analysis_results(m: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """构建 4 条 completed 分析任务的 result_json，使用真实 sampledata 指标。"""

    channel = m.get("channel_name", "手机银行")
    credit_rate = m.get("credit_approval_rate", 0.6667)
    apply_cnt = m.get("credit_apply_cnt", 3)
    approved_cnt = m.get("credit_approved_cnt", 2)
    draw_rate = m.get("draw_approval_rate", 0.60)
    draw_approved = m.get("draw_approved_cnt", 3)
    draw_rejected = m.get("draw_rejected_cnt", 2)
    reject_reasons = m.get("draw_reject_reasons", ["DEVICE_HIGH_RISK", "LIMIT_NOT_ENOUGH"])
    event_types = m.get("postloan_event_types", ["ADJUST_UP", "FREEZE", "ADJUST_DOWN"])
    reason_codes = m.get("postloan_reason_codes", ["BEHAVIOR_GOOD", "DPD30", "RISK_POLICY"])
    contract_dist = m.get("contract_status_dist", {"ACTIVE": 2, "FROZEN": 1, "CLOSED": 1})

    reject_reason_labels = {
        "DEVICE_HIGH_RISK": "设备高风险",
        "LIMIT_NOT_ENOUGH": "额度不足",
    }
    event_labels = {
        "ADJUST_UP": "额度上调",
        "FREEZE": "额度冻结",
        "ADJUST_DOWN": "额度下调",
    }
    reason_labels = {
        "BEHAVIOR_GOOD": "行为良好",
        "DPD30": "逾期30天",
        "RISK_POLICY": "风险策略",
    }

    results: dict[str, dict[str, Any]] = {}

    # tsk_seed_a01：授信通过率分析（credit）
    results["tsk_seed_a01"] = {
        "scenario_node": "credit",
        "summary": (
            f"兴安贷+ 本周授信通过率为 {credit_rate*100:.2f}%（{channel}渠道），"
            f"授信申请量 {apply_cnt} 笔，通过 {approved_cnt} 笔，"
            f"拒绝 {apply_cnt - approved_cnt} 笔。本周与上周持平，无异常波动。"
        ),
        "steps": [
            {"name": "数据拉取", "status": "done",
             "detail": f"从 sqlite_04 拉取 credit_apply + credit_result，共 {apply_cnt} 条申请记录"},
            {"name": "渠道维度拆解", "status": "done",
             "detail": f"按 dim_channel 分组，当前仅{channel}（CH01）渠道"},
            {"name": "授信通过率计算", "status": "done",
             "detail": f"授信通过率 = {approved_cnt}/{apply_cnt} = {credit_rate*100:.2f}%"},
            {"name": "结论生成", "status": "done",
             "detail": "基于规则层结果生成分析摘要，口径已标注授信节点"},
        ],
        "metrics": {
            "credit_approval_rate": credit_rate,
            "apply_count": apply_cnt,
            "approved_count": approved_cnt,
            "rejected_count": apply_cnt - approved_cnt,
        },
        "charts": [
            {
                "type": "trend",
                "title": "授信通过率周趋势",
                "dates": ["2025-05-26", "2025-06-02", "2025-06-09"],
                "values": [0.6500, round(credit_rate - 0.01, 4), credit_rate],
            },
            {
                "type": "bar",
                "title": f"渠道授信通过率对比（{channel}）",
                "labels": [channel],
                "values": [credit_rate],
            },
        ],
        "key_findings": [
            f"{channel}渠道授信通过率 {credit_rate*100:.2f}%，本周与上周持平",
            f"授信申请量 {apply_cnt} 笔，通过 {approved_cnt} 笔，拒绝 {apply_cnt - approved_cnt} 笔",
            "当前数据仅含单渠道，建议补充其他渠道数据以做横向对比",
        ],
        "next_actions": [
            "按客群（新客/老客）拆解授信通过率",
            "对比支用通过率，评估授信→支用转化漏斗",
        ],
        "task_description": "请分析兴安贷+ 本周授信通过率相对上周的变动，按渠道拆解",
    }

    # tsk_seed_a02：支用通过率异常归因（draw）
    reject_bar_labels = [reject_reason_labels.get(r, r) for r in reject_reasons]
    reject_bar_values = [1] * len(reject_reasons)  # 每个原因各 1 笔
    results["tsk_seed_a02"] = {
        "scenario_node": "draw",
        "summary": (
            f"兴安贷+ 支用通过率 {draw_rate*100:.1f}%（{draw_approved} 通过 / {draw_rejected} 拒绝），"
            f"主要拒绝原因：{reject_reason_labels.get(reject_reasons[0], reject_reasons[0]) if reject_reasons else '设备高风险'}。"
            "建议重点排查设备风控策略阈值。"
        ),
        "steps": [
            {"name": "数据拉取", "status": "done",
             "detail": f"从 sqlite_06 拉取 draw_application，共 {draw_approved + draw_rejected} 条支用申请"},
            {"name": "支用通过率计算", "status": "done",
             "detail": f"支用/提款通过率 = {draw_approved}/{draw_approved + draw_rejected} = {draw_rate*100:.1f}%"},
            {"name": "拒绝原因拆解", "status": "done",
             "detail": f"拒绝原因分布：{', '.join(reject_reasons)}"},
            {"name": "异常归因", "status": "done",
             "detail": "DEVICE_HIGH_RISK 占拒绝量 50%，为主要拒绝原因"},
        ],
        "metrics": {
            "draw_approval_rate": draw_rate,
            "draw_approved_count": draw_approved,
            "draw_rejected_count": draw_rejected,
        },
        "charts": [
            {
                "type": "trend",
                "title": "支用/提款通过率日趋势",
                "dates": ["2025-06-05", "2025-06-06", "2025-06-07", "2025-06-08", "2025-06-09"],
                "values": [0.70, 0.65, 0.60, 0.58, draw_rate],
            },
            {
                "type": "bar",
                "title": "支用拒绝原因分布",
                "labels": reject_bar_labels,
                "values": reject_bar_values,
            },
        ],
        "key_findings": [
            f"支用/提款通过率 {draw_rate*100:.1f}%，较上周下降约 10 个百分点",
            f"主要拒绝原因：{reject_reason_labels.get(reject_reasons[0], reject_reasons[0]) if reject_reasons else '设备高风险'}，占拒绝量 50%",
            "建议复核设备风控策略阈值，评估是否存在误杀",
        ],
        "next_actions": [
            "拉取设备风控命中明细，分析误杀率",
            "对比上周策略版本，确认是否有规则变更",
        ],
        "task_description": "分析兴安贷+ 支用通过率近期异常下降的原因，按拒绝原因拆解",
    }

    # tsk_seed_a03：贷后额度调整影响面评估（post_loan）
    active_cnt = contract_dist.get("ACTIVE", 2)
    frozen_cnt = contract_dist.get("FROZEN", 1)
    closed_cnt = contract_dist.get("CLOSED", 1)
    total_contracts = active_cnt + frozen_cnt + closed_cnt
    event_bar_labels = [event_labels.get(e, e) for e in event_types]
    event_bar_values = [1] * len(event_types)
    results["tsk_seed_a03"] = {
        "scenario_node": "post_loan",
        "summary": (
            f"贷后额度调整影响面评估完成：共 {total_contracts} 份合同，"
            f"ACTIVE {active_cnt} 份，FROZEN {frozen_cnt} 份，CLOSED {closed_cnt} 份。"
            f"本期额度变更事件 {len(event_types)} 类，涉及{event_labels.get(event_types[0], event_types[0])}等操作。"
        ),
        "steps": [
            {"name": "数据拉取", "status": "done",
             "detail": f"从 sqlite_07 拉取 revolve_contract + limit_change_event，共 {total_contracts} 份合同"},
            {"name": "合同状态分布", "status": "done",
             "detail": f"ACTIVE: {active_cnt}，FROZEN: {frozen_cnt}，CLOSED: {closed_cnt}"},
            {"name": "额度变更事件分析", "status": "done",
             "detail": f"事件类型：{', '.join(event_types)}；触发原因：{', '.join(reason_codes)}"},
            {"name": "影响面评估", "status": "done",
             "detail": "DPD30 触发冻结 1 份，BEHAVIOR_GOOD 触发上调 1 份，RISK_POLICY 触发下调 1 份"},
        ],
        "metrics": {
            "total_contracts": total_contracts,
            "active_contracts": active_cnt,
            "frozen_contracts": frozen_cnt,
            "closed_contracts": closed_cnt,
            "limit_change_events": len(event_types),
        },
        "charts": [
            {
                "type": "bar",
                "title": "合同状态分布",
                "labels": ["ACTIVE", "FROZEN", "CLOSED"],
                "values": [active_cnt, frozen_cnt, closed_cnt],
            },
            {
                "type": "bar",
                "title": "额度变更事件类型分布",
                "labels": event_bar_labels,
                "values": event_bar_values,
            },
        ],
        "key_findings": [
            f"共 {total_contracts} 份合同，ACTIVE 占比 {active_cnt/total_contracts*100:.0f}%",
            f"DPD30 触发额度冻结 {frozen_cnt} 份，需关注逾期客群",
            f"BEHAVIOR_GOOD 触发额度上调 {active_cnt - 1 if active_cnt > 1 else 1} 份，策略正向激励有效",
        ],
        "next_actions": [
            "对 FROZEN 客群发起催收预警",
            "评估 ADJUST_DOWN 策略对支用转化率的影响",
        ],
        "task_description": "评估本期贷后额度调整策略的影响面，按合同状态和事件类型拆解",
    }

    # tsk_seed_a04：日报摘要（credit，简洁格式）
    results["tsk_seed_a04"] = {
        "scenario_node": "credit",
        "summary": (
            f"2025-06-09 授信节点日报：授信通过率 {credit_rate*100:.2f}%，"
            f"申请量 {apply_cnt} 笔，通过 {approved_cnt} 笔。无重大异常，指标平稳。"
        ),
        "steps": [
            {"name": "数据拉取", "status": "done", "detail": "拉取 2025-06-09 当日授信申请与结果数据"},
            {"name": "日报指标计算", "status": "done",
             "detail": f"授信通过率 {credit_rate*100:.2f}%，申请量 {apply_cnt}，通过 {approved_cnt}"},
            {"name": "异常检测", "status": "done", "detail": "与近 7 日均值对比，无显著偏差"},
            {"name": "日报生成", "status": "done", "detail": "生成标准日报摘要，口径已标注授信节点"},
        ],
        "metrics": {
            "credit_approval_rate": credit_rate,
            "apply_count": apply_cnt,
            "approved_count": approved_cnt,
            "date": "2025-06-09",
        },
        "charts": [
            {
                "type": "trend",
                "title": "近 7 日授信通过率趋势",
                "dates": ["2025-06-03", "2025-06-04", "2025-06-05",
                          "2025-06-06", "2025-06-07", "2025-06-08", "2025-06-09"],
                "values": [0.64, 0.65, 0.66, 0.65, 0.67, 0.66, credit_rate],
            },
        ],
        "key_findings": [
            f"2025-06-09 授信通过率 {credit_rate*100:.2f}%，与近 7 日均值（65.7%）基本持平",
            "无重大异常，指标平稳运行",
        ],
        "next_actions": [
            "持续监控，如次日通过率偏差超过 5% 则触发预警",
        ],
        "task_description": "生成 2025-06-09 授信节点日报摘要",
    }

    return results


# ─── 信审类演示结果构建 ────────────────────────────────────────────────────────

def build_review_results() -> dict[str, dict[str, Any]]:
    """构建 4 条 completed 信审任务的 result_json。"""
    results: dict[str, dict[str, Any]] = {}

    # tsk_seed_r01：C001 授信申请材料整理（credit）
    results["tsk_seed_r01"] = {
        "scenario_node": "credit",
        "summary": "C001 授信申请材料整理完成：共 3 份文件，缺失项 1 项（近三个月流水摘要），疑点 1 项（申请金额口径不一致）。",
        "steps": [
            {"name": "文件接收", "status": "done", "detail": "接收 3 份文件：身份证明、收入证明、银行流水"},
            {"name": "字段抽取", "status": "done", "detail": "抽取客户姓名、申请金额、月收入等 5 个关键字段"},
            {"name": "缺失项检查", "status": "done", "detail": "发现近三个月流水摘要缺失（高优先级）"},
            {"name": "疑点识别", "status": "done", "detail": "申请金额 100,000 元与收入证明描述存在差异"},
        ],
        "file_list": [
            {"name": "身份证明.pdf", "type": "pdf", "status": "processed"},
            {"name": "收入证明.pdf", "type": "pdf", "status": "processed"},
            {"name": "银行流水.xlsx", "type": "excel", "status": "processed"},
        ],
        "extracted_fields": [
            {"field": "客户姓名", "value": "C001", "confidence": 0.98},
            {"field": "申请金额", "value": "100,000 元", "confidence": 0.95},
            {"field": "月收入", "value": "15,000 元", "confidence": 0.87},
            {"field": "工作单位", "value": "某科技有限公司", "confidence": 0.82},
            {"field": "合同编号", "value": "RCT001", "confidence": 0.99},
        ],
        "missing_items": [
            {"item": "近三个月流水摘要", "priority": "high"},
        ],
        "risk_flags": [
            {"name": "申请金额口径不一致", "level": "HIGH",
             "reason": "申请金额 100,000 元与收入证明中描述的还款能力存在差异，建议复核"},
        ],
        "review_sheet": {
            "columns": ["文件", "缺失项数", "疑点数", "最高风险等级", "摘要"],
            "rows": [["C001 授信申请", 1, 1, "HIGH", "需补充流水摘要后复核"]],
        },
        "task_description": "请整理客户 C001 的授信申请材料，检查缺失项并识别疑点",
    }

    # tsk_seed_r02：C002 支用申请疑点识别（draw）
    results["tsk_seed_r02"] = {
        "scenario_node": "draw",
        "summary": "C002 支用申请疑点识别完成：共 2 份文件，缺失项 2 项，疑点 1 项（设备风险标记）。",
        "steps": [
            {"name": "文件接收", "status": "done", "detail": "接收 2 份文件：支用申请书、设备信息截图"},
            {"name": "字段抽取", "status": "done", "detail": "抽取支用金额、设备 ID、申请时间等 4 个字段"},
            {"name": "缺失项检查", "status": "done", "detail": "发现还款账户信息和用途说明缺失"},
            {"name": "疑点识别", "status": "done", "detail": "设备 IP 风险等级 HIGH，与历史申请设备不一致"},
        ],
        "file_list": [
            {"name": "支用申请书.pdf", "type": "pdf", "status": "processed"},
            {"name": "设备信息截图.png", "type": "image", "status": "processed"},
        ],
        "extracted_fields": [
            {"field": "客户编号", "value": "C002", "confidence": 0.99},
            {"field": "支用金额", "value": "30,000 元", "confidence": 0.93},
            {"field": "申请时间", "value": "2025-03-06 11:00:00", "confidence": 0.97},
            {"field": "设备风险等级", "value": "HIGH", "confidence": 0.91},
        ],
        "missing_items": [
            {"item": "还款账户信息", "priority": "high"},
            {"item": "支用用途说明", "priority": "medium"},
        ],
        "risk_flags": [
            {"name": "设备高风险", "level": "HIGH",
             "reason": "申请设备 IP 风险等级 HIGH，与客户历史申请设备不一致，疑似设备切换"},
        ],
        "review_sheet": {
            "columns": ["文件", "缺失项数", "疑点数", "最高风险等级", "摘要"],
            "rows": [["C002 支用申请", 2, 1, "HIGH", "设备风险需人工复核，补充还款账户后再审"]],
        },
        "task_description": "识别客户 C002 支用申请中的疑点，重点关注设备风险",
    }

    # tsk_seed_r03：C003 贷后续期材料审核（post_loan）
    results["tsk_seed_r03"] = {
        "scenario_node": "post_loan",
        "summary": "C003 贷后续期材料审核完成：共 2 份文件，无缺失项，疑点 1 项（额度下调背景需说明）。",
        "steps": [
            {"name": "文件接收", "status": "done", "detail": "接收 2 份文件：续期申请书、近期还款记录"},
            {"name": "字段抽取", "status": "done", "detail": "抽取合同编号、续期金额、还款记录等 5 个字段"},
            {"name": "缺失项检查", "status": "done", "detail": "材料齐全，无缺失项"},
            {"name": "疑点识别", "status": "done", "detail": "合同 RCT003 曾触发 RISK_POLICY 额度下调，需说明背景"},
        ],
        "file_list": [
            {"name": "续期申请书.pdf", "type": "pdf", "status": "processed"},
            {"name": "近期还款记录.xlsx", "type": "excel", "status": "processed"},
        ],
        "extracted_fields": [
            {"field": "客户编号", "value": "C003", "confidence": 0.99},
            {"field": "合同编号", "value": "RCT003", "confidence": 0.99},
            {"field": "续期申请金额", "value": "70,000 元", "confidence": 0.94},
            {"field": "近 6 月还款状态", "value": "正常", "confidence": 0.88},
            {"field": "到期日", "value": "2025-06-01", "confidence": 0.96},
        ],
        "missing_items": [],
        "risk_flags": [
            {"name": "历史额度下调记录", "level": "LOW",
             "reason": "合同 RCT003 于 2025-05-01 因 RISK_POLICY 触发额度下调，续期审核需关注背景原因"},
        ],
        "review_sheet": {
            "columns": ["文件", "缺失项数", "疑点数", "最高风险等级", "摘要"],
            "rows": [["C003 续期申请", 0, 1, "LOW", "材料齐全，低风险疑点，建议正常续期"]],
        },
        "task_description": "审核客户 C003 的贷后续期申请材料",
    }

    # tsk_seed_r04：C004 综合授信资料整理（general）
    results["tsk_seed_r04"] = {
        "scenario_node": "general",
        "summary": "C004 综合授信资料整理完成：共 4 份文件，缺失项 3 项，疑点 2 项（收入来源不明、负债率偏高）。",
        "steps": [
            {"name": "文件接收", "status": "done", "detail": "接收 4 份文件：身份证、收入证明、资产证明、征信报告"},
            {"name": "字段抽取", "status": "done", "detail": "抽取 8 个关键字段，置信度整体偏低（材料质量一般）"},
            {"name": "缺失项检查", "status": "done", "detail": "发现 3 项缺失：近三个月流水、工作证明、婚姻状况证明"},
            {"name": "疑点识别", "status": "done", "detail": "收入来源不明确，负债收入比 0.72 超过阈值 0.60"},
        ],
        "file_list": [
            {"name": "身份证正反面.jpg", "type": "image", "status": "processed"},
            {"name": "收入证明.pdf", "type": "pdf", "status": "processed"},
            {"name": "资产证明.pdf", "type": "pdf", "status": "processed"},
            {"name": "征信报告.pdf", "type": "pdf", "status": "processed"},
        ],
        "extracted_fields": [
            {"field": "客户姓名", "value": "C004", "confidence": 0.97},
            {"field": "申请金额", "value": "30,000 元", "confidence": 0.91},
            {"field": "月收入", "value": "8,000 元", "confidence": 0.72},
            {"field": "负债收入比", "value": "0.72", "confidence": 0.85},
            {"field": "征信评分", "value": "580", "confidence": 0.93},
            {"field": "历史逾期次数", "value": "2 次", "confidence": 0.88},
            {"field": "资产总额", "value": "120,000 元", "confidence": 0.68},
            {"field": "工作年限", "value": "3 年", "confidence": 0.75},
        ],
        "missing_items": [
            {"item": "近三个月银行流水", "priority": "high"},
            {"item": "工作单位证明", "priority": "high"},
            {"item": "婚姻状况证明", "priority": "medium"},
        ],
        "risk_flags": [
            {"name": "负债收入比超阈值", "level": "HIGH",
             "reason": "负债收入比 0.72，超过准入阈值 0.60，还款能力存疑"},
            {"name": "收入来源不明确", "level": "MEDIUM",
             "reason": "收入证明描述模糊，无法确认稳定收入来源，建议补充工资流水"},
        ],
        "review_sheet": {
            "columns": ["文件", "缺失项数", "疑点数", "最高风险等级", "摘要"],
            "rows": [["C004 综合授信", 3, 2, "HIGH", "缺失项较多，高风险疑点，建议补件后重新审核"]],
        },
        "task_description": "整理客户 C004 的综合授信申请资料，全面检查缺失项和疑点",
    }

    return results


# ─── 主函数 ───────────────────────────────────────────────────────────────────

def seed_all() -> None:
    print("正在重建 dev.db …")
    force_init_db()

    print("正在读取 sampledata 真实指标 …")
    m = load_real_metrics()

    analysis_results = build_analysis_results(m)
    review_results = build_review_results()

    # 分析类任务清单（9 条）
    analysis_tasks = [
        ("tsk_seed_a01", "analysis", "completed", "credit",
         "兴安贷+ 本周授信通过率变动分析（按渠道拆解）",
         "请分析兴安贷+ 本周授信通过率相对上周的变动，按渠道拆解。", 48.0, None),
        ("tsk_seed_a02", "analysis", "completed", "draw",
         "兴安贷+ 支用通过率异常归因",
         "分析兴安贷+ 支用通过率近期异常下降的原因，按拒绝原因拆解。", 36.0, None),
        ("tsk_seed_a03", "analysis", "completed", "post_loan",
         "贷后额度调整影响面评估",
         "评估本期贷后额度调整策略的影响面，按合同状态和事件类型拆解。", 24.0, None),
        ("tsk_seed_a04", "analysis", "completed", "credit",
         "日报摘要：2025-06-09 授信节点",
         "生成 2025-06-09 授信节点日报摘要。", 12.0, None),
        ("tsk_seed_a05", "analysis", "running", "draw",
         "兴安贷+ 坏账率趋势分析",
         "分析兴安贷+ 近三个月坏账率趋势，按支用节点拆解。", 3.0, None),
        ("tsk_seed_a06", "analysis", "waiting_user", "general",
         "渠道拒绝率对比分析",
         "对比各渠道拒绝率差异，识别高拒绝率渠道并分析原因。", 5.0, None),
        ("tsk_seed_a07", "analysis", "accepted", "draw",
         "支用额度利用率分析",
         "分析兴安贷+ 客户支用额度利用率分布，识别低利用率客群。", 2.0, None),
        ("tsk_seed_a08", "analysis", "created", "post_loan",
         "贷后逾期率月度报告",
         "生成 2025 年 5 月贷后逾期率月度报告，按逾期天数分层。", 0.5, None),
        ("tsk_seed_a09", "analysis", "failed", "credit",
         "授信通过率异常下降排查",
         "排查本周授信通过率异常下降的根因，重点关注规则变更影响。", 18.0,
         "数据源连接超时：sqlite_04 查询超过 30s，请检查数据库状态"),
    ]

    # 信审类任务清单（9 条）
    review_tasks = [
        ("tsk_seed_r01", "review", "completed", "credit",
         "客户 C001 授信申请材料整理",
         "请整理客户 C001 的授信申请材料，检查缺失项并识别疑点。", 72.0, None),
        ("tsk_seed_r02", "review", "completed", "draw",
         "C002 支用申请疑点识别",
         "识别客户 C002 支用申请中的疑点，重点关注设备风险。", 60.0, None),
        ("tsk_seed_r03", "review", "completed", "post_loan",
         "C003 贷后续期材料审核",
         "审核客户 C003 的贷后续期申请材料。", 48.0, None),
        ("tsk_seed_r04", "review", "completed", "general",
         "C004 综合授信资料整理",
         "整理客户 C004 的综合授信申请资料，全面检查缺失项和疑点。", 30.0, None),
        ("tsk_seed_r05", "review", "running", "draw",
         "C005 支用申请资料核查",
         "核查客户 C005 支用申请资料的完整性。", 2.0, None),
        ("tsk_seed_r06", "review", "waiting_user", "credit",
         "C006 授信材料补充确认",
         "确认客户 C006 补充提交的授信材料是否满足要求。", 6.0, None),
        ("tsk_seed_r07", "review", "accepted", "post_loan",
         "C007 贷后资料整理",
         "整理客户 C007 的贷后管理相关资料。", 1.5, None),
        ("tsk_seed_r08", "review", "created", "general",
         "C008 综合资料疑点排查",
         "对客户 C008 提交的综合资料进行疑点排查。", 0.3, None),
        ("tsk_seed_r09", "review", "failed", "draw",
         "C009 支用申请材料缺失检查",
         "检查客户 C009 支用申请材料的缺失情况。", 20.0,
         "文件解析失败：上传文件格式不支持或已损坏，请重新上传"),
    ]

    all_tasks = analysis_tasks + review_tasks
    result_count = 0

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        for (task_id, task_type, status, scenario_node,
             title, description, hours_ago, error_msg) in all_tasks:
            created_ts = ts(hours_ago + 0.5)
            updated_ts = ts(hours_ago)
            insert_task(conn, task_id, task_type, status, title, description,
                        scenario_node, created_ts, updated_ts, error_msg)

            # 插入 completed 任务的结果
            if status == "completed":
                if task_type == "analysis" and task_id in analysis_results:
                    r = analysis_results[task_id]
                    insert_result(conn, task_id, r["summary"], r)
                    result_count += 1
                elif task_type == "review" and task_id in review_results:
                    r = review_results[task_id]
                    insert_result(conn, task_id, r["summary"], r)
                    result_count += 1

            print(f"  ✓ {task_id}  {title}")

        conn.commit()
    finally:
        conn.close()

    print(f"\n共插入 {len(all_tasks)} 条任务，{result_count} 条结果")
    print("dev.db 已就绪，可启动后端服务查看演示数据。")


if __name__ == "__main__":
    seed_all()
