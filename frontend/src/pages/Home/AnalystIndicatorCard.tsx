import { useState } from "react";
import { Typography, Segmented } from "antd";
import {
  WarningOutlined,
  FallOutlined,
  RiseOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { MetricCardStatus } from "./MetricCard";

const { Text } = Typography;

export type AnalystTimeGrain = "day" | "week" | "month";
export type AnalystScene = "credit" | "draw" | "post_loan";

const STATUS_STRIP: Record<MetricCardStatus, string> = {
  alert: "var(--color-accent-danger)",
  attention: "var(--color-accent-warning)",
  normal: "var(--color-accent-success)",
  over_threshold: "var(--color-danger)",
};

const BAR_HI: Record<MetricCardStatus, string> = {
  alert: "color-mix(in srgb, var(--color-danger-light) 90%, transparent)",
  attention: "color-mix(in srgb, var(--color-warning-light) 90%, transparent)",
  normal: "color-mix(in srgb, var(--color-success-light) 90%, transparent)",
  over_threshold: "color-mix(in srgb, var(--color-danger) 92%, transparent)",
};

function normalizeToSeven(raw?: number[]): number[] {
  if (!raw?.length) return [];
  const slice = raw.slice(-7);
  while (slice.length < 7) {
    slice.unshift(slice[0] ?? 0.5);
  }
  const max = Math.max(...slice, 1e-6);
  const min = Math.min(...slice);
  const span = max - min || 1;
  return slice.map((v) => 0.2 + 0.75 * ((v - min) / span));
}

function MiniSparkline({ heights, status }: { heights: number[]; status: MetricCardStatus }) {
  const hi = BAR_HI[status];
  return (
    <div className="flex h-9 flex-1 min-w-0 items-end gap-0.5 pt-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="min-h-[4px] flex-1 rounded-[var(--radius-2xs,2px)]"
          style={{
            height: `${Math.round(h * 100)}%`,
            minHeight: 4,
            backgroundColor: hi,
            opacity: 0.35 + 0.55 * h,
          }}
        />
      ))}
    </div>
  );
}

export interface AnalystIndicatorCardProps {
  title: string;
  value: string;
  unit?: string;
  /** 环比/同比变化展示，如 ▼ -2.1% */
  trendText: string;
  /** 箭头与着色：通过率下降为 bad */
  trendSemantic: "good" | "bad" | "neutral";
  trendDirection: "up" | "down";
  /** 基准行（设计稿强调） */
  baselineText: string;
  /** 口径脚注，避免「各说各话」 */
  caliberFootnote: string;
  trendBars: number[];
  status: MetricCardStatus;
  /** 底部状态条文案 */
  footerMessage: string;
  /** 是否展示时间粒度切换 */
  showTimeTabs?: boolean;
  /** 是否展示业务场景切换 */
  showSceneTabs?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export default function AnalystIndicatorCard({
  title,
  value,
  unit,
  trendText,
  trendSemantic,
  trendDirection,
  baselineText,
  caliberFootnote,
  trendBars,
  status,
  footerMessage,
  showTimeTabs = true,
  showSceneTabs = true,
  actionLabel = "下钻",
  onAction,
}: AnalystIndicatorCardProps) {
  const [timeGrain, setTimeGrain] = useState<AnalystTimeGrain>("day");
  const [scene, setScene] = useState<AnalystScene>("credit");

  const strip = STATUS_STRIP[status];
  const bars = normalizeToSeven(trendBars);

  const trendColor =
    trendSemantic === "bad"
      ? "var(--color-accent-danger)"
      : trendSemantic === "good"
        ? "var(--color-accent-success)"
        : "var(--color-text-muted)";

  const TrendIcon = trendDirection === "down" ? FallOutlined : RiseOutlined;

  const FooterIcon = status === "normal" ? CheckCircleOutlined : WarningOutlined;
  const footerIcon = <FooterIcon className="mt-0.5 shrink-0" />;
  const footerClass =
    status === "alert" || status === "over_threshold"
      ? "text-accent-danger"
      : status === "attention"
        ? "text-accent-warning"
        : "text-text-secondary";

  return (
    <div
      className="relative h-full overflow-hidden rounded-lg border border-border-soft bg-[var(--color-bg-container)] shadow-[var(--shadow-card)] text-left transition-shadow hover:shadow-[var(--shadow-card-hover)]"
      role="region"
      aria-label={title}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[inherit]" style={{ backgroundColor: strip }} aria-hidden />
      <div className="px-3 py-3 pl-4">
        <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2">
          <Text strong className="text-sm text-text-primary leading-snug shrink-0">
            {title}
          </Text>
          {showTimeTabs ? (
            <Segmented
              size="small"
              className="shrink-0 bg-[var(--color-border-light)]"
              value={timeGrain}
              onChange={(v) => setTimeGrain(v as AnalystTimeGrain)}
              options={[
                { label: "今日", value: "day" },
                { label: "本周", value: "week" },
                { label: "本月", value: "month" },
              ]}
            />
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span
            className="text-3xl font-semibold tabular-nums tracking-tight text-text-primary"
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" }}
          >
            {value}
            {unit ? <span className="text-base font-medium text-text-muted">{unit}</span> : null}
          </span>
          <span className="inline-flex items-center gap-0.5 text-sm font-medium tabular-nums" style={{ color: trendColor }}>
            <TrendIcon />
            {trendText}
          </span>
        </div>

        <Text strong className="mt-2 block text-[13px] leading-snug text-text-primary">
          {baselineText}
        </Text>
        <Text type="secondary" className="mt-0.5 block text-[11px] leading-snug">
          {caliberFootnote}
        </Text>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <MiniSparkline heights={bars} status={status} />
          {showSceneTabs ? (
            <Segmented
              size="small"
              className="shrink-0 bg-[var(--color-border-light)]"
              value={scene}
              onChange={(v) => setScene(v as AnalystScene)}
              options={[
                { label: "授信", value: "credit" },
                { label: "支用", value: "draw" },
                { label: "贷后", value: "post_loan" },
              ]}
            />
          ) : null}
        </div>

        <div className="mt-3 flex items-start justify-between gap-2 border-t border-border-soft pt-2">
          <div className={`flex min-w-0 items-start gap-1.5 text-[12px] leading-snug ${footerClass}`}>
            {footerIcon}
            <span>{footerMessage}</span>
          </div>
          {onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex shrink-0 items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] text-text-muted hover:text-primary cursor-pointer"
            >
              {actionLabel}
              <RightOutlined className="text-[10px]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
