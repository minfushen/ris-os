"""信审处理服务"""

from __future__ import annotations

from pathlib import Path

UPLOAD_ROOT = Path(__file__).resolve().parents[1] / "uploads"

# 文件后缀 → 类型映射
_EXT_TYPE: dict[str, str] = {
    ".pdf": "pdf",
    ".csv": "csv",
    ".xlsx": "excel",
    ".xls": "excel",
    ".txt": "txt",
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
}


def _get_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return _EXT_TYPE.get(ext, "other")


def _scan_files(task_id: str) -> list[dict]:
    """扫描上传的文件"""
    task_dir = UPLOAD_ROOT / task_id
    if not task_dir.exists():
        return []

    files = []
    for f in sorted(task_dir.iterdir()):
        if f.is_file():
            files.append({
                "name": f.name,
                "type": _get_file_type(f.name),
            })
    return files


def _check_materials(files: list[dict]) -> dict[str, bool]:
    """检查材料完整性"""
    flags = {
        "has_id": False,
        "has_bank_statement": False,
        "has_application": False,
    }

    for f in files:
        name = f["name"].lower()
        if any(kw in name for kw in ("身份证", "id", "证件")):
            flags["has_id"] = True
        if any(kw in name for kw in ("流水", "statement", "银行")):
            flags["has_bank_statement"] = True
        if any(kw in name for kw in ("申请", "application")):
            flags["has_application"] = True

    return flags


def _build_missing_items(flags: dict[str, bool]) -> list[dict]:
    """生成缺失项清单"""
    items = []
    if not flags["has_id"]:
        items.append({"item": "身份证明", "priority": "high"})
    if not flags["has_bank_statement"]:
        items.append({"item": "银行流水", "priority": "medium"})
    if not flags["has_application"]:
        items.append({"item": "申请表", "priority": "medium"})
    return items


def _build_risk_flags(files: list[dict], flags: dict[str, bool]) -> list[dict]:
    """生成疑点清单"""
    risk_flags = []

    if not files:
        risk_flags.append({
            "name": "无上传材料",
            "level": "HIGH",
            "reason": "未收到任何上传文件",
        })
        return risk_flags

    if not flags["has_id"]:
        risk_flags.append({
            "name": "缺少身份证明",
            "level": "HIGH",
            "reason": "未检测到身份证件材料",
        })

    if len(files) > 10:
        risk_flags.append({
            "name": "材料过多",
            "level": "LOW",
            "reason": f"共 {len(files)} 个文件，建议人工复核",
        })

    return risk_flags


def process_review(task_id: str, description: str, scenario_node: str) -> tuple[str, dict]:
    """处理信审任务，返回 (摘要, 结果字典)"""
    # 1. 扫描文件
    files = _scan_files(task_id)

    # 2. 检查材料
    flags = _check_materials(files)

    # 3. 生成缺失项
    missing_items = _build_missing_items(flags)

    # 4. 生成疑点
    risk_flags = _build_risk_flags(files, flags)

    # 5. 生成审核辅助表
    review_sheet = {
        "columns": ["文件名", "缺失项数", "疑点数", "最高风险"],
        "rows": [
            [f["name"], len(missing_items), len(risk_flags), risk_flags[0]["level"] if risk_flags else "—"]
            for f in files
        ] or [["（无文件）", len(missing_items), len(risk_flags), "HIGH"]],
    }

    # 6. 生成摘要
    file_count = len(files)
    summary = f"信审完成：{file_count} 个文件，{len(missing_items)} 项缺失，{len(risk_flags)} 个疑点"

    result = {
        "scenario_node": scenario_node,
        "file_count": file_count,
        "files": files,
        "missing_items": missing_items,
        "risk_flags": risk_flags,
        "review_sheet": review_sheet,
        "key_findings": [
            f"共 {file_count} 个文件" if file_count > 0 else "未上传材料",
            f"缺失 {len(missing_items)} 项材料",
            f"发现 {len(risk_flags)} 个疑点",
        ],
        "next_actions": [item["item"] for item in missing_items[:3]] or ["确认材料完整"],
    }

    return summary, result
