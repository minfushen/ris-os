/**
 * 路由元信息配置
 * 用于顶栏标题、面包屑、导航高亮等
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
    title: "工作台",
    subtitle: "风控 OS 总览",
    navKey: "workbench",
  },

  // 监控与分析
  "/monitor/dashboard": {
    title: "战情看板",
    subtitle: "实时业务指标监控",
    breadcrumb: ["监控与分析", "战情看板"],
    navKey: "monitor-dashboard",
    parentNavKey: "monitor",
  },
  "/monitor/o2o": {
    title: "O2O一致性监控",
    subtitle: "线上线下一致性检查",
    breadcrumb: ["监控与分析", "O2O一致性"],
    navKey: "monitor-o2o",
    parentNavKey: "monitor",
  },
  "/monitor/labeling": {
    title: "标注飞轮",
    subtitle: "专家标注与知识回流",
    breadcrumb: ["监控与分析", "标注飞轮"],
    navKey: "monitor-labeling",
    parentNavKey: "monitor",
  },
  "/monitor/reports": {
    title: "报表中心",
    subtitle: "Vintage、Roll Rate 等报表",
    breadcrumb: ["监控与分析", "报表中心"],
    navKey: "monitor-reports",
    parentNavKey: "monitor",
  },

  // 策略管控
  "/strategy/list": {
    title: "策略集管理",
    subtitle: "策略版本与配置",
    breadcrumb: ["策略管控", "策略集"],
    navKey: "strategy-list",
    parentNavKey: "strategy",
  },
  "/strategy/rules": {
    title: "规则引擎",
    subtitle: "规则配置与调试",
    breadcrumb: ["策略管控", "规则引擎"],
    navKey: "strategy-rules",
    parentNavKey: "strategy",
  },
  "/strategy/backtest": {
    title: "仿真回测",
    subtitle: "离线样本回测",
    breadcrumb: ["策略管控", "仿真回测"],
    navKey: "strategy-backtest",
    parentNavKey: "strategy",
  },
  "/strategy/publish": {
    title: "策略发布",
    subtitle: "策略变更审批流",
    breadcrumb: ["策略管控", "策略发布"],
    navKey: "strategy-publish",
    parentNavKey: "strategy",
  },

  // 风险核查
  "/risk/fraud": {
    title: "欺诈排查",
    subtitle: "团伙探测与风险调查",
    breadcrumb: ["风险核查", "欺诈排查"],
    navKey: "risk-fraud",
    parentNavKey: "risk",
  },
  "/risk/inspection": {
    title: "专家抽检",
    subtitle: "质检与复核",
    breadcrumb: ["风险核查", "专家抽检"],
    navKey: "risk-inspection",
    parentNavKey: "risk",
  },

  // 特征工程
  "/feature/studio": {
    title: "特征工作室",
    subtitle: "特征开发与管理",
    breadcrumb: ["特征工程", "特征工作室"],
    navKey: "feature",
  },

  // 数据资产
  "/data/dictionary": {
    title: "数据字典",
    subtitle: "变量与数据源管理",
    breadcrumb: ["数据资产", "数据字典"],
    navKey: "data",
  },
};

/**
 * 获取路由元信息
 */
export function getRouteMeta(path: string): RouteMeta | undefined {
  // 精确匹配
  if (ROUTE_META[path]) {
    return ROUTE_META[path];
  }

  // 前缀匹配（用于动态路由）
  const matchedKey = Object.keys(ROUTE_META).find((key) => {
    if (key.includes(":")) {
      const regex = new RegExp("^" + key.replace(/:[^/]+/g, "[^/]+") + "$");
      return regex.test(path);
    }
    return false;
  });

  return matchedKey ? ROUTE_META[matchedKey] : undefined;
}

/**
 * 获取页面标题
 */
export function getPageTitle(path: string): string {
  const meta = getRouteMeta(path);
  if (meta) {
    return `${meta.title} - 风控 OS`;
  }
  return "风控 OS";
}
