/**
 * 路由元信息（贷后场景导航）
 */

export interface RouteMeta {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  navKey: string;
  parentNavKey?: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "首页·贷后资产总览",
    subtitle: "贷后指挥台 · 态势与处置入口",
    navKey: "home",
  },

  "/monitor/asset-quality": {
    title: "资产质量看板",
    subtitle: "Vintage / 迁徙 / 回收等（建设中）",
    breadcrumb: ["资产监控", "资产质量看板"],
    navKey: "monitor-asset-quality",
    parentNavKey: "monitor",
  },
  "/monitor/dashboard": {
    title: "预警探照灯",
    subtitle: "预警态势与实时告警（原战情看板）",
    breadcrumb: ["资产监控", "预警探照灯"],
    navKey: "monitor-dashboard",
    parentNavKey: "monitor",
  },
  "/monitor/o2o": {
    title: "策略效果追踪",
    subtitle: "策略上线后效果与漂移（原 O2O 一致性）",
    breadcrumb: ["资产监控", "策略效果追踪"],
    navKey: "monitor-o2o",
    parentNavKey: "monitor",
  },
  "/monitor/labeling": {
    title: "标注飞轮",
    subtitle: "仍可通过 URL 访问；侧栏已收敛至贷后菜单",
    breadcrumb: ["资产监控", "标注飞轮"],
    navKey: "monitor-labeling",
    parentNavKey: "monitor",
  },
  "/monitor/reports": {
    title: "报表中心",
    subtitle: "贷后报表与监管口径",
    breadcrumb: ["资产监控", "报表中心"],
    navKey: "monitor-reports",
    parentNavKey: "monitor",
  },

  "/strategy/products": {
    title: "产品线策略集",
    subtitle: "按产品线聚合的贷后预警策略包与运行指标",
    breadcrumb: ["预警策略", "产品线策略集"],
    navKey: "strategy-products",
    parentNavKey: "strategy",
  },
  "/strategy/rules": {
    title: "预警规则配置",
    subtitle: "贷后规则树与行业分层阈值矩阵",
    breadcrumb: ["预警策略", "预警规则配置"],
    navKey: "strategy-rules",
    parentNavKey: "strategy",
  },
  "/strategy/backtest": {
    title: "规则仿真回测",
    subtitle: "预警规则集 · 提前天数与转化率回测",
    breadcrumb: ["预警策略", "规则仿真回测"],
    navKey: "strategy-backtest",
    parentNavKey: "strategy",
  },
  "/strategy/publish": {
    title: "策略发布审批",
    subtitle: "预警规则 Diff、护栏与影响评估审批",
    breadcrumb: ["预警策略", "策略发布审批"],
    navKey: "strategy-publish",
    parentNavKey: "strategy",
  },

  "/risk/workbench": {
    title: "预警核查工作台",
    subtitle: "队列 + 客户快照一体处置（合并原核查入口）",
    breadcrumb: ["案件处置", "预警核查工作台"],
    navKey: "risk-workbench",
    parentNavKey: "risk",
  },
  "/risk/collection": {
    title: "催收作业管理",
    subtitle: "M1/M2/M3+ 分池、策略匹配与承诺 SLA",
    breadcrumb: ["案件处置", "催收作业管理"],
    navKey: "risk-collection",
    parentNavKey: "risk",
  },
  "/risk/inspection": {
    title: "复盘与质检",
    subtitle: "RM 处置记录抽检与闭环（无授信 OCR）",
    breadcrumb: ["案件处置", "复盘与质检"],
    navKey: "risk-inspection",
    parentNavKey: "risk",
  },

  "/knowledge": {
    title: "知识沉淀",
    subtitle: "话术、规则案例与风险模式总览",
    breadcrumb: ["知识沉淀", "总览"],
    navKey: "knowledge-home",
    parentNavKey: "knowledge",
  },
  "/knowledge/scripts": {
    title: "催收话术库",
    subtitle: "分场景话术与合规版本",
    breadcrumb: ["知识沉淀", "催收话术库"],
    navKey: "knowledge-scripts",
    parentNavKey: "knowledge",
  },
  "/knowledge/rule-cases": {
    title: "规则调优案例",
    subtitle: "调参记录与效果对比",
    breadcrumb: ["知识沉淀", "规则调优案例"],
    navKey: "knowledge-rule-cases",
    parentNavKey: "knowledge",
  },
  "/knowledge/fraud-patterns": {
    title: "风险模式库",
    subtitle: "真实贷后风险案例沉淀",
    breadcrumb: ["知识沉淀", "风险模式库"],
    navKey: "knowledge-fraud-patterns",
    parentNavKey: "knowledge",
  },

  "/feature/studio": {
    title: "贷后特征工作室",
    subtitle: "还款与催收反馈特征；经营贷 / 税易贷分产品线 PSI 与阈值告警",
    breadcrumb: ["特征与数据", "贷后特征工作室"],
    navKey: "feature-studio",
    parentNavKey: "feature-data",
  },
  "/data/dictionary": {
    title: "数据源管理",
    subtitle: "变量字典与数据源；企信 / 司法 / 金税三期等贷后源与刷新频率标签",
    breadcrumb: ["特征与数据", "数据源管理"],
    navKey: "data-dictionary",
    parentNavKey: "feature-data",
  },
};

export function getRouteMeta(path: string): RouteMeta | undefined {
  if (ROUTE_META[path]) {
    return ROUTE_META[path];
  }
  const matchedKey = Object.keys(ROUTE_META).find((key) => {
    if (key.includes(":")) {
      const regex = new RegExp("^" + key.replace(/:[^/]+/g, "[^/]+") + "$");
      return regex.test(path);
    }
    return false;
  });
  return matchedKey ? ROUTE_META[matchedKey] : undefined;
}

export function getPageTitle(path: string): string {
  const meta = getRouteMeta(path);
  if (meta) {
    return `${meta.title} - 风控 OS`;
  }
  return "风控 OS";
}
