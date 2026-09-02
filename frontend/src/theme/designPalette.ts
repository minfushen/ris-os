/**
 * Ant Design ThemeConfig 字面量，与 `src/styles/tokens.css` 中 `--palette-*` / 语义色保持一致。
 * 色板对齐 B2B SaaS 设计规范：单一主色、语义强调色、Slate 中性面、平面优先。
 * 调整品牌色或语义色时，请先改 tokens.css 原子段，再同步本文件。
 */
export const designPalette = {
  primary: "#2563eb",
  primaryDeep: "#1d4ed8",
  primaryActive: "#1e40af",
  primaryBg: "#eff6ff",
  primaryBgHover: "rgba(37, 99, 235, 0.08)",
  primaryBorder: "rgba(37, 99, 235, 0.28)",
  primaryBorderHover: "rgba(37, 99, 235, 0.4)",

  success: "#16a34a",
  successBg: "rgba(22, 163, 74, 0.08)",
  successBorder: "rgba(34, 197, 94, 0.35)",

  warning: "#d97706",
  warningBg: "rgba(217, 119, 6, 0.08)",
  warningBorder: "rgba(245, 158, 11, 0.35)",

  danger: "#dc2626",
  dangerLight: "#ef4444",
  dangerBg: "rgba(220, 38, 38, 0.06)",
  dangerBorder: "rgba(220, 38, 38, 0.28)",

  info: "#0891b2",
  infoBg: "rgba(8, 145, 178, 0.08)",
  infoBorder: "rgba(8, 145, 178, 0.24)",

  text: "#0f172a",
  textSecondary: "#475569",
  textTertiary: "#64748b",
  textQuaternary: "#94a3b8",

  bgLayout: "#f8fafc",
  bgContainer: "#ffffff",
  bgDisabled: "#f1f5f9",
  bgSpotlight: "rgba(15, 23, 42, 0.88)",

  border: "rgba(15, 23, 42, 0.1)",
  borderSecondary: "rgba(15, 23, 42, 0.06)",
  split: "rgba(15, 23, 42, 0.08)",

  /** B2B 平面优先：顶栏/侧栏均为实色白，无玻璃透明 */
  headerGlass: "#ffffff",
  triggerBg: "#f8fafc",
  tableHeaderBg: "#f8fafc",
  tableFooterBg: "#f8fafc",
  segmentedTrack: "#f1f5f9",

  shadowSurface: "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
  shadowSecondary: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",

  primaryAlpha05: "rgba(37, 99, 235, 0.05)",
  primaryAlpha06: "rgba(37, 99, 235, 0.06)",
  primaryAlpha08: "rgba(37, 99, 235, 0.08)",
  primaryAlpha10: "rgba(37, 99, 235, 0.1)",
  primaryAlpha11: "rgba(37, 99, 235, 0.11)",
  primaryAlpha14: "rgba(37, 99, 235, 0.14)",
  primaryAlpha22: "rgba(37, 99, 235, 0.22)",

  borderMuted08: "rgba(15, 23, 42, 0.08)",
  borderMuted12: "rgba(15, 23, 42, 0.12)",

  tooltipSpotlight: "rgba(15, 23, 42, 0.92)",
} as const;
