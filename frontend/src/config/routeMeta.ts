/**
 * 路由元信息（贷后场景导航）
 */

import { PLATFORM_SUBTITLE } from "@/config/brand";

export interface RouteMeta {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  navKey: string;
  parentNavKey?: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "首页",
    subtitle: PLATFORM_SUBTITLE,
    navKey: "home",
  },

  "/monitor/asset-quality": {
    title: "资产质量看板",
    subtitle: "Vintage / 迁徙 / 回收等（建设中）",
    breadcrumb: ["预警监控", "资产质量看板"],
    navKey: "monitor-asset-quality",
    parentNavKey: "monitor",
  },
  "/monitor/dashboard": {
    title: "预警大盘",
    subtitle: "预警态势与实时告警（原战情看板）",
    breadcrumb: ["预警监控", "预警大盘"],
    navKey: "monitor-dashboard",
    parentNavKey: "monitor",
  },
  "/monitor/o2o": {
    title: "策略效果追踪",
    subtitle: "策略上线后效果与漂移（原 O2O 一致性）",
    breadcrumb: ["预警监控", "策略效果追踪"],
    navKey: "monitor-o2o",
    parentNavKey: "monitor",
  },
  "/monitor/labeling": {
    title: "标注飞轮",
    subtitle: "仍可通过 URL 访问；侧栏已收敛至贷后菜单",
    breadcrumb: ["预警监控", "标注飞轮"],
    navKey: "monitor-labeling",
    parentNavKey: "monitor",
  },
  "/monitor/reports": {
    title: "报表中心",
    subtitle: "贷后报表与监管口径",
    breadcrumb: ["预警监控", "报表中心"],
    navKey: "monitor-reports",
    parentNavKey: "monitor",
  },

  "/strategy/products": {
    title: "产品线策略集",
    subtitle: "按产品线聚合的贷后预警策略包与运行指标",
    breadcrumb: ["策略与模型", "产品线策略集"],
    navKey: "strategy-products",
    parentNavKey: "strategy",
  },
  "/strategy/rules": {
    title: "预警规则配置",
    subtitle: "贷后规则树与行业分层阈值矩阵",
    breadcrumb: ["策略与模型", "预警规则配置"],
    navKey: "strategy-rules",
    parentNavKey: "strategy",
  },
  "/strategy/model-factory": {
    title: "模型工厂",
    subtitle: "样本、特征、训练实验与模型评估的建模平台能力",
    breadcrumb: ["策略与模型", "模型工厂"],
    navKey: "strategy-model-factory",
    parentNavKey: "strategy",
  },
  "/strategy/model-registry": {
    title: "模型版本库",
    subtitle: "模型注册、版本、Champion/Challenger 与回滚治理",
    breadcrumb: ["策略与模型", "模型版本库"],
    navKey: "strategy-model-registry",
    parentNavKey: "strategy",
  },
  "/strategy/decision-flow": {
    title: "决策流编排",
    subtitle: "规则、模型分、名单与触达动作的决策引擎画布",
    breadcrumb: ["策略与模型", "决策流编排"],
    navKey: "strategy-decision-flow",
    parentNavKey: "strategy",
  },
  "/strategy/backtest": {
    title: "仿真回溯",
    subtitle: "单规则回溯为默认高频路径，兼顾策略包仿真与决策流联调",
    breadcrumb: ["策略与模型", "仿真回溯"],
    navKey: "strategy-backtest",
    parentNavKey: "strategy",
  },
  "/strategy/publish": {
    title: "策略发布审批",
    subtitle: "预警规则 Diff、护栏与影响评估审批",
    breadcrumb: ["策略与模型", "策略发布审批"],
    navKey: "strategy-publish",
    parentNavKey: "strategy",
  },

  "/risk/workbench": {
    title: "预警核查工作台",
    subtitle: "队列 + 客户快照一体处置（合并原核查入口）",
    breadcrumb: ["处置闭环", "预警核查工作台"],
    navKey: "risk-workbench",
    parentNavKey: "risk",
  },
  "/risk/collection": {
    title: "催收作业管理",
    subtitle: "M1/M2/M3+ 分池、策略匹配与承诺 SLA",
    breadcrumb: ["处置闭环", "催收作业管理"],
    navKey: "risk-collection",
    parentNavKey: "risk",
  },
  "/risk/inspection": {
    title: "复盘与质检",
    subtitle: "RM 处置记录抽检与闭环（无授信 OCR）",
    breadcrumb: ["处置闭环", "复盘与质检"],
    navKey: "risk-inspection",
    parentNavKey: "risk",
  },

  "/knowledge": {
    title: "知识沉淀",
    subtitle: "话术、规则案例与风险模式总览",
    breadcrumb: ["数据与特征", "知识沉淀"],
    navKey: "knowledge-home",
    parentNavKey: "feature-data",
  },
  "/knowledge/scripts": {
    title: "催收话术库",
    subtitle: "分场景话术与合规版本",
    breadcrumb: ["处置闭环", "催收话术库"],
    navKey: "knowledge-scripts",
    parentNavKey: "risk",
  },
  "/knowledge/rule-cases": {
    title: "规则调优案例",
    subtitle: "调参记录与效果对比",
    breadcrumb: ["策略与模型", "调优案例"],
    navKey: "knowledge-rule-cases",
    parentNavKey: "strategy",
  },
  "/knowledge/fraud-patterns": {
    title: "风险模式库",
    subtitle: "真实贷后风险案例沉淀",
    breadcrumb: ["策略与模型", "风险模式库"],
    navKey: "knowledge-fraud-patterns",
    parentNavKey: "strategy",
  },

  "/feature/studio": {
    title: "贷后特征工作室",
    subtitle: "还款与催收反馈特征；经营贷 / 税易贷分产品线 PSI 与阈值告警",
    breadcrumb: ["数据与特征", "贷后特征工作室"],
    navKey: "feature-studio",
    parentNavKey: "feature-data",
  },
  "/data/dictionary": {
    title: "数据源管理",
    subtitle: "变量字典与数据源；企信 / 司法 / 金税三期等贷后源与刷新频率标签",
    breadcrumb: ["数据与特征", "数据源管理"],
    navKey: "data-dictionary",
    parentNavKey: "feature-data",
  },

  "/agents/attribution": {
    title: "预警归因 Agent",
    subtitle: "聚合多源信号，生成预警原因、证据链和核查方向",
    breadcrumb: ["智能体协同", "预警归因 Agent"],
    navKey: "agent-attribution",
    parentNavKey: "agent",
  },
  "/agents/disposition": {
    title: "处置建议 Agent",
    subtitle: "基于客户画像、预警等级与 SOP 推荐下一步处置动作",
    breadcrumb: ["智能体协同", "处置建议 Agent"],
    navKey: "agent-disposition",
    parentNavKey: "agent",
  },
  "/agents/strategy-tuning": {
    title: "策略调优 Agent",
    subtitle: "发现误报、漏报和阈值优化机会，推动仿真与发布流程",
    breadcrumb: ["智能体协同", "策略调优 Agent"],
    navKey: "agent-strategy-tuning",
    parentNavKey: "agent",
  },
  "/agents/script-compliance": {
    title: "话术合规 Agent",
    subtitle: "推荐场景化话术并检查威胁、诱导、隐私泄露等合规风险",
    breadcrumb: ["智能体协同", "话术合规 Agent"],
    navKey: "agent-script-compliance",
    parentNavKey: "agent",
  },
  "/agents/review-qa": {
    title: "复盘质检 Agent",
    subtitle: "批量预筛处置记录质量，推动样本回流与规则优化",
    breadcrumb: ["智能体协同", "复盘质检 Agent"],
    navKey: "agent-review-qa",
    parentNavKey: "agent",
  },
  "/agents/ops-monitor": {
    title: "Agent 运行监控",
    subtitle: "监控任务成功率、工具调用、人工采纳与审计留痕",
    breadcrumb: ["智能体协同", "Agent 运行监控"],
    navKey: "agent-ops-monitor",
    parentNavKey: "agent",
  },

  "/architecture/integration": {
    title: "系统集成与闭环说明",
    subtitle: "系统集成架构图、数据流向图与面试讲解文案",
    breadcrumb: ["演示讲解", "系统集成架构"],
    navKey: "architecture-integration",
    parentNavKey: "demo",
  },
};

function routeKeyToRegex(key: string): RegExp {
  const pattern = key.replace(/:[^/]+|[.+?^${}()|[\]\\]/g, (part) =>
    part.startsWith(":") ? "[^/]+" : `\\${part}`,
  );
  return new RegExp(`^${pattern}$`);
}

export function getRouteMeta(path: string): RouteMeta | undefined {
  if (ROUTE_META[path]) {
    return ROUTE_META[path];
  }
  const matchedKey = Object.keys(ROUTE_META).find((key) => {
    if (key.includes(":")) {
      return routeKeyToRegex(key).test(path);
    }
    return false;
  });
  return matchedKey ? ROUTE_META[matchedKey] : undefined;
}
