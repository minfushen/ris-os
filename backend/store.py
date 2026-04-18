"""风控管理 OS - 数据存储层"""

from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "dev.db"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """初始化数据库"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_conn() as conn:
        exists = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'"
        ).fetchone()
        if exists:
            return

        conn.executescript("""
            CREATE TABLE tasks (
                task_id TEXT PRIMARY KEY,
                task_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                title TEXT NOT NULL,
                description TEXT,
                scenario_node TEXT NOT NULL DEFAULT 'credit',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                error_message TEXT
            );

            CREATE TABLE task_results (
                task_id TEXT PRIMARY KEY REFERENCES tasks(task_id),
                summary TEXT,
                result_json TEXT,
                export_ref TEXT,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE task_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL REFERENCES tasks(task_id),
                event_type TEXT NOT NULL,
                payload_json TEXT,
                created_at TEXT NOT NULL
            );

            CREATE INDEX idx_tasks_status ON tasks(status);
            CREATE INDEX idx_tasks_type ON tasks(task_type);
            CREATE INDEX idx_tasks_updated ON tasks(updated_at);
        """)


def create_task(
    task_type: str,
    title: str,
    description: str,
    scenario_node: str,
) -> dict[str, Any]:
    """创建任务"""
    task_id = f"tsk_{uuid.uuid4().hex[:10]}"
    ts = now_iso()

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO tasks(task_id, task_type, status, title, description, scenario_node, created_at, updated_at)
            VALUES(?, ?, 'pending', ?, ?, ?, ?, ?)
            """,
            (task_id, task_type, title, description, scenario_node, ts, ts),
        )
        conn.execute(
            "INSERT INTO task_events(task_id, event_type, payload_json, created_at) VALUES(?, 'TASK_CREATED', ?, ?)",
            (task_id, json.dumps({"title": title}, ensure_ascii=False), ts),
        )

    return get_task(task_id)


def list_tasks(
    task_type: str | None = None,
    status: str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """查询任务列表"""
    sql = "SELECT * FROM tasks WHERE 1=1"
    params: list[Any] = []

    if task_type:
        sql += " AND task_type = ?"
        params.append(task_type)
    if status:
        sql += " AND status = ?"
        params.append(status)

    sql += " ORDER BY datetime(updated_at) DESC LIMIT ?"
    params.append(limit)

    with get_conn() as conn:
        rows = conn.execute(sql, params).fetchall()
        out = []
        for r in rows:
            summary = conn.execute(
                "SELECT summary FROM task_results WHERE task_id = ?", (r["task_id"],)
            ).fetchone()
            out.append({**dict(r), "summary": summary["summary"] if summary else None})
        return out


def get_task(task_id: str) -> dict[str, Any] | None:
    """获取单个任务"""
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
        return dict(row) if row else None


def get_result(task_id: str) -> dict[str, Any] | None:
    """获取任务结果"""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM task_results WHERE task_id = ?", (task_id,)
        ).fetchone()
        if not row:
            return None
        d = dict(row)
        d["result"] = json.loads(d.pop("result_json"))
        return d


def upsert_result(
    task_id: str,
    summary: str,
    result: dict[str, Any],
    export_ref: str | None = None,
) -> None:
    """保存任务结果"""
    ts = now_iso()
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO task_results(task_id, summary, result_json, export_ref, updated_at)
            VALUES(?, ?, ?, ?, ?)
            ON CONFLICT(task_id) DO UPDATE SET
              summary=excluded.summary,
              result_json=excluded.result_json,
              export_ref=excluded.export_ref,
              updated_at=excluded.updated_at
            """,
            (task_id, summary, json.dumps(result, ensure_ascii=False), export_ref, ts),
        )


def set_task_status(
    task_id: str,
    status: str,
    *,
    error_message: str | None = None,
    event_type: str | None = None,
    payload: dict[str, Any] | None = None,
) -> None:
    """更新任务状态"""
    ts = now_iso()
    with get_conn() as conn:
        conn.execute(
            "UPDATE tasks SET status = ?, updated_at = ?, error_message = ? WHERE task_id = ?",
            (status, ts, error_message, task_id),
        )
        if event_type:
            conn.execute(
                "INSERT INTO task_events(task_id, event_type, payload_json, created_at) VALUES(?, ?, ?, ?)",
                (task_id, event_type, json.dumps(payload or {}, ensure_ascii=False), ts),
            )


def fetch_next_pending_task() -> dict[str, Any] | None:
    """获取下一个待处理任务"""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM tasks WHERE status='pending' ORDER BY datetime(created_at) ASC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def get_task_events(task_id: str, limit: int = 50) -> list[dict[str, Any]]:
    """获取任务事件列表"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM task_events WHERE task_id = ? ORDER BY datetime(created_at) ASC LIMIT ?",
            (task_id, limit),
        ).fetchall()
        out = []
        for r in rows:
            d = dict(r)
            d["payload"] = json.loads(d.pop("payload_json"))
            out.append(d)
        return out
