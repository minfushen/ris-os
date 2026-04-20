import { Typography, Tag } from "antd";
import { RightOutlined } from "@ant-design/icons";

const { Text } = Typography;

/** 与风控看板语义对齐：告警 / 关注 / 正常 / 超阈值 */
export type MetricCardStatus = "alert" | "attention" | "normal" | "over_threshold";

const STATUS_STRIP: Record<MetricCardStatus, string> = {
  alert: "var(--color-accent-danger, #c77b78)",
  attention: "var(--color-accent-warning, #d7a85f)",
  normal: "var(--color-accent-success, #5f9b7a)",
  over_threshold: "#a34d4a",
};

const STATUS_TAG_COLOR: Record<MetricCardStatus, "error" | "warning" | "success" | "magenta"> = {
  alert: "error",
  attention: "warning",
  normal: "success",
  over_threshold: "magenta",
};

const STATUS_VALUE_COLOR: Record<MetricCardStatus, string> = {
  alert: "var(--color-accent-danger, #c77b78)",
  attention: "var(--color-text-primary, #1f2a30)",
  normal: "var(--color-accent-success, #5f9b7a)",
  over_threshold: "#a34d4a",
};

const BAR_TINT: Record<MetricCardStatus, [string, string]> = {
  alert: ["rgba(199, 123, 120, 0.35)", "rgba(199, 123, 120, 0.9)"],
  attention: ["rgba(215, 168, 95, 0.35)", "rgba(215, 168, 95, 0.9)"],
  normal: ["rgba(95, 155, 122, 0.35)", "rgba(95, 155, 122, 0.9)"],
  over_threshold: ["rgba(163, 77, 74, 0.35)", "rgba(163, 77, 74, 0.95)"],
};

function defaultTrendBars(status: MetricCardStatus): number[] {
  const presets: Record<MetricCardStatus, number[]> = {
    alert: [0.55, 0.62, 0.58, 0.64, 0.6, 0.57, 0.52],
    attention: [0.5, 0.55, 0.52, 0.58, 0.54, 0.53, 0.51],
    normal: [0.45, 0.52, 0.48, 0.58, 0.62, 0.68, 0.72],
    over_threshold: [0.42, 0.48, 0.55, 0.62, 0.7, 0.78, 0.85],
  };
  return presets[status];
}

/** 将任意长度序列归一为 7 个 0~1 高度 */
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

function MiniTrendBars({ heights, status }: { heights: number[]; status: MetricCardStatus }) {
  const [, hi] = BAR_TINT[status];
  return (
    <div className="flex h-8 items-end gap-0.5 pt-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="min-h-[4px] flex-1 rounded-[var(--radius-2xs,2px)] transition-all"
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

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: MetricCardStatus;
  /** 右上角状态角标，如「告警」「关注」「正常」「超阈值」 */
  statusTag: string;
  /** 基准对比行：如「基准 69.4% · ▼ -2.1%」 */
  comparison: string;
  /** 口径脚注，卡片底部左侧固定展示 */
  caliber: string;
  /** 底部右侧操作文案 */
  actionLabel?: string;
  onAction?: () => void;
  /** 7 个点高度比例 0~1；不传则按 status 使用内置演示波形 */
  trendBars?: number[];
}

export default function MetricCard({
  title,
  value,
  unit,
  status,
  statusTag,
  comparison,
  caliber,
  actionLabel = "下钻",
  onAction,
  trendBars,
}: MetricCardProps) {
  const bars = trendBars?.length ? normalizeToSeven(trendBars) : defaultTrendBars(status);
  const strip = STATUS_STRIP[status];
  const valueColor = STATUS_VALUE_COLOR[status];
  const tagColor = STATUS_TAG_COLOR[status];

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <Text strong className="text-sm text-text-primary leading-snug">
          {title}
        </Text>
        <Tag color={tagColor} className="m-0 shrink-0 text-xs leading-tight">
          {statusTag}
        </Tag>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span
          className="text-3xl font-semibold tabular-nums tracking-tight"
          style={{ color: valueColor, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" }}
        >
          {value}
        </span>
        {unit ? (
          <Text type="secondary" className="text-sm">
            {unit}
          </Text>
        ) : null}
      </div>

      <Text type="secondary" className="mt-1 block text-[13px] leading-snug">
        {comparison}
      </Text>

      <MiniTrendBars heights={bars} status={status} />

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-soft pt-2">
        <Text type="secondary" className="text-[12px] leading-snug">
          {caliber}
        </Text>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex shrink-0 items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] text-text-muted hover:text-primary cursor-pointer"
          >
            {actionLabel}
            <RightOutlined className="text-[10px]" />
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-text-muted">
            {actionLabel}
            <RightOutlined className="text-[10px]" />
          </span>
        )}
      </div>
    </>
  );

  return (
    <div
      className="relative layout-pl-md overflow-hidden rounded-lg border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[inherit]"
        style={{ backgroundColor: strip }}
        aria-hidden
      />
      <div className="px-3 py-3">{body}</div>
    </div>
  );
}
