-- 风控虾 V2 · Backend 最小闭环 Schema（SQLite）
-- 对齐：风控虾-V2-PRD §13/§14，先支持 analysis/review 两类任务。

PRAGMA foreign_keys = ON;

-- 可重复初始化
DROP TABLE IF EXISTS task_events;
DROP TABLE IF EXISTS task_results;
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  task_id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('analysis', 'review')),
  status TEXT NOT NULL CHECK (status IN ('created', 'accepted', 'running', 'waiting_user', 'completed', 'failed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scenario_node TEXT NOT NULL DEFAULT 'general' CHECK (scenario_node IN ('credit', 'draw', 'post_loan', 'general')),
  scorecard_project_id TEXT,
  created_by TEXT NOT NULL DEFAULT 'demo-user',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_tasks_type_status_created_at ON tasks(task_type, status, created_at DESC);
CREATE INDEX idx_tasks_created_by_created_at ON tasks(created_by, created_at DESC);

CREATE TABLE task_results (
  task_id TEXT PRIMARY KEY,
  summary TEXT NOT NULL,
  result_json TEXT NOT NULL,
  export_ref TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

CREATE TABLE task_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

CREATE INDEX idx_task_events_task_id_created_at ON task_events(task_id, created_at DESC);

-- 可选：最小演示数据（注释掉，按需开启）
-- INSERT INTO tasks (
--   task_id, task_type, status, title, description, scenario_node, created_by, created_at, updated_at
-- ) VALUES (
--   'tsk_demo_001', 'analysis', 'created', '本周授信通过率变动分析',
--   '请分析兴安贷+ 本周授信通过率相对上周的变动，按渠道拆解。',
--   'credit', 'demo-user', datetime('now'), datetime('now')
-- );
