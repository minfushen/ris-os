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

/** 柔和填充标签：专业金融风格 */
const SOFT_TAG_STYLE: Record<SoftTagVariant, CSSProperties> = {
  danger: { 
    background: "linear-gradient(135deg, rgba(245, 34, 45, 0.1) 0%, rgba(255, 77, 79, 0.06) 100%)", 
    color: "#f5222d",
    border: "1px solid rgba(245, 34, 45, 0.15)",
  },
  warning: { 
    background: "linear-gradient(135deg, rgba(250, 140, 22, 0.12) 0%, rgba(255, 169, 64, 0.06) 100%)", 
    color: "#fa8c16",
    border: "1px solid rgba(250, 140, 22, 0.2)",
  },
  success: { 
    background: "linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(115, 209, 61, 0.06) 100%)", 
    color: "#52c41a",
    border: "1px solid rgba(82, 196, 26, 0.15)",
  },
  info: { 
    background: "linear-gradient(135deg, rgba(22, 119, 255, 0.1) 0%, rgba(64, 150, 255, 0.06) 100%)", 
    color: "#1677ff",
    border: "1px solid rgba(22, 119, 255, 0.15)",
  },
  neutral: { 
    background: "rgba(0, 0, 0, 0.03)", 
    color: "#595959",
    border: "1px solid rgba(0, 0, 0, 0.06)",
  },
};

export function SoftTag({ variant, children }: { variant: SoftTagVariant; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 max-w-full px-2 py-0.5 rounded text-[11px] font-semibold leading-tight"
      style={SOFT_TAG_STYLE[variant]}
    >
      {children}
    </span>
  );
}

/** 状态高亮块 */
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

/** 从 SLA 文案推断高亮 */
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
