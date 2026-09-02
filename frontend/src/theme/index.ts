import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { designPalette as P } from "./designPalette";

/** 与 `tokens.css`、`designPalette.ts` 对齐 */
export const theme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: P.primary,
    colorPrimaryHover: P.primaryDeep,
    colorPrimaryActive: P.primaryActive,
    colorPrimaryBg: P.primaryBg,
    colorPrimaryBgHover: P.primaryBgHover,
    colorPrimaryBorder: P.primaryBorder,
    colorPrimaryBorderHover: P.primaryBorderHover,

    colorLink: P.primary,
    colorLinkHover: P.primaryDeep,
    colorLinkActive: P.primaryActive,

    colorSuccess: P.success,
    colorSuccessBg: P.successBg,
    colorSuccessBorder: P.successBorder,

    colorWarning: P.warning,
    colorWarningBg: P.warningBg,
    colorWarningBorder: P.warningBorder,

    colorError: P.danger,
    colorErrorBg: P.dangerBg,
    colorErrorBorder: P.dangerBorder,

    colorInfo: P.info,
    colorInfoBg: P.infoBg,
    colorInfoBorder: P.infoBorder,

    colorText: P.text,
    colorTextSecondary: P.textSecondary,
    colorTextTertiary: P.textTertiary,
    colorTextQuaternary: P.textQuaternary,

    colorBgBase: P.bgLayout,
    colorBgLayout: P.bgLayout,
    colorBgContainer: P.bgContainer,
    colorBgElevated: P.bgContainer,
    colorBgSpotlight: P.bgSpotlight,

    colorBorder: P.border,
    colorBorderSecondary: P.borderSecondary,

    colorSplit: P.split,

    fontFamily:
      "Inter, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    fontSize: 13,
    lineHeight: 1.5714,

    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    wireframe: false,

    controlHeight: 32,
    controlHeightLG: 36,
    controlHeightSM: 28,

    boxShadow: P.shadowSurface,
    boxShadowSecondary: P.shadowSecondary,

    motionDurationFast: "0.12s",
    motionDurationMid: "0.2s",
  },
  components: {
    Layout: {
      headerBg: P.headerGlass,
      headerHeight: 44,
      headerPadding: "0 16px",
      bodyBg: "transparent",
      siderBg: P.bgContainer,
      triggerBg: P.triggerBg,
    },
    Button: {
      borderRadius: 6,
      borderRadiusSM: 4,
      controlHeight: 32,
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
      colorBgContainerDisabled: P.bgDisabled,
      borderColorDisabled: P.borderMuted12,
    },
    Input: {
      borderRadius: 6,
      activeShadow: `0 0 0 2px ${P.primaryAlpha14}`,
      hoverBorderColor: "rgba(37, 99, 235, 0.35)",
    },
    InputNumber: {
      borderRadius: 6,
      activeShadow: `0 0 0 2px ${P.primaryAlpha14}`,
    },
    Select: {
      borderRadius: 6,
      optionSelectedBg: P.primaryAlpha08,
      optionActiveBg: P.primaryAlpha06,
      activeOutlineColor: P.primaryAlpha14,
    },
    DatePicker: {
      borderRadius: 6,
      activeShadow: `0 0 0 2px ${P.primaryAlpha14}`,
    },
    Table: {
      headerBg: P.tableHeaderBg,
      headerColor: P.textTertiary,
      headerSplitColor: "transparent",
      borderColor: P.borderMuted08,
      rowHoverBg: P.primaryAlpha05,
      rowSelectedBg: P.primaryAlpha08,
      rowSelectedHoverBg: P.primaryAlpha11,
      footerBg: P.tableFooterBg,
      fontSize: 13,
    },
    Tabs: {
      inkBarColor: P.primary,
      itemSelectedColor: P.text,
      itemColor: P.textTertiary,
      itemHoverColor: P.primaryDeep,
      titleFontSize: 14,
      horizontalItemGutter: 8,
    },
    Card: {
      borderRadiusLG: 8,
      paddingLG: 16,
      headerBg: "transparent",
    },
    Menu: {
      itemBg: "transparent",
      itemHoverBg: P.primaryAlpha06,
      itemSelectedBg: P.primaryAlpha10,
      itemSelectedColor: P.text,
      itemColor: P.textSecondary,
      itemActiveBg: P.primaryAlpha08,
      popupBg: P.bgContainer,
      subMenuItemBg: "transparent",
      horizontalItemSelectedBg: P.primaryAlpha10,
    },
    Modal: {
      borderRadiusLG: 12,
      contentBg: P.bgContainer,
      headerBg: "transparent",
      footerBg: "transparent",
    },
    Drawer: {
      paddingLG: 16,
      colorBgElevated: P.bgContainer,
    },
    Pagination: {
      itemActiveBg: P.primaryAlpha10,
      borderRadius: 6,
    },
    Tag: {
      borderRadiusSM: 2,
      fontSizeSM: 11,
    },
    Alert: {
      borderRadiusLG: 8,
      colorInfoBorder: P.primaryAlpha22,
      colorSuccessBorder: "rgba(34, 197, 94, 0.28)",
      colorWarningBorder: "rgba(245, 158, 11, 0.28)",
      colorErrorBorder: "rgba(220, 38, 38, 0.28)",
    },
    Breadcrumb: {
      itemColor: P.textTertiary,
      lastItemColor: P.text,
      linkColor: P.primary,
      linkHoverColor: P.primaryDeep,
      separatorColor: P.textQuaternary,
    },
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: "0.45em",
    },
    Tooltip: {
      colorBgSpotlight: P.tooltipSpotlight,
      borderRadiusSM: 6,
    },
    Dropdown: {
      borderRadiusLG: 8,
      colorBgElevated: P.bgContainer,
      controlItemBgHover: P.primaryAlpha06,
    },
    Popover: {
      borderRadiusLG: 8,
      colorBgElevated: P.bgContainer,
    },
    Segmented: {
      itemSelectedBg: P.bgContainer,
      trackBg: P.segmentedTrack,
    },
    Steps: {
      colorPrimary: P.primary,
    },
    Progress: {
      defaultColor: P.primary,
      remainingColor: P.borderMuted08,
    },
    Switch: {
      colorPrimary: P.primary,
    },
    Checkbox: {
      colorPrimary: P.primary,
    },
    Radio: {
      colorPrimary: P.primary,
    },
    Slider: {
      colorPrimary: P.primary,
      railBg: P.borderMuted08,
      trackHoverBg: P.primaryDeep,
    },
    Spin: {
      colorPrimary: P.primary,
    },
    Skeleton: {
      borderRadiusSM: 6,
    },
    Empty: {
      colorTextDisabled: P.textQuaternary,
      fontSize: 13,
    },
    Badge: {
      colorError: P.dangerLight,
    },
    Timeline: {
      dotBg: P.bgContainer,
    },
  },
};
