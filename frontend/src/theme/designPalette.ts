/**
 * Ant Design ThemeConfig 字面量，与 `src/styles/tokens.css` 中 `--palette-*` / 语义色保持一致。
 * 调整品牌色或语义色时，请先改 tokens.css 原子段，再同步本文件。
 */
export const designPalette = {
  primary: "#6f8f95",
  primaryDeep: "#4f6970",
  primaryActive: "#3d555b",
  primaryBg: "#eef4f3",
  primaryBgHover: "rgba(111, 143, 149, 0.12)",
  primaryBorder: "rgba(111, 143, 149, 0.25)",
  primaryBorderHover: "rgba(111, 143, 149, 0.4)",

  success: "#3b6d11",
  successBg: "rgba(59, 109, 17, 0.08)",
  successBorder: "rgba(99, 153, 34, 0.35)",

  warning: "#854f0b",
  warningBg: "rgba(133, 79, 11, 0.08)",
  warningBorder: "rgba(239, 159, 39, 0.35)",

  danger: "#a32d2d",
  dangerLight: "#e24b4a",
  dangerBg: "rgba(163, 45, 45, 0.08)",
  dangerBorder: "rgba(226, 75, 74, 0.35)",

  info: "#185fa5",
  infoBg: "rgba(24, 95, 165, 0.08)",
  infoBorder: "rgba(24, 95, 165, 0.24)",

  text: "#1f2a30",
  textSecondary: "#44525a",
  textTertiary: "#6e7c84",
  textQuaternary: "#95a2a9",

  bgLayout: "#f4f7f8",
  bgContainer: "#ffffff",
  bgDisabled: "#f3f5f6",
  bgSpotlight: "rgba(31, 42, 48, 0.88)",

  border: "rgba(31, 42, 48, 0.1)",
  borderSecondary: "rgba(31, 42, 48, 0.06)",
  split: "rgba(31, 42, 48, 0.08)",

  headerGlass: "rgba(255, 255, 255, 0.88)",
  triggerBg: "rgba(245, 248, 250, 0.95)",
  tableHeaderBg: "rgba(245, 248, 250, 0.98)",
  tableFooterBg: "rgba(250, 251, 252, 0.96)",
  segmentedTrack: "rgba(245, 248, 250, 0.95)",

  shadowSurface: "0 1px 2px rgba(31, 42, 48, 0.04), 0 2px 8px rgba(31, 42, 48, 0.05)",
  shadowSecondary: "0 2px 10px rgba(31, 42, 48, 0.05)",

  primaryAlpha05: "rgba(111, 143, 149, 0.05)",
  primaryAlpha06: "rgba(111, 143, 149, 0.06)",
  primaryAlpha08: "rgba(111, 143, 149, 0.08)",
  primaryAlpha10: "rgba(111, 143, 149, 0.1)",
  primaryAlpha11: "rgba(111, 143, 149, 0.11)",
  primaryAlpha14: "rgba(111, 143, 149, 0.14)",
  primaryAlpha22: "rgba(111, 143, 149, 0.22)",

  borderMuted08: "rgba(31, 42, 48, 0.08)",
  borderMuted12: "rgba(31, 42, 48, 0.12)",

  tooltipSpotlight: "rgba(36, 48, 54, 0.92)",
} as const;
