import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tooltip,
  Pagination,
  Empty,
  Tabs,
  Tag,
  Dropdown,
  App,
} from "antd";
import type { MenuProps } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  AuditOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { TaskStatus, TaskType, ScenarioNode } from "@/types";
import { isBacklogStatus } from "@/utils/workbenchStats";
import { writeWorkbenchReturnQs } from "@/utils/workbenchUrl";
import FilterBar, { type FilterState } from "./FilterBar";
import CreateTaskMenu from "./CreateTaskMenu";

const { Text } = Typography;

type TaskRow = {
  task_id: string;
  task_type: TaskType;
  status: TaskStatus;
  title: string;
  scenario_node: string;
  created_at: string;
  updated_at: string;
  initiator?: string;
  trigger?: string;
};

interface TaskDataGridProps {
  tasks: TaskRow[];
  loading?: boolean;
  onRefresh: () => void;
  onCreateTask: (type: TaskType) => void;
  /** 当前列表是否为演示数据（无真实 API 数据或接口失败降级） */
  isDemoData?: boolean;
  /** 探照灯「发起」等创建后置顶高亮（P1 S4） */
  highlightTaskId?: string | null;
  onHighlightConsumed?: () => void;
  /** 行内「处理」：进入处置抽屉/详情（由首页注入） */
  onProcessTask?: (row: TaskRow) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { color: string; icon: React.ReactNode; text: string }> = {
  created: { color: "#6e7c84", icon: <ClockCircleOutlined />, text: "已创建" },
  accepted: { color: "#6e7c84", icon: <ClockCircleOutlined />, text: "已接单" },
  running: { color: "#6f8f95", icon: <LoadingOutlined />, text: "运行中" },
  waiting_user: { color: "#4f6970", icon: <AuditOutlined />, text: "待确认" },
  pending: { color: "#6e7c84", icon: <ClockCircleOutlined />, text: "待处理" },
  processing: { color: "#6f8f95", icon: <LoadingOutlined />, text: "处理中" },
  reviewing: { color: "#4f6970", icon: <AuditOutlined />, text: "待复核" },
  completed: { color: "#5f9b7a", icon: <CheckCircleOutlined />, text: "已完成" },
  rejected: { color: "#c77b78", icon: <CloseCircleOutlined />, text: "已驳回" },
  failed: { color: "#c77b78", icon: <CloseCircleOutlined />, text: "已失败" },
};

const MODULE_ENTRY: Record<
  TaskType,
  { path: string; actionLabel: string; processingLabel: string; pendingLabel: string }
> = {
  analysis: {
    path: "/monitor/reports",
    actionLabel: "进入报告中心",
    processingLabel: "查看分析模块",
    pendingLabel: "进入分析模块",
  },
  backtest: {
    path: "/strategy/backtest",
    actionLabel: "进入回测中心",
    processingLabel: "查看回测中心",
    pendingLabel: "进入回测中心",
  },
  strategy: {
    path: "/strategy/list",
    actionLabel: "进入策略中心",
    processingLabel: "查看策略中心",
    pendingLabel: "进入策略中心",
  },
  inspection: {
    path: "/risk/inspection",
    actionLabel: "进入抽检中心",
    processingLabel: "查看抽检中心",
    pendingLabel: "进入抽检中心",
  },
  fraud: {
    path: "/risk/fraud",
    actionLabel: "进入排查中心",
    processingLabel: "查看排查中心",
    pendingLabel: "进入排查中心",
  },
  review: {
    path: "/risk/inspection",
    actionLabel: "进入核查中心",
    processingLabel: "查看核查中心",
    pendingLabel: "进入核查中心",
  },
};

function isSameLocalDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function buildWorkbenchSearchParams(args: {
  tab: "mine" | "all";
  filters: FilterState | null;
  completedTodayOnly: boolean;
  wqShortcut: string | null;
}): URLSearchParams {
  const p = new URLSearchParams();
  if (args.wqShortcut) {
    p.set("wq", args.wqShortcut);
  } else if (args.completedTodayOnly) {
    p.set("wq", "completed_today");
  }
  if (args.tab === "all") p.set("tab", "all");
  const f = args.filters;
  if (f?.scenario) p.set("scenario", f.scenario);
  if (f?.status) p.set("status", f.status);
  if (f?.taskType) p.set("tt", f.taskType);
  if (f?.keyword) p.set("q", f.keyword);
  return p;
}

export default function TaskDataGrid({
  tasks,
  loading = false,
  onRefresh: _onRefresh,
  onCreateTask,
  isDemoData = false,
  highlightTaskId,
  onHighlightConsumed,
  onProcessTask,
}: TaskDataGridProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<"mine" | "all">("mine");
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [currentPage, setCurrentPage] = useState(1);
  const [remoteSeed, setRemoteSeed] = useState<Partial<FilterState> | null>(null);
  const [remoteSeedVersion, setRemoteSeedVersion] = useState(0);
  const [completedTodayOnly, setCompletedTodayOnly] = useState(false);
  const [wqShortcut, setWqShortcut] = useState<string | null>(null);
  const lastFiltersRef = useRef<FilterState | null>(null);

  const pageSize = 15;

  const baseTasks = useMemo(
    () => (tab === "mine" ? tasks.filter((t) => isBacklogStatus(t.status)) : tasks),
    [tasks, tab]
  );

  function applyClientFilters(source: TaskRow[], filters: FilterState, todayOnly: boolean) {
    let filtered = [...source];
    if (filters.scenario) filtered = filtered.filter((t) => t.scenario_node === filters.scenario);
    if (filters.status) filtered = filtered.filter((t) => t.status === filters.status);
    if (filters.taskType) filtered = filtered.filter((t) => t.task_type === filters.taskType);
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(kw) || t.task_id.toLowerCase().includes(kw)
      );
    }
    if (todayOnly) {
      filtered = filtered.filter((t) => t.status === "completed" && isSameLocalDay(t.updated_at));
    }
    return filtered;
  }

  const pushUrl = (next: { tab: "mine" | "all"; filters: FilterState | null; completedToday: boolean; wq: string | null }) => {
    const p = buildWorkbenchSearchParams({
      tab: next.tab,
      filters: next.filters,
      completedTodayOnly: next.completedToday,
      wqShortcut: next.wq,
    });
    setSearchParams(p, { replace: true });
  };

  useEffect(() => {
    const raw = searchParams.toString();
    writeWorkbenchReturnQs(raw ? `?${raw}` : "");
  }, [searchParams]);

  useEffect(() => {
    const f = lastFiltersRef.current;
    if (f) {
      const todayOnly = completedTodayOnly && f.status === "completed";
      setFilteredTasks(applyClientFilters(baseTasks, f, todayOnly));
    } else {
      setFilteredTasks(baseTasks);
    }
    setCurrentPage(1);
  }, [baseTasks, completedTodayOnly]);

  useEffect(() => {
    const wq = searchParams.get("wq");
    const tabParam = searchParams.get("tab");
    if (tabParam === "all") setTab("all");
    else if (tabParam === "mine") setTab("mine");

    const scenario = searchParams.get("scenario") as ScenarioNode | null;
    const status = searchParams.get("status") as TaskStatus | null;
    const tt = searchParams.get("tt") as TaskType | null;
    const q = searchParams.get("q") ?? "";

    const wqMap: Record<string, Partial<FilterState>> = {
      pending: { status: "pending" },
      processing: { status: "processing" },
      reviewing: { status: "reviewing" },
      completed_today: { status: "completed" },
    };

    if (wq && wqMap[wq]) {
      const seed: Partial<FilterState> = {
        ...wqMap[wq],
        ...(scenario ? { scenario } : {}),
        ...(tt ? { taskType: tt } : {}),
        ...(q ? { keyword: q } : {}),
      };
      setWqShortcut(wq);
      setCompletedTodayOnly(wq === "completed_today");
      if (wq === "completed_today") setTab("all");
      setRemoteSeed(seed);
      setRemoteSeedVersion((v) => v + 1);
      return;
    }

    setWqShortcut(null);
    const flat: Partial<FilterState> = {};
    if (scenario) flat.scenario = scenario;
    if (status) flat.status = status;
    if (tt) flat.taskType = tt;
    if (q) flat.keyword = q;

    if (Object.keys(flat).length > 0) {
      setCompletedTodayOnly(false);
      setRemoteSeed(flat);
      setRemoteSeedVersion((v) => v + 1);
    } else {
      setCompletedTodayOnly(false);
      setRemoteSeed(null);
      setRemoteSeedVersion((v) => v + 1);
    }
  }, [searchParams]);

  const handleFilter = (filters: FilterState, source?: "user" | "remote") => {
    if (filters.status !== "completed") {
      setCompletedTodayOnly(false);
    }
    lastFiltersRef.current = filters;
    const todayOnly = completedTodayOnly && filters.status === "completed";
    setFilteredTasks(applyClientFilters(baseTasks, filters, todayOnly));
    setCurrentPage(1);
    if (source === "user") {
      setWqShortcut(null);
      pushUrl({
        tab,
        filters,
        completedToday: completedTodayOnly && filters.status === "completed",
        wq: null,
      });
    }
  };

  const handleReset = () => {
    setCompletedTodayOnly(false);
    lastFiltersRef.current = null;
    setRemoteSeed(null);
    setWqShortcut(null);
    setSearchParams(new URLSearchParams(), { replace: true });
    setFilteredTasks(baseTasks);
    setCurrentPage(1);
  };

  const orderedTasks = useMemo(() => {
    let list = [...filteredTasks];
    if (highlightTaskId) {
      const i = list.findIndex((t) => t.task_id === highlightTaskId);
      if (i > 0) {
        const [x] = list.splice(i, 1);
        list.unshift(x);
      }
    }
    return list;
  }, [filteredTasks, highlightTaskId]);

  useEffect(() => {
    if (!highlightTaskId) return;
    const t = window.setTimeout(() => {
      const row = document.querySelector(`[data-row-key="${highlightTaskId}"]`);
      row?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    const clear = window.setTimeout(() => onHighlightConsumed?.(), 8000);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(clear);
    };
  }, [highlightTaskId, onHighlightConsumed]);

  const paginatedTasks = orderedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      title: "任务ID",
      dataIndex: "task_id",
      key: "task_id",
      width: 88,
      fixed: "left" as const,
      render: (id: string) => (
        <Text code style={{ fontSize: 11, cursor: "pointer" }}>
          {id}
        </Text>
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
      render: (title: string) => (
        <Tooltip title={title}>
          <Text style={{ fontSize: 12 }}>{title}</Text>
        </Tooltip>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 88,
      render: (status: TaskStatus) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return (
          <Space size={4}>
            <span style={{ color: config.color, fontSize: 12 }}>{config.icon}</span>
            <Text style={{ fontSize: 11, color: config.color }}>{config.text}</Text>
          </Space>
        );
      },
    },
    {
      title: "触发/发起人",
      key: "initiator",
      width: 100,
      render: (_: unknown, record: TaskRow) => (
        <Tooltip title={record.trigger || "手动发起"}>
          <Text style={{ fontSize: 11 }}>{record.initiator || "-"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 100,
      render: (time: string) => {
        const d = new Date(time);
        return (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {`${d.getMonth() + 1}`.padStart(2, "0")}-{d.getDate().toString().padStart(2, "0")}{" "}
            {d.getHours().toString().padStart(2, "0")}:{d.getMinutes().toString().padStart(2, "0")}
          </Text>
        );
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: unknown, record: TaskRow) => {
        const moduleEntry = MODULE_ENTRY[record.task_type] ?? MODULE_ENTRY.analysis;
        const actionText =
          record.status === "completed"
            ? moduleEntry.actionLabel
            : record.status === "processing"
              ? moduleEntry.processingLabel
              : moduleEntry.pendingLabel;

        const moreItems: MenuProps["items"] = [
          {
            key: "module",
            label: actionText,
            onClick: () => navigate(`${moduleEntry.path}?focusTask=${encodeURIComponent(record.task_id)}`),
          },
          {
            key: "copy",
            label: "复制任务 ID",
            onClick: () => {
              void navigator.clipboard.writeText(record.task_id).then(() => {
                void message.success("已复制");
              });
            },
          },
        ];

        return (
          <Space size={4}>
            <Button
              type="link"
              size="small"
              style={{ padding: "0 4px", fontSize: 11 }}
              onClick={() =>
                onProcessTask
                  ? onProcessTask(record)
                  : navigate(`${moduleEntry.path}?focusTask=${encodeURIComponent(record.task_id)}`)
              }
            >
              处理
            </Button>
            <Dropdown menu={{ items: moreItems }} trigger={["click"]}>
              <Button type="link" size="small" style={{ padding: "0 4px", fontSize: 11 }}>
                更多 <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const emptyDescription =
    tab === "mine"
      ? isDemoData
        ? "「我的待办」暂无未完成项（当前为演示数据时可切换「全部」查看示例）"
        : "暂无未完成工作项，可在上方发起归因/信审或切换「全部」"
      : isDemoData
        ? "当前为演示数据；连接后端并创建任务后将显示真实列表"
        : "暂无任务，请使用右上角「新建」发起首条任务";

  return (
    <section id="work-queue" className="section-shell">
      <div className="section-header flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Text className="section-title">工作项中心</Text>
          {isDemoData ? (
            <Tag color="warning" className="m-0 text-xs">
              演示数据
            </Tag>
          ) : (
            <Tag color="success" className="m-0 text-xs">
              真实数据
            </Tag>
          )}
        </div>
        <Tabs
          size="small"
          activeKey={tab}
          onChange={(k) => {
            const next = k as "mine" | "all";
            lastFiltersRef.current = null;
            setTab(next);
            setCompletedTodayOnly(false);
            setWqShortcut(null);
            pushUrl({ tab: next, filters: null, completedToday: false, wq: null });
          }}
          className="!mb-0 min-w-[200px]"
          items={[
            { key: "mine", label: `我的待办 (${tasks.filter((t) => isBacklogStatus(t.status)).length})` },
            { key: "all", label: "全部" },
          ]}
        />
      </div>

      <div className="section-body p-0">
        <div className="flex justify-between items-center px-3 border-b border-border-soft">
          <FilterBar
            key={searchParams.toString() || "empty"}
            onFilter={handleFilter}
            onReset={handleReset}
            remoteSeed={remoteSeed}
            remoteSeedVersion={remoteSeedVersion}
          />
          <CreateTaskMenu onSelect={onCreateTask} />
        </div>

        <Table<TaskRow>
          dataSource={paginatedTasks}
          columns={columns}
          rowKey="task_id"
          loading={loading}
          size="small"
          pagination={false}
          scroll={{ x: 760 }}
          style={{ fontSize: 12 }}
          rowClassName={(record) =>
            record.task_id === highlightTaskId ? "bg-primary/10 ring-1 ring-inset ring-primary/25" : ""
          }
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} className="py-8" />
            ),
          }}
        />

        <div className="flex justify-between items-center px-3 py-2 border-t border-border-soft bg-glass/40">
          <Text type="secondary" style={{ fontSize: 11 }}>
            共 {filteredTasks.length} 条
            {completedTodayOnly ? "（仅今日已完成）" : ""}
            {wqShortcut ? ` · 总览快捷：${wqShortcut}` : ""}
          </Text>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={orderedTasks.length}
            onChange={setCurrentPage}
            size="small"
            showSizeChanger={false}
            showQuickJumper
          />
        </div>
      </div>
    </section>
  );
}
