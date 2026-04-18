import { useState, useEffect } from "react";
import { Typography, Space, Button, Tag, Badge, Tooltip } from "antd";
import {
  SearchOutlined,
  WarningOutlined,
  AlertOutlined,
  ApiOutlined,
  SyncOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useMockRealtimePush, type RealtimeAlert } from "@/hooks/useRealtimePush";

const { Text } = Typography;

const LEVEL_CONFIG = {
  high: { color: "#c77b78", icon: <AlertOutlined />, text: "高危", borderClass: "border-l-accent-danger" },
  medium: { color: "#d7a85f", icon: <WarningOutlined />, text: "警告", borderClass: "border-l-accent-warning" },
  low: { color: "#5f9b7a", icon: <SearchOutlined />, text: "提示", borderClass: "border-l-accent-success" },
};

type WorkflowState = "unread" | "claimed" | "snoozed" | "closed";

const ALERT_ACTIONS: Record<
  RealtimeAlert["type"],
  { typeLabel: string; primary: string; secondary?: string; slaBudgetMin: number }
> = {
  gang: { typeLabel: "团伙探测", primary: "发起归因", secondary: "查看图谱", slaBudgetMin: 30 },
  false_reject: { typeLabel: "误杀预警", primary: "发起捞回分析", secondary: "查看详情", slaBudgetMin: 60 },
  psi_drift: { typeLabel: "特征漂移", primary: "发起归因", secondary: "查看详情", slaBudgetMin: 120 },
  throughput_drop: { typeLabel: "通过率下降", primary: "发起归因", secondary: "查看渠道拆解", slaBudgetMin: 45 },
};

const INITIAL_ITEMS: RealtimeAlert[] = [
  {
    id: "SL001",
    type: "gang",
    level: "high",
    title: "团伙探测：API-04 渠道",
    description: "发现 12 个高度相似设备组",
    timestamp: new Date().toISOString(),
    metadata: { channel: "API-04", count: 12 },
  },
  {
    id: "SL002",
    type: "false_reject",
    level: "medium",
    title: "误杀预警：经营贷产品",
    description: "24% 拒件在外部借贷成功",
    timestamp: new Date().toISOString(),
    metadata: { product: "经营贷", rate: 24 },
  },
  {
    id: "SL003",
    type: "gang",
    level: "high",
    title: "团伙探测：H5渠道",
    description: "发现 8 个关联IP异常申请",
    timestamp: new Date().toISOString(),
    metadata: { channel: "H5", count: 8 },
  },
];

function formatSlaLine(timestamp: string, slaBudgetMin: number): string {
  const elapsedMin = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60_000));
  const remain = Math.max(0, slaBudgetMin - elapsedMin);
  return `已持续 ${elapsedMin}m · 响应 SLA 剩余 ${remain}m（演示）`;
}

function renderWorkflowTag(st: WorkflowState) {
  switch (st) {
    case "unread":
      return (
        <Tag icon={<BellOutlined />} color="default" className="text-[10px] m-0">
          未读
        </Tag>
      );
    case "claimed":
      return (
        <Tag color="processing" className="text-[10px] m-0">
          已认领
        </Tag>
      );
    case "snoozed":
      return (
        <Tag icon={<ClockCircleOutlined />} color="warning" className="text-[10px] m-0">
          已稍后
        </Tag>
      );
    case "closed":
      return (
        <Tag icon={<CloseCircleOutlined />} className="text-[10px] m-0">
          已关闭
        </Tag>
      );
    default:
      return null;
  }
}

interface SearchlightProps {
  onAction?: (itemId: string, action: string) => void;
  /** 稍后处理：进入工作项队列（演示为合成待办） */
  onSnoozeToQueue?: (item: RealtimeAlert) => void;
  enableRealtime?: boolean;
}

export default function Searchlight({ onAction, onSnoozeToQueue, enableRealtime = true }: SearchlightProps) {
  const { status, alerts: realtimeAlerts, acknowledgeAlert } = useMockRealtimePush(8000);
  const [displayItems, setDisplayItems] = useState<RealtimeAlert[]>(INITIAL_ITEMS);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [, setTick] = useState(0);
  const [workflowById, setWorkflowById] = useState<Record<string, WorkflowState>>({});

  const getWorkflow = (id: string): WorkflowState => workflowById[id] ?? "unread";

  useEffect(() => {
    if (enableRealtime && realtimeAlerts.length > 0) {
      const newAlerts = realtimeAlerts.filter(
        (alert) => !displayItems.some((item) => item.id === alert.id)
      );
      if (newAlerts.length > 0) {
        setDisplayItems((prev) => [...newAlerts, ...prev].slice(0, 10));
        setNewAlertCount((prev) => prev + newAlerts.length);
      }
    }
  }, [realtimeAlerts, enableRealtime, displayItems]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const handleAction = (itemId: string, action: string) => {
    if (action === "发起归因" || action === "发起捞回分析") {
      acknowledgeAlert(itemId);
    }
    onAction?.(itemId, action);
  };

  const handleClearNew = () => {
    setNewAlertCount(0);
  };

  const visibleItems = displayItems.filter((item) => getWorkflow(item.id) !== "closed");

  return (
    <section className="section-shell">
      <div className="section-header">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <SearchOutlined className="text-primary" />
            <Text className="section-title">异动探照灯</Text>
          </div>
          <Text className="section-subtitle !m-0">
            主/次行动 + SLA；支持未读/认领/稍后/关闭（P1 S3）；发起后在工作项表置顶高亮（P1 S4）
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip title={status.connected ? "实时连接正常" : "连接断开"}>
            <Badge status={status.connected ? "success" : "error"} />
          </Tooltip>

          {status.reconnecting && (
            <Tag icon={<SyncOutlined spin />} color="warning" className="text-xs">
              重连中
            </Tag>
          )}

          <Tag
            color={newAlertCount > 0 ? "red" : "default"}
            className="cursor-pointer"
            onClick={handleClearNew}
          >
            {newAlertCount > 0 ? `${newAlertCount} 条新告警` : `${visibleItems.length} 条待处理`}
          </Tag>
        </div>
      </div>

      <div className="section-body overflow-x-auto">
        <div className="flex gap-3">
          {visibleItems.map((item, index) => {
            const levelConfig = LEVEL_CONFIG[item.level];
            const actionCfg = ALERT_ACTIONS[item.type];
            const isNew = index < newAlertCount;
            const wf = getWorkflow(item.id);
            const channel =
              typeof item.metadata?.channel === "string" ? item.metadata.channel : null;
            const product =
              typeof item.metadata?.product === "string" ? item.metadata.product : null;

            return (
              <div
                key={item.id}
                className={`searchlight-card ${levelConfig.borderClass} min-w-[280px] flex-shrink-0 ${
                  isNew ? "animate-pulse" : ""
                } ${wf === "snoozed" ? "opacity-70" : ""}`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span style={{ color: levelConfig.color }} className="text-lg">
                    {levelConfig.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="text-[10px] m-0">{actionCfg.typeLabel}</Tag>
                      <Tag color={item.level === "high" ? "red" : item.level === "medium" ? "orange" : "blue"} className="text-[10px] m-0">
                        {levelConfig.text}
                      </Tag>
                      {renderWorkflowTag(wf)}
                      <Text strong className="text-sm">
                        {item.title}
                      </Text>
                      {isNew && wf === "unread" && (
                        <Tag color="red" className="text-xs m-0">
                          NEW
                        </Tag>
                      )}
                    </div>
                    <Text className="text-xs text-text-secondary">{item.description}</Text>
                  </div>
                </div>

                {item.metadata && (
                  <div className="mb-2">
                    <Space size={4}>
                      {channel && (
                        <Tag icon={<ApiOutlined />} className="text-xs m-0 glass-tag">
                          {channel}
                        </Tag>
                      )}
                      {product && (
                        <Tag className="text-xs m-0 glass-tag">
                          {product}
                        </Tag>
                      )}
                    </Space>
                  </div>
                )}

                <Text className="text-[11px] text-text-muted block mb-2">
                  {formatSlaLine(item.timestamp, actionCfg.slaBudgetMin)}
                </Text>

                <Space size={[6, 6]} wrap className="mb-2">
                  <Button
                    size="small"
                    type="default"
                    disabled={wf === "claimed"}
                    onClick={() => {
                      setWorkflowById((m) => ({ ...m, [item.id]: "claimed" }));
                    }}
                  >
                    认领
                  </Button>
                  <Button
                    size="small"
                    type="default"
                    disabled={wf === "snoozed"}
                    onClick={() => {
                      setWorkflowById((m) => ({ ...m, [item.id]: "snoozed" }));
                      onSnoozeToQueue?.(item);
                    }}
                  >
                    稍后处理
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    className="text-text-muted"
                    onClick={() => {
                      setWorkflowById((m) => ({ ...m, [item.id]: "closed" }));
                      acknowledgeAlert(item.id);
                    }}
                  >
                    忽略
                  </Button>
                </Space>

                <Space size={8} wrap>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleAction(item.id, actionCfg.primary)}
                    className="glass-btn-primary text-xs"
                  >
                    {actionCfg.primary}
                  </Button>
                  {actionCfg.secondary ? (
                    <Button
                      size="small"
                      type="default"
                      onClick={() => handleAction(item.id, actionCfg.secondary!)}
                      className="glass-btn-secondary text-xs"
                    >
                      {actionCfg.secondary}
                    </Button>
                  ) : null}
                </Space>
              </div>
            );
          })}

          {visibleItems.length === 0 && (
            <div className="py-6 text-center w-full text-text-muted">暂无异动告警（或已全部关闭）</div>
          )}
        </div>
      </div>
    </section>
  );
}
