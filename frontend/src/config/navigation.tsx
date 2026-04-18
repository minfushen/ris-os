/**
 * 导航配置 - 集中管理所有菜单项
 */

import type { ReactNode } from "react";
import {
  HomeOutlined,
  DashboardOutlined,
  ControlOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  FileTextOutlined,
  ApiOutlined,
  SearchOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export interface NavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number | string;
  description?: string;
}

// 一级菜单定义
export const PRIMARY_NAV: NavItem[] = [
  {
    key: "workbench",
    label: "工作台",
    icon: <HomeOutlined />,
    path: "/",
    description: "风控 OS 总览与快捷入口",
  },
  {
    key: "monitor",
    label: "监控与分析",
    icon: <DashboardOutlined />,
    description: "实时监控、归因分析、一致性检查",
    children: [
      {
        key: "monitor-dashboard",
        label: "战情看板",
        icon: <DashboardOutlined />,
        path: "/monitor/dashboard",
        description: "实时业务指标监控",
      },
      {
        key: "monitor-o2o",
        label: "O2O一致性",
        icon: <ApiOutlined />,
        path: "/monitor/o2o",
        description: "线上线下一致性监控",
      },
      {
        key: "monitor-labeling",
        label: "标注飞轮",
        icon: <AuditOutlined />,
        path: "/monitor/labeling",
        description: "专家标注与知识回流",
      },
      {
        key: "monitor-reports",
        label: "报表中心",
        icon: <FileTextOutlined />,
        path: "/monitor/reports",
        description: "Vintage、Roll Rate 报表",
      },
    ],
  },
  {
    key: "strategy",
    label: "策略管控",
    icon: <ControlOutlined />,
    description: "策略开发、仿真、发布、治理",
    children: [
      {
        key: "strategy-list",
        label: "策略集",
        icon: <SettingOutlined />,
        path: "/strategy/list",
        description: "策略版本管理",
      },
      {
        key: "strategy-rules",
        label: "规则引擎",
        icon: <ControlOutlined />,
        path: "/strategy/rules",
        description: "规则配置与调试",
      },
      {
        key: "strategy-backtest",
        label: "仿真回测",
        icon: <ExperimentOutlined />,
        path: "/strategy/backtest",
        description: "离线样本回测",
      },
      {
        key: "strategy-publish",
        label: "策略发布",
        icon: <ThunderboltOutlined />,
        path: "/strategy/publish",
        description: "策略变更审批流",
      },
    ],
  },
  {
    key: "risk",
    label: "风险核查",
    icon: <SafetyOutlined />,
    description: "欺诈排查、专家抽检",
    children: [
      {
        key: "risk-fraud",
        label: "欺诈排查",
        icon: <SearchOutlined />,
        path: "/risk/fraud",
        description: "团伙探测与风险调查",
      },
      {
        key: "risk-inspection",
        label: "专家抽检",
        icon: <AuditOutlined />,
        path: "/risk/inspection",
        description: "质检与复核",
      },
    ],
  },
  {
    key: "feature",
    label: "特征工程",
    icon: <LineChartOutlined />,
    path: "/feature/studio",
    description: "特征开发与管理",
  },
  {
    key: "data",
    label: "数据资产",
    icon: <DatabaseOutlined />,
    path: "/data/dictionary",
    description: "数据字典与血缘",
  },
];

// 获取所有路径映射
export function getAllPaths(): Record<string, NavItem> {
  const paths: Record<string, NavItem> = {};

  function traverse(items: NavItem[]) {
    items.forEach((item) => {
      if (item.path) {
        paths[item.path] = item;
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  }

  traverse(PRIMARY_NAV);
  return paths;
}

// 根据路径获取父级菜单 key
export function getParentKey(path: string): string | undefined {
  for (const item of PRIMARY_NAV) {
    if (item.path === path) {
      return undefined;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) {
          return item.key;
        }
      }
    }
  }
  return undefined;
}

// 根据路径获取菜单项
export function getNavItemByPath(path: string): NavItem | undefined {
  const paths = getAllPaths();
  return paths[path];
}
