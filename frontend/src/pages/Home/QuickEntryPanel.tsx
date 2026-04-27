import { Typography, Row, Col, Segmented, Tag, Space, Button } from "antd";
import {
  ThunderboltOutlined,
  ExperimentOutlined,
  ControlOutlined,
  AuditOutlined,
  SearchOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  useWorkbenchRoleStore,
  WORKBENCH_ROLE_LABELS,
  type WorkbenchRole,
} from "@/store/workbenchRoleStore";

const ROLE_ORDER: WorkbenchRole[] = ["strategy", "qa", "ops", "manager"];

const { Text } = Typography;

type EntryKind = "launch" | "goto";

/** 与 tokens.css 中 --accent-entry-* 对应，避免在数据里写死 hex */
type QuickEntryAccent = "primary" | "primaryDeep" | "success" | "warning" | "danger" | "muted" | "purple" | "soft";

const ACCENT_COLOR: Record<QuickEntryAccent, string> = {
  primary: "var(--accent-entry-primary)",
  primaryDeep: "var(--accent-entry-primary-deep)",
  success: "var(--accent-entry-success)",
  warning: "var(--accent-entry-warning)",
  danger: "var(--accent-entry-danger)",
  muted: "var(--accent-entry-muted)",
  purple: "var(--accent-entry-purple)",
  soft: "var(--color-primary-light)",
};

const ACCENT_SOFT_BG: Record<QuickEntryAccent, string> = {
  primary: "var(--color-primary-bg)",
  primaryDeep: "var(--color-primary-bg-hover)",
  success: "var(--color-success-bg)",
  warning: "var(--color-warning-bg)",
  danger: "var(--color-error-bg)",
  muted: "var(--color-bg-interactive-hover)",
  purple: "color-mix(in srgb, var(--color-purple) 12%, transparent)",
  soft: "var(--color-primary-bg)",
};

interface QuickEntryDef {
  id: string;
  kind: EntryKind;
  /** launch 时交给首页打开抽屉或等价动作 */
  launchKey?: string;
  /** goto 时路由 path（Browser Router 普通路径） */
  gotoPath?: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: QuickEntryAccent;
  /** 空数组表示所有角色可见 */
  roles: WorkbenchRole[];
}

const ENTRIES: QuickEntryDef[] = [
  {
    id: "launch-analysis",
    kind: "launch",
    launchKey: "analysis",
    label: "发起 · 归因分析",
    description: "从异常直接建单",
    icon: <ThunderboltOutlined />,
    accent: "primary",
    roles: ["strategy", "qa", "ops", "manager"],
  },
  {
    id: "goto-reports",
    kind: "goto",
    gotoPath: "/monitor/reports",
    label: "进入 · 报表中心",
    description: "浏览历史与口径",
    icon: <LineChartOutlined />,
    accent: "success",
    roles: ["strategy", "ops", "manager"],
  },
  {
    id: "launch-backtest",
    kind: "launch",
    launchKey: "backtest",
    label: "发起 · 仿真回溯",
    description: "离线样本验证",
    icon: <ExperimentOutlined />,
    accent: "primaryDeep",
    roles: ["strategy", "ops"],
  },
  {
    id: "goto-backtest",
    kind: "goto",
    gotoPath: "/strategy/backtest",
    label: "进入 · 仿真回溯",
    description: "查看历史任务与模板",
    icon: <UnorderedListOutlined />,
    accent: "muted",
    roles: ["strategy", "manager"],
  },
  {
    id: "goto-publish",
    kind: "goto",
    gotoPath: "/strategy/publish",
    label: "进入 · 策略发布审批",
    description: "审批流与版本",
    icon: <ControlOutlined />,
    accent: "primary",
    roles: ["strategy", "manager"],
  },
  {
    id: "launch-inspection",
    kind: "launch",
    launchKey: "inspection",
    label: "发起 · 复盘质检",
    description: "建抽检工单",
    icon: <AuditOutlined />,
    accent: "warning",
    roles: ["qa", "ops"],
  },
  {
    id: "goto-inspection",
    kind: "goto",
    gotoPath: "/risk/inspection",
    label: "进入 · 复盘与质检",
    description: "队列与报告",
    icon: <AuditOutlined />,
    accent: "soft",
    roles: ["qa", "manager"],
  },
  {
    id: "goto-fraud",
    kind: "goto",
    gotoPath: "/risk/workbench",
    label: "进入 · 预警核查工作台",
    description: "预警案件与调查视图",
    icon: <SearchOutlined />,
    accent: "danger",
    roles: ["ops", "qa", "manager"],
  },
  {
    id: "goto-dashboard",
    kind: "goto",
    gotoPath: "/monitor/dashboard",
    label: "进入 · 预警大盘",
    description: "态势总览",
    icon: <DashboardOutlined />,
    accent: "primary",
    roles: ["manager", "ops"],
  },
  {
    id: "goto-labeling",
    kind: "goto",
    gotoPath: "/monitor/labeling",
    label: "进入 · 标注飞轮",
    description: "样本池、自动回流与 MLOps",
    icon: <TagsOutlined />,
    accent: "purple",
    roles: ["strategy", "qa", "manager"],
  },
  {
    id: "goto-dictionary",
    kind: "goto",
    gotoPath: "/data/dictionary",
    label: "进入 · 数据源管理",
    description: "变量与血缘",
    icon: <DatabaseOutlined />,
    accent: "success",
    roles: ["strategy", "ops", "manager"],
  },
];

interface QuickEntryPanelProps {
  onLaunch?: (key: string) => void;
  onGoto?: (path: string) => void;
}

export default function QuickEntryPanel({ onLaunch, onGoto }: QuickEntryPanelProps) {
  const role = useWorkbenchRoleStore((s) => s.role);
  const setRole = useWorkbenchRoleStore((s) => s.setRole);

  const visible = ENTRIES.filter((e) => e.roles.length === 0 || e.roles.includes(role));

  const handleCard = (entry: QuickEntryDef) => {
    if (entry.kind === "launch" && entry.launchKey) {
      onLaunch?.(entry.launchKey);
      return;
    }
    if (entry.kind === "goto" && entry.gotoPath) {
      onGoto?.(entry.gotoPath);
    }
  };

  return (
    <section className="section-shell">
      <div className="section-header flex flex-wrap items-center justify-between gap-2">
        <div>
          <Text className="section-title">快捷入口</Text>
          <Text className="section-subtitle ml-2">按岗位展示；区分发起与进入模块（P1 Q1/Q2）</Text>
        </div>
        <Space wrap align="center">
          <Text className="text-xs text-text-muted">当前视角</Text>
          <Segmented<WorkbenchRole>
            size="small"
            value={role}
            onChange={(v) => setRole(v as WorkbenchRole)}
            options={ROLE_ORDER.map((k) => ({
              label: WORKBENCH_ROLE_LABELS[k],
              value: k,
            }))}
          />
        </Space>
      </div>
      <div className="section-body">
        <Row gutter={[12, 12]}>
          {visible.map((entry) => (
            <Col span={8} key={entry.id}>
              <div
                className="quick-entry-card group cursor-pointer"
                onClick={() => handleCard(entry)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCard(entry);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div
                  className="quick-entry-icon"
                  style={{ color: ACCENT_COLOR[entry.accent], backgroundColor: ACCENT_SOFT_BG[entry.accent] }}
                >
                  {entry.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap mb-0.5">
                    <Text strong className="text-sm text-text-primary">
                      {entry.label}
                    </Text>
                    <Tag className="text-[10px] m-0" color={entry.kind === "launch" ? "blue" : "default"}>
                      {entry.kind === "launch" ? "发起" : "进入"}
                    </Tag>
                  </div>
                  <Text className="text-xs text-text-muted">{entry.description}</Text>
                  <div className="mt-1">
                    <Button type="link" size="small" className="!p-0 !h-auto text-xs" onClick={(e) => { e.stopPropagation(); handleCard(entry); }}>
                      {entry.kind === "launch" ? "立即发起" : "打开模块"}
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
