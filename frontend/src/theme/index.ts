import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

/**
 * Ant Design 主题与 `tailwind.css` @theme 玻璃台令牌对齐（冷青灰主色、圆角、功能色）。
 */
const PRIMARY = "#6f8f95";
const PRIMARY_DEEP = "#4f6970";
export const theme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: PRIMARY,
    colorPrimaryHover: PRIMARY_DEEP,
    colorPrimaryActive: "#3d555b",
    colorPrimaryBg: "rgba(111, 143, 149, 0.08)",
    colorPrimaryBgHover: "rgba(111, 143, 149, 0.12)",
    colorPrimaryBorder: "rgba(111, 143, 149, 0.25)",
    colorPrimaryBorderHover: "rgba(111, 143, 149, 0.4)",

    colorLink: PRIMARY,
    colorLinkHover: PRIMARY_DEEP,
    colorLinkActive: "#3d555b",

    colorSuccess: "#5f9b7a",
    colorWarning: "#d7a85f",
    colorError: "#c77b78",
    colorInfo: PRIMARY,

    colorText: "#1f2a30",
    colorTextSecondary: "#44525a",
    colorTextTertiary: "#6e7c84",
    colorTextQuaternary: "#95a2a9",

    colorBgBase: "#f6f8fb",
    colorBgLayout: "#f6f8fb",
    colorBgContainer: "rgba(255, 255, 255, 0.88)",
    colorBgElevated: "rgba(255, 255, 255, 0.94)",
    colorBgSpotlight: "rgba(31, 42, 48, 0.88)",

    colorBorder: "rgba(130, 150, 160, 0.22)",
    colorBorderSecondary: "rgba(130, 150, 160, 0.14)",

    colorSplit: "rgba(130, 150, 160, 0.12)",

    fontFamily:
      "Inter, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    fontSize: 14,
    lineHeight: 1.5714,

    /* 圆角：lg 8 / xl 12 / 2xl 16（与 tokens.css 一致） */
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    wireframe: false,

    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,

    boxShadow:
      "0 1px 2px rgba(12, 22, 32, 0.04), 0 4px 14px rgba(12, 22, 32, 0.05)",
    boxShadowSecondary: "0 2px 10px rgba(12, 22, 32, 0.05)",

    motionDurationFast: "0.12s",
    motionDurationMid: "0.2s",
  },
  components: {
    Layout: {
      headerBg: "rgba(248, 250, 252, 0.82)",
      headerHeight: 44,
      headerPadding: "0 16px",
      bodyBg: "transparent",
      siderBg: "transparent",
      triggerBg: "rgba(255, 255, 255, 0.55)",
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
      colorBgContainerDisabled: "#f3f5f6",
      borderColorDisabled: "rgba(130, 150, 160, 0.2)",
    },
    Input: {
      borderRadius: 8,
      activeShadow: "0 0 0 2px rgba(111, 143, 149, 0.14)",
      hoverBorderColor: "rgba(111, 143, 149, 0.35)",
    },
    InputNumber: {
      borderRadius: 8,
      activeShadow: "0 0 0 2px rgba(111, 143, 149, 0.14)",
    },
    Select: {
      borderRadius: 8,
      optionSelectedBg: "rgba(111, 143, 149, 0.08)",
      optionActiveBg: "rgba(111, 143, 149, 0.06)",
      activeOutlineColor: "rgba(111, 143, 149, 0.14)",
    },
    DatePicker: {
      borderRadius: 8,
      activeShadow: "0 0 0 2px rgba(111, 143, 149, 0.14)",
    },
    Table: {
      headerBg: "rgba(245, 248, 250, 0.96)",
      headerColor: "#44525a",
      headerSplitColor: "transparent",
      borderColor: "rgba(130, 150, 160, 0.14)",
      rowHoverBg: "rgba(111, 143, 149, 0.05)",
      rowSelectedBg: "rgba(111, 143, 149, 0.08)",
      rowSelectedHoverBg: "rgba(111, 143, 149, 0.11)",
      footerBg: "rgba(250, 251, 252, 0.92)",
    },
    Tabs: {
      inkBarColor: PRIMARY,
      itemSelectedColor: "#1f2a30",
      itemColor: "#6e7c84",
      itemHoverColor: PRIMARY_DEEP,
      titleFontSize: 14,
      horizontalItemGutter: 8,
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG: 20,
      headerBg: "transparent",
    },
    Menu: {
      itemBg: "transparent",
      itemHoverBg: "rgba(111, 143, 149, 0.06)",
      itemSelectedBg: "rgba(111, 143, 149, 0.1)",
      itemSelectedColor: "#1f2a30",
      itemColor: "#44525a",
      itemActiveBg: "rgba(111, 143, 149, 0.08)",
      popupBg: "rgba(255, 255, 255, 0.98)",
      subMenuItemBg: "transparent",
      horizontalItemSelectedBg: "rgba(111, 143, 149, 0.1)",
    },
    Modal: {
      borderRadiusLG: 16,
      contentBg: "rgba(255, 255, 255, 0.98)",
      headerBg: "transparent",
      footerBg: "transparent",
    },
    Drawer: {
      paddingLG: 20,
      colorBgElevated: "rgba(255, 255, 255, 0.96)",
    },
    Pagination: {
      itemActiveBg: "rgba(111, 143, 149, 0.1)",
      borderRadius: 8,
    },
    Tag: {
      borderRadiusSM: 999,
    },
    Alert: {
      borderRadiusLG: 12,
      colorInfoBorder: "rgba(111, 143, 149, 0.22)",
      colorSuccessBorder: "rgba(95, 155, 122, 0.25)",
      colorWarningBorder: "rgba(215, 168, 95, 0.28)",
      colorErrorBorder: "rgba(199, 123, 120, 0.28)",
    },
    Breadcrumb: {
      itemColor: "#6e7c84",
      lastItemColor: "#1f2a30",
      linkColor: PRIMARY,
      linkHoverColor: PRIMARY_DEEP,
      separatorColor: "#95a2a9",
    },
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: "0.45em",
    },
    Tooltip: {
      colorBgSpotlight: "rgba(36, 48, 54, 0.9)",
      borderRadiusSM: 8,
    },
    Dropdown: {
      borderRadiusLG: 12,
      colorBgElevated: "rgba(255, 255, 255, 0.98)",
      controlItemBgHover: "rgba(111, 143, 149, 0.06)",
    },
    Popover: {
      borderRadiusLG: 12,
      colorBgElevated: "rgba(255, 255, 255, 0.98)",
    },
    Segmented: {
      itemSelectedBg: "rgba(255, 255, 255, 0.9)",
      trackBg: "rgba(245, 248, 250, 0.95)",
    },
    Steps: {
      colorPrimary: PRIMARY,
    },
    Progress: {
      defaultColor: PRIMARY,
      remainingColor: "rgba(130, 150, 160, 0.12)",
    },
    Switch: {
      colorPrimary: PRIMARY,
    },
    Checkbox: {
      colorPrimary: PRIMARY,
    },
    Radio: {
      colorPrimary: PRIMARY,
    },
    Slider: {
      colorPrimary: PRIMARY,
      railBg: "rgba(130, 150, 160, 0.12)",
      trackHoverBg: PRIMARY_DEEP,
    },
    Spin: {
      colorPrimary: PRIMARY,
    },
    Skeleton: {
      borderRadiusSM: 8,
    },
    Empty: {
      colorTextDisabled: "#95a2a9",
      fontSize: 13,
    },
    Badge: {
      colorError: "#c77b78",
    },
    Timeline: {
      dotBg: "rgba(255, 255, 255, 0.96)",
    },
  },
};
