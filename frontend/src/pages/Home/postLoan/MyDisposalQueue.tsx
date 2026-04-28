import { Typography, List, Spin } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { RiskStrip, StatusHighlight, type RiskStripVariant, type StatusHighlightTone } from "./uiPrimitives";
import { useState, useEffect } from "react";
import { api } from "@/api/client";
import type { Alert } from "@/types/enterprise";

const { Text } = Typography;

type PendingSlaLevel = "danger" | "warning" | "warning-soft";

type DoneResult = "有效" | "正常" | "升级";

const DONE_ITEMS: { id: string; summary: string; result: DoneResult }[] = [
  { id: "d1", summary: "挽回客户 9 户，合计约 420 万在贷", result: "有效" },
  { id: "d2", summary: "误报排除 11 条，已归档口径说明", result: "正常" },
  { id: "d3", summary: "升级策略 / 法诉 3 起", result: "升级" },
];

const RESULT_HIGHLIGHT: Record<DoneResult, StatusHighlightTone> = {
  有效: "success",
  正常: "neutral",
  升级: "warning-soft",
};

function stripForPendingLevel(level: PendingSlaLevel): RiskStripVariant {
  if (level === "danger") return "danger";
  if (level === "warning") return "warning";
  return "warning-soft";
}

interface MyDisposalQueueProps {
  onOpenItem?: (id: string) => void;
}

export default function MyDisposalQueue({ onOpenItem }: MyDisposalQueueProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const alertData = await api.getAlertList({ status: "active", limit: 3 });
      setAlerts(alertData);
    } catch (error) {
      console.error("加载预警队列失败", error);
    } finally {
      setLoading(false);
    }
  };

  // 将真实预警数据转换为待核查工单格式
  const pendingItems = alerts.map((alert) => {
    const slaLevel: PendingSlaLevel = alert.alert_level === "CRITICAL" ? "danger" :
                                       alert.alert_level === "HIGH" ? "warning" : "warning-soft";
    const slaText = alert.alert_level === "CRITICAL" ? "超时 8h" :
                    alert.alert_level === "HIGH" ? "剩 2h" : "剩 18h";

    return {
      id: String(alert.id),
      name: alert.company_name || "未知企业",
      sub: `预警类型: ${alert.alert_type} · ${alert.alert_source || "系统"}`,
      sla: slaText,
      slaLevel: slaLevel,
    };
  });

  const displayPending = pendingItems;

  return (
    <section className="section-shell" id="work-queue">
      <div className="section-header">
        <Text className="section-title">我的处置队列</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          企查查实时预警数据，右侧汇总本周完成与结果分布
        </Text>
      </div>
      <div className="section-body">
        <Spin spinning={loading}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="pl-solid-card flex min-h-[280px] flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] bg-[var(--color-bg-container)] px-4 py-3">
                <Text strong className="text-[15px] text-text-primary">
                  待核查工单
                </Text>
                <StatusHighlight tone="warning">{displayPending.length} 待办</StatusHighlight>
              </div>
              <div className="flex flex-1 flex-col gap-2 bg-[var(--color-bg-layout)] p-3">
                {displayPending.length > 0 ? (
                  <List
                    size="small"
                    split={false}
                    dataSource={displayPending}
                    renderItem={(item) => (
                      <List.Item className="!block !p-0 !border-none">
                        <button
                          type="button"
                          className={`pl-queue-row pl-queue-row--sla-${item.slaLevel} flex w-full overflow-hidden`}
                          onClick={() => onOpenItem?.(item.id)}
                        >
                          <RiskStrip variant={stripForPendingLevel(item.slaLevel)} />
                          <div className="flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                              <Text strong className="block text-[15px] text-text-primary">
                                {item.name}
                              </Text>
                              <span className="pl-aux-text mt-0.5 block">{item.sub}</span>
                            </div>
                            <StatusHighlight
                              tone={
                                item.slaLevel === "danger"
                                  ? "danger"
                                  : item.slaLevel === "warning"
                                    ? "warning"
                                    : "warning-soft"
                              }
                              icon={<ClockCircleOutlined />}
                            >
                              {item.sla}
                            </StatusHighlight>
                          </div>
                        </button>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="pl-solid-card p-4 text-center text-[13px] text-gray-500">暂无待核查工单</div>
                )}
              </div>
              <Text className="pl-aux-text border-t border-[var(--color-border-light)] bg-[var(--color-bg-container)] px-4 py-2">
                点击卡片进入预警核查工作台
              </Text>
            </div>

            <div className="pl-solid-card flex min-h-[280px] flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] bg-[var(--color-bg-container)] px-4 py-3">
                <Text strong className="text-[15px] text-text-primary">
                  本周完成
                </Text>
                <span className="pl-aux-text inline-flex items-center gap-1">
                  <CheckCircleOutlined className="text-text-muted" />
                  <Text className="!text-[12px] text-text-muted">28 笔</Text>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 bg-[var(--color-bg-layout)] p-3">
                <List
                  size="small"
                  split={false}
                  dataSource={DONE_ITEMS}
                  renderItem={(item) => (
                    <List.Item className="!block !p-0 !border-none">
                      <div className="pl-solid-card flex overflow-hidden">
                        <RiskStrip
                          variant={
                            item.result === "有效" ? "success" : item.result === "升级" ? "warning" : "neutral"
                          }
                        />
                        <div className="flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2.5">
                          <Text className="flex-1 text-[14px] font-medium leading-snug text-text-primary">{item.summary}</Text>
                          <StatusHighlight tone={RESULT_HIGHLIGHT[item.result]}>{item.result}</StatusHighlight>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
              <Text className="pl-aux-text border-t border-[var(--color-border-light)] bg-[var(--color-bg-container)] px-4 py-2">
                结果分布用于复盘质检与规则调优输入
              </Text>
            </div>
          </div>
        </Spin>
      </div>
    </section>
  );
}
