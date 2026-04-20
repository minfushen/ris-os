import { Typography, Button, Space } from "antd";
import { BankOutlined, TeamOutlined } from "@ant-design/icons";
import {
  RiskStrip,
  SoftTag,
  StatusHighlight,
  mapRiskColorToVariant,
  slaToneFromLabel,
  type RiskStripVariant,
} from "./uiPrimitives";

const { Text } = Typography;

export interface PostLoanAlertCard {
  id: string;
  entityName: string;
  headline: string;
  /** 借据号、行业等辅助信息，12px 灰色展示 */
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

const SEED_ALERTS: Omit<PostLoanAlertCard, "onPrimary" | "onSecondary" | "auxiliaryText">[] = [
  {
    id: "pl-sl-1",
    entityName: "张三科技",
    headline: "新增被执行 85万",
    riskTag: "高危",
    riskColor: "red",
    categoryTag: "司法涉诉",
    slaText: "剩 4h",
    slaUrgent: true,
    primaryLabel: "认领核查",
    icon: "corp",
  },
  {
    id: "pl-sl-2",
    entityName: "李四贸易",
    headline: "多头借贷余额增幅 52%",
    riskTag: "警告",
    riskColor: "gold",
    categoryTag: "多头借贷",
    slaText: "剩 2天",
    primaryLabel: "查看详情",
    secondaryLabel: "加入队列",
    icon: "trade",
  },
];

const AUXILIARY: Record<string, string> = {
  "pl-sl-1": "经营贷 · 借据 CL20240312 · 在贷余额 320万 · 制造业",
  "pl-sl-2": "税金贷 · 借据 CL20231220 · 在贷余额 150万 · 批发零售",
};

interface PostLoanSearchlightProps {
  onClaimVerify: (id: string) => void;
  onViewDetail: (id: string) => void;
  onJoinQueue?: (id: string) => void;
}

export default function PostLoanSearchlight({ onClaimVerify, onViewDetail, onJoinQueue }: PostLoanSearchlightProps) {
  const alerts: PostLoanAlertCard[] = SEED_ALERTS.map((a) => ({
    ...a,
    auxiliaryText: AUXILIARY[a.id] ?? "",
    onPrimary: () => (a.id === "pl-sl-1" ? onClaimVerify(a.id) : onViewDetail(a.id)),
    onSecondary: a.secondaryLabel ? () => onJoinQueue?.(a.id) : undefined,
  }));

  return (
    <section className="section-shell" id="searchlight-anchor">
      <div className="section-header">
        <Text className="section-title">今日预警探照灯</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          贷后预警信息优先展示，支持认领与下钻核查
        </Text>
      </div>
      <div className="section-body">
        <div className="flex flex-col lg:flex-row gap-4">
          {alerts.map((a) => {
            const { strip, tag: riskSoft } = mapRiskColorToVariant(a.riskColor);
            const stripVariant: RiskStripVariant = strip;
            return (
              <div
                key={a.id}
                className="pl-solid-card pl-solid-card--interactive flex min-w-0 flex-1 overflow-hidden"
              >
                <RiskStrip variant={stripVariant} />
                <div className="flex min-w-0 flex-1 flex-col gap-3 py-3 pl-4 pr-4">
                  <div className="flex gap-3 items-start">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="pl-entity-name">{a.entityName}</div>
                      <div className="pl-card-title mt-2">{a.headline}</div>
                      <div className="pl-aux-text mt-1.5">{a.auxiliaryText}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <SoftTag variant={riskSoft}>{a.riskTag}</SoftTag>
                      <SoftTag variant="info">{a.categoryTag}</SoftTag>
                      <StatusHighlight tone={slaToneFromLabel(a.slaText, a.slaUrgent)}>{a.slaText}</StatusHighlight>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-base"
                      style={{ background: "rgba(22, 119, 255, 0.08)", color: "#1677ff" }}
                    >
                      {a.icon === "trade" ? <TeamOutlined /> : <BankOutlined />}
                    </div>
                    <Space wrap size="small">
                      <Button type="primary" size="small" onClick={a.onPrimary}>
                        {a.primaryLabel}
                      </Button>
                      {a.secondaryLabel && (
                        <Button size="small" onClick={a.onSecondary}>
                          {a.secondaryLabel}
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
