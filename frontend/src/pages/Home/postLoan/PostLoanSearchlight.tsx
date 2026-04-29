import { Typography, Button, Space, Spin } from "antd";
import { BankOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import {
  RiskStrip,
  SoftTag,
  StatusHighlight,
  mapRiskColorToVariant,
  slaToneFromLabel,
  type RiskStripVariant,
} from "./uiPrimitives";
import { useState, useEffect } from "react";
import { api } from "@/api/client";
import type { Alert } from "@/types/enterprise";
import { RISK_LEVEL_TEXT } from "@/types/qcc";

const { Text } = Typography;

export interface PostLoanAlertCard {
  id: string;
  entityName: string;
  headline: string;
  auxiliaryText: string;
  riskTag: string;
  riskColor: "red" | "orange" | "gold" | "blue";
  categoryTag: string;
  slaText: string;
  slaUrgent?: boolean;
  primaryLabel: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  icon?: "corp" | "trade";
}

interface PostLoanSearchlightProps {
  onClaimVerify: (id: string) => void;
  onJoinQueue?: (id: string) => void;
}

function AlertCard({ alert }: { alert: PostLoanAlertCard }) {
  const { strip, tag: riskSoft } = mapRiskColorToVariant(alert.riskColor);
  const stripVariant: RiskStripVariant = strip;
  
  return (
    <div className="pl-solid-card pl-solid-card--interactive flex min-w-0 flex-1 overflow-hidden group">
      <RiskStrip variant={stripVariant} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 py-4 pl-4 pr-4">
        {/* 头部：实体名 + 标签 */}
        <div className="flex gap-3 items-start">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <Text strong className="pl-entity-name">{alert.entityName}</Text>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm"
                style={{
                  background: alert.riskColor === "red" ? "var(--color-error-bg)" : "var(--color-warning-bg)",
                  color: alert.riskColor === "red" ? "var(--color-danger)" : "var(--color-warning)",
                }}
              >
                {alert.icon === "trade" ? <TeamOutlined /> : <BankOutlined />}
              </div>
            </div>
            <div className="pl-card-title">{alert.headline}</div>
            <div className="pl-aux-text mt-1.5">{alert.auxiliaryText}</div>
          </div>
          
          {/* 右侧标签组 */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <SoftTag variant={riskSoft}>{alert.riskTag}</SoftTag>
            <SoftTag variant="info">{alert.categoryTag}</SoftTag>
            <StatusHighlight tone={slaToneFromLabel(alert.slaText, alert.slaUrgent)}>
              <ClockCircleOutlined className="text-[11px]" />
              {alert.slaText}
            </StatusHighlight>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.04] pt-3">
          <Text type="secondary" className="text-[11px]">
            {alert.id}
          </Text>
          <Space size="small">
            <Button 
              type="primary" 
              size="small" 
              onClick={alert.onPrimary}
              className="shadow-sm"
            >
              {alert.primaryLabel}
            </Button>
            {alert.secondaryLabel && (
              <Button size="small" onClick={alert.onSecondary}>
                {alert.secondaryLabel}
              </Button>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
}

export default function PostLoanSearchlight({ onClaimVerify, onJoinQueue }: PostLoanSearchlightProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const alertData = await api.getAlertList({ status: "active", limit: 4 });
      setAlerts(alertData);
    } catch (error) {
      console.error("加载预警列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  // 将真实预警数据转换为卡片格式
  const alertCards: PostLoanAlertCard[] = alerts.map((alert) => {
    const riskColor = alert.alert_level === "CRITICAL" ? "red" :
                      alert.alert_level === "HIGH" ? "orange" :
                      alert.alert_level === "MEDIUM" ? "gold" : "blue";

    return {
      id: String(alert.id),
      entityName: alert.company_name || "未知企业",
      headline: alert.alert_type,
      auxiliaryText: `企业ID: ${alert.enterprise_id} · 触发时间: ${new Date(alert.triggered_at).toLocaleDateString("zh-CN")}`,
      riskTag: RISK_LEVEL_TEXT[alert.alert_level] || "未知",
      riskColor: riskColor as "red" | "orange" | "gold" | "blue",
      categoryTag: alert.alert_source || "系统预警",
      slaText: "待处置",
      slaUrgent: alert.alert_level === "CRITICAL",
      primaryLabel: "认领核查",
      secondaryLabel: "加入队列",
      icon: "corp",
    };
  });

  const displayCards = alertCards.map((a) => ({
    ...a,
    onPrimary: () => onClaimVerify(a.id),
    onSecondary: a.secondaryLabel ? () => onJoinQueue?.(a.id) : undefined,
  }));

  return (
    <section className="section-shell" id="searchlight-anchor">
      <div className="section-header">
        <Text className="section-title">今日预警大盘</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          企查查实时预警数据，点击「认领核查」进入工作台处置
        </Text>
      </div>
      <div className="section-body">
        <Spin spinning={loading}>
          {displayCards.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-4">
              {displayCards.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="pl-solid-card p-6 text-center text-[13px] text-gray-500">
              暂无可展示的预警数据
            </div>
          )}
        </Spin>
      </div>
    </section>
  );
}
