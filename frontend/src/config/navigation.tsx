/**
 * 导航配置（贷后场景 scenario/post-loan）
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
  AuditOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  BookOutlined,
  PartitionOutlined,
  FundOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  TagsOutlined,
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

export const PRIMARY_NAV: NavItem[] = [
  {
    key: "home",
    label: "首页·贷后资产总览",
    icon: <HomeOutlined />,
    path: "/",
    description: "贷后指挥台总览与第一行动入口",
  },
  {
    key: "monitor",
    label: "资产监控",
    icon: <DashboardOutlined />,
    description: "资产质量、预警探照、策略效果、标注飞轮与贷后报表",
    children: [
      {
        key: "monitor-asset-quality",
        label: "资产质量看板",
        icon: <FundOutlined />,
        path: "/monitor/asset-quality",
        description: "Vintage / 迁徙 / 回收等资产质量指标",
      },
      {
        key: "monitor-dashboard",
        label: "预警探照灯",
        icon: <AlertOutlined />,
        path: "/monitor/dashboard",
        description: "原战情看板路由承载的预警态势视图",
      },
      {
        key: "monitor-o2o",
        label: "策略效果追踪",
        icon: <ApiOutlined />,
        path: "/monitor/o2o",
        description: "原 O2O 一致性：策略上线后效果与漂移追踪",
      },
      {
        key: "monitor-labeling",
        label: "标注飞轮",
        icon: <TagsOutlined />,
        path: "/monitor/labeling",
        description: "预警核查结论回流、样本池与 MLOps 闭环",
      },
      {
        key: "monitor-reports",
        label: "报表中心",
        icon: <FileTextOutlined />,
        path: "/monitor/reports",
        description: "贷后报表与监管报送口径",
      },
    ],
  },
  {
    key: "strategy",
    label: "预警策略",
    icon: <ControlOutlined />,
    description: "产品线策略、预警规则、仿真与发布审批",
    children: [
      {
        key: "strategy-products",
        label: "产品线策略集",
        icon: <SettingOutlined />,
        path: "/strategy/products",
        description: "按产品线的贷后预警策略包与运行指标",
      },
      {
        key: "strategy-rules",
        label: "预警规则配置",
        icon: <ControlOutlined />,
        path: "/strategy/rules",
        description: "原规则引擎；可扩展行业分层等",
      },
      {
        key: "strategy-backtest",
        label: "规则仿真回测",
        icon: <ExperimentOutlined />,
        path: "/strategy/backtest",
        description: "原仿真回测",
      },
      {
        key: "strategy-publish",
        label: "策略发布审批",
        icon: <ThunderboltOutlined />,
        path: "/strategy/publish",
        description: "原策略发布",
      },
    ],
  },
  {
    key: "risk",
    label: "案件处置",
    icon: <SafetyOutlined />,
    description: "预警核查、催收作业、复盘质检",
    children: [
      {
        key: "risk-workbench",
        label: "预警核查工作台",
        icon: <SafetyOutlined />,
        path: "/risk/workbench",
        description: "队列 + 快照一体；合并原核查入口",
      },
      {
        key: "risk-collection",
        label: "催收作业管理",
        icon: <CustomerServiceOutlined />,
        path: "/risk/collection",
        description: "催收分案与作业队列",
      },
      {
        key: "risk-inspection",
        label: "复盘与质检",
        icon: <AuditOutlined />,
        path: "/risk/inspection",
        description: "原专家抽检与质检复盘",
      },
    ],
  },
  {
    key: "knowledge",
    label: "知识沉淀",
    icon: <BookOutlined />,
    description: "话术、规则案例与风险模式，可在工作台调用",
    children: [
      {
        key: "knowledge-home",
        label: "知识总览",
        icon: <BookOutlined />,
        path: "/knowledge",
        description: "三大知识库入口",
      },
      {
        key: "knowledge-scripts",
        label: "催收话术库",
        icon: <BookOutlined />,
        path: "/knowledge/scripts",
        description: "按行业与逾期分档",
      },
      {
        key: "knowledge-rule-cases",
        label: "规则调优案例",
        icon: <FileTextOutlined />,
        path: "/knowledge/rule-cases",
        description: "历史调参与效果对比",
      },
      {
        key: "knowledge-fraud-patterns",
        label: "风险模式库",
        icon: <SafetyOutlined />,
        path: "/knowledge/fraud-patterns",
        description: "真实案例与识别要点",
      },
    ],
  },
  {
    key: "feature-data",
    label: "特征与数据",
    icon: <PartitionOutlined />,
    description: "贷后特征与数据源（含司法/工商等扩展）",
    children: [
      {
        key: "feature-studio",
        label: "贷后特征工作室",
        icon: <LineChartOutlined />,
        path: "/feature/studio",
        description: "聚焦贷后的特征开发与管理",
      },
      {
        key: "data-dictionary",
        label: "数据源管理",
        icon: <DatabaseOutlined />,
        path: "/data/dictionary",
        description: "原数据字典；扩展司法/工商等数据源",
      },
    ],
  },
];

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

export function getNavItemByPath(path: string): NavItem | undefined {
  const paths = getAllPaths();
  return paths[path];
}
