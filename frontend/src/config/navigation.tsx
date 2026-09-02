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
  ApartmentOutlined,
  RetweetOutlined,
  HistoryOutlined,
  UploadOutlined,
  FileDoneOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { PLATFORM_SUBTITLE } from "@/config/brand";

export interface NavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: NavItem[];
  /** 收进「更多」下的二级项；当前主导航不使用，保留兼容侧栏渲染能力 */
  moreChildren?: NavItem[];
  badge?: number | string;
  description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  {
    key: "home",
    label: "平台首页",
    icon: <HomeOutlined />,
    path: "/",
    badge: 8,
    description: PLATFORM_SUBTITLE,
  },
  {
    key: "project",
    label: "项目实施",
    icon: <FileDoneOutlined />,
    description: "对照《项目实施计划书》：阶段里程碑、交付物、风险与验收",
    children: [
      {
        key: "project-plan",
        label: "项目实施全景",
        icon: <FileDoneOutlined />,
        path: "/project/plan",
        description: "一页纸总览 / 阶段里程碑 / 交付物清单 / 风险与验收",
      },
    ],
  },
  {
    key: "monitor",
    label: "预警监控",
    icon: <DashboardOutlined />,
    description: "从资产质量到预警态势、效果追踪和标注回流",
    children: [
      {
        key: "monitor-dashboard",
        label: "预警大盘",
        icon: <AlertOutlined />,
        path: "/monitor/dashboard",
        badge: 23,
        description: "贷后预警主看板：预警态势、模型效果与待处置队列",
      },
      {
        key: "monitor-watchlist-upload",
        label: "监控名单上传",
        icon: <UploadOutlined />,
        path: "/monitor/watchlist-upload",
        description: "批量上传贷后监控名单并自动评估入预警队列",
      },
      {
        key: "monitor-asset-quality",
        label: "资产质量",
        icon: <FundOutlined />,
        path: "/monitor/asset-quality",
        description: "Vintage / 迁徙 / 回收等资产质量指标",
      },
      {
        key: "monitor-o2o",
        label: "策略效果",
        icon: <ApiOutlined />,
        path: "/monitor/o2o",
        description: "策略上线后效果与漂移追踪",
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
    key: "risk",
    label: "处置闭环",
    icon: <SafetyOutlined />,
    description: "预警核查、催收作业、话术辅助和复盘质检",
    children: [
      {
        key: "risk-workbench",
        label: "预警核查工作台",
        icon: <SafetyOutlined />,
        path: "/risk/workbench",
        badge: 12,
        description: "队列 + 客户快照一体处置",
      },
      {
        key: "risk-collection",
        label: "催收作业",
        icon: <CustomerServiceOutlined />,
        path: "/risk/collection",
        description: "催收分案与作业队列",
      },
      {
        key: "knowledge-scripts",
        label: "催收话术库",
        icon: <BookOutlined />,
        path: "/knowledge/scripts",
        description: "按行业与逾期分档",
      },
      {
        key: "risk-inspection",
        label: "复盘质检",
        icon: <AuditOutlined />,
        path: "/risk/inspection",
        description: "处置记录抽检与闭环复盘",
      },
    ],
  },
  {
    key: "strategy",
    label: "策略与模型",
    icon: <ControlOutlined />,
    description: "产品策略、预警规则、仿真发布与知识化沉淀",
    children: [
      {
        key: "strategy-products",
        label: "产品策略",
        icon: <SettingOutlined />,
        path: "/strategy/products",
        description: "按产品线的贷后预警策略包与运行指标",
      },
      {
        key: "strategy-rules",
        label: "预警规则",
        icon: <ControlOutlined />,
        path: "/strategy/rules",
        description: "贷后规则树与行业分层阈值矩阵",
      },
      {
        key: "strategy-model-factory",
        label: "模型工厂",
        icon: <ExperimentOutlined />,
        path: "/strategy/model-factory",
        description: "样本、特征、训练实验与模型评估",
      },
      {
        key: "strategy-model-registry",
        label: "模型版本库",
        icon: <DatabaseOutlined />,
        path: "/strategy/model-registry",
        description: "模型注册、版本、Champion/Challenger 与回滚",
      },
      {
        key: "strategy-decision-flow",
        label: "决策流编排",
        icon: <PartitionOutlined />,
        path: "/strategy/decision-flow",
        description: "规则、模型分、名单与触达动作的决策引擎画布",
      },
      {
        key: "strategy-backtest",
        label: "仿真回溯",
        icon: <HistoryOutlined />,
        path: "/strategy/backtest",
        description: "单规则回溯、策略包仿真与决策流联调",
      },
      {
        key: "strategy-publish",
        label: "发布审批",
        icon: <ThunderboltOutlined />,
        path: "/strategy/publish",
        description: "规则 Diff、护栏与影响评估审批",
      },
      {
        key: "knowledge-rule-cases",
        label: "调优案例",
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
    label: "数据与特征",
    icon: <PartitionOutlined />,
    description: "贷后特征、数据源和知识资产",
    children: [
      {
        key: "feature-studio",
        label: "特征工作室",
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
      {
        key: "knowledge-home",
        label: "知识沉淀",
        icon: <BookOutlined />,
        path: "/knowledge",
        description: "话术、规则案例与风险模式入口",
      },
    ],
  },
  {
    key: "agents",
    label: "智能体协同",
    icon: <RobotOutlined />,
    description: "预警归因、处置建议、策略调优、话术合规、复盘质检与运行监控",
    children: [
      {
        key: "agent-attribution",
        label: "预警归因 Agent",
        icon: <AlertOutlined />,
        path: "/agents/attribution",
        description: "聚合多源信号，生成预警原因、证据链和核查方向",
      },
      {
        key: "agent-vendor-risk-assessment",
        label: "企业风险评估 Agent",
        icon: <SafetyOutlined />,
        path: "/agents/vendor-risk-assessment",
        description: "基于企查查 MCP 的 9 维度风险评估与处置建议",
      },
      {
        key: "agent-disposition",
        label: "处置建议 Agent",
        icon: <CustomerServiceOutlined />,
        path: "/agents/disposition",
        description: "基于客户画像、预警等级与 SOP 推荐下一步处置动作",
      },
      {
        key: "agent-strategy-tuning",
        label: "策略调优 Agent",
        icon: <ControlOutlined />,
        path: "/agents/strategy-tuning",
        description: "发现误报、漏报和阈值优化机会，推动仿真与发布流程",
      },
      {
        key: "agent-script-compliance",
        label: "话术合规 Agent",
        icon: <BookOutlined />,
        path: "/agents/script-compliance",
        description: "推荐场景化话术并检查威胁、诱导、隐私泄露等合规风险",
      },
      {
        key: "agent-review-qa",
        label: "复盘质检 Agent",
        icon: <AuditOutlined />,
        path: "/agents/review-qa",
        description: "批量预筛处置记录质量，推动样本回流与规则优化",
      },
      {
        key: "agent-ops-monitor",
        label: "Agent 运行监控",
        icon: <DashboardOutlined />,
        path: "/agents/ops-monitor",
        description: "监控任务成功率、工具调用、人工采纳与审计留痕",
      },
    ],
  },
  {
    key: "demo",
    label: "演示讲解",
    icon: <ApartmentOutlined />,
    description: "项目演示用的系统集成、数据流向与闭环设计",
    children: [
      {
        key: "architecture-integration",
        label: "系统集成架构",
        icon: <ApiOutlined />,
        path: "/architecture/integration",
        description: "系统集成架构图",
      },
      {
        key: "architecture-data-flow",
        label: "数据流向说明",
        icon: <DatabaseOutlined />,
        path: "/architecture/integration#data-flow",
        description: "贷后预警数据链路",
      },
      {
        key: "architecture-closed-loop",
        label: "闭环设计亮点",
        icon: <RetweetOutlined />,
        path: "/architecture/integration#closed-loop",
        description: "监控驱动迭代与处置闭环",
      },
      {
        key: "architecture-p2-boundary",
        label: "P2 能力边界",
        icon: <AuditOutlined />,
        path: "/architecture/integration#p2-boundary",
        description: "暂缓生产级能力说明",
      },
    ],
  },
];
