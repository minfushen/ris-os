import type { CSSProperties, ReactNode } from "react";

export type RiskStripVariant = "danger" | "warning" | "warning-soft" | "success" | "info" | "neutral";

const STRIP_CLASS: Record<RiskStripVariant, string> = {
  danger: "pl-risk-strip pl-risk-strip--danger",
  warning: "pl-risk-strip pl-risk-strip--warning",
  "warning-soft": "pl-risk-strip pl-risk-strip--warning-soft",
  success: "pl-risk-strip pl-risk-strip--success",
  info: "pl-risk-strip pl-risk-strip--info",
  neutral: "pl-risk-strip pl-risk-strip--neutral",
};

export function RiskStrip({ variant }: { variant: RiskStripVariant }) {
  return <div className={STRIP_CLASS[variant]} aria-hidden />;
}

export type SoftTagVariant = "danger" | "warning" | "success" | "info" | "neutral";

/** 柔和填充标签：浅色底 + 语义色字，避免压抑 */
const SOFT_TAG_STYLE: Record<SoftTagVariant, CSSProperties> = {
  danger: { background: "rgba(245, 34, 45, 0.1)", color: "#cf1322" },
  warning: { background: "#fffae6", color: "#fa8c16" },
  success: { background: "rgba(82, 196, 26, 0.12)", color: "#389e0d" },
  info: { background: "rgba(22, 119, 255, 0.1)", color: "#1677ff" },
  neutral: { background: "rgba(0, 0, 0, 0.04)", color: "#595959" },
};

export function SoftTag({ variant, children }: { variant: SoftTagVariant; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 max-w-full px-2 py-0.5 rounded text-xs font-medium leading-tight"
      style={SOFT_TAG_STYLE[variant]}
    >
      {children}
    </span>
  );
}

/** 将业务 riskColor 映射到条/标签语义 */
/** 列表/卡片内「状态文案」专用高亮块（奶黄=注意，红=严重，绿=成功） */
export type StatusHighlightTone = "danger" | "warning" | "warning-soft" | "success" | "neutral";

const STATUS_HIGHLIGHT_CLASS: Record<StatusHighlightTone, string> = {
  danger: "pl-status-highlight pl-status-highlight--danger",
  warning: "pl-status-highlight pl-status-highlight--warning",
  "warning-soft": "pl-status-highlight pl-status-highlight--warning-soft",
  success: "pl-status-highlight pl-status-highlight--success",
  neutral: "pl-status-highlight pl-status-highlight--neutral",
};

export function StatusHighlight({
  tone,
  children,
  icon,
}: {
  tone: StatusHighlightTone;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className={STATUS_HIGHLIGHT_CLASS[tone]}>
      {icon ? <span className="inline-flex shrink-0 opacity-90">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}

/** 从 SLA 文案推断高亮：超时→红块；短剩余→奶黄强调；其余→淡奶黄注意 */
export function slaToneFromLabel(sla: string, urgentHint?: boolean): StatusHighlightTone {
  const t = sla.trim();
  if (/超时|超期|已逾期/i.test(t)) return "danger";
  if (urgentHint) return "warning";
  const h = t.match(/剩\s*(\d+)\s*h/i);
  if (h) {
    const n = Number(h[1]);
    if (Number.isFinite(n) && n <= 6) return "warning";
    return "warning-soft";
  }
  if (/天|周/i.test(t)) return "warning-soft";
  return "warning-soft";
}

export function mapRiskColorToVariant(
  riskColor: "red" | "orange" | "gold" | "blue",
): { strip: RiskStripVariant; tag: SoftTagVariant } {
  switch (riskColor) {
    case "red":
      return { strip: "danger", tag: "danger" };
    case "orange":
    case "gold":
      return { strip: "warning", tag: "warning" };
    case "blue":
      return { strip: "info", tag: "info" };
    default:
      return { strip: "info", tag: "info" };
  }
}
