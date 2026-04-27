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
    background: "linear-gradient(135deg, var(--color-error-bg-strong) 0%, var(--color-error-bg) 100%)",
    color: "var(--color-danger)",
    border: "1px solid var(--color-error-border)",
  },
  warning: {
    background: "linear-gradient(135deg, var(--color-warning-bg-strong) 0%, var(--color-warning-bg) 100%)",
    color: "var(--color-warning)",
    border: "1px solid var(--color-warning-border)",
  },
  success: {
    background: "linear-gradient(135deg, var(--color-success-bg-strong) 0%, var(--color-success-bg) 100%)",
    color: "var(--color-success)",
    border: "1px solid var(--color-success-border)",
  },
  info: {
    background: "linear-gradient(135deg, var(--color-info-bg) 0%, color-mix(in srgb, var(--color-info) 8%, transparent) 100%)",
    color: "var(--color-info)",
    border: "1px solid var(--color-info-border)",
  },
  neutral: {
    background: "var(--color-bg-interactive-hover)",
    color: "var(--color-text-secondary)",
    border: "1px solid var(--color-border-light)",
  },
};

export function SoftTag({ variant, children }: { variant: SoftTagVariant; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 max-w-full px-2 py-0.5 rounded-[2px] text-[11px] font-medium leading-tight"
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
