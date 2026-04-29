import { Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { ModuleSectionCard } from "@/components/ModulePageShell";
import { useDemoRoleStore, type DemoRole } from "@/store/demoRoleStore";

interface NavStep {
  label: string;
  desc?: string;
  path: string;
}

interface DemoFlowNavProps {
  prev?: NavStep;
  next?: NavStep;
}

type RoleFlowMap = Record<string, { prev?: NavStep; next?: NavStep }>;

const FLOW: Record<DemoRole, RoleFlowMap> = {
  relationship_manager: {
    "/": {
      next: { label: "预警大盘", desc: "查看实时预警态势", path: "/monitor/dashboard" },
    },
    "/monitor/dashboard": {
      prev: { label: "首页", desc: "返回工作台首页", path: "/" },
      next: { label: "预警核查工作台", desc: "进入预警处置闭环", path: "/risk/workbench" },
    },
    "/risk/workbench": {
      prev: { label: "预警大盘", desc: "返回预警大盘", path: "/monitor/dashboard" },
      next: { label: "欺诈模式库", desc: "查看关联欺诈模式", path: "/knowledge/fraud-patterns" },
    },
    "/knowledge/fraud-patterns": {
      prev: { label: "预警核查工作台", desc: "返回核查工作台", path: "/risk/workbench" },
    },
  },
  risk_modeler: {
    "/data/dictionary": {
      next: { label: "特征工作室", desc: "进入特征分析与 PSI 监控", path: "/feature/studio" },
    },
    "/feature/studio": {
      prev: { label: "数据字典", desc: "返回数据字典", path: "/data/dictionary" },
      next: { label: "模型工厂", desc: "使用特征训练风控模型", path: "/strategy/model-factory" },
    },
    "/strategy/model-factory": {
      prev: { label: "特征工作室", desc: "返回特征工作室", path: "/feature/studio" },
      next: { label: "模型版本库", desc: "查看模型版本与准入", path: "/strategy/model-registry" },
    },
    "/strategy/model-registry": {
      prev: { label: "模型工厂", desc: "返回模型工厂", path: "/strategy/model-factory" },
      next: { label: "决策流编排", desc: "将模型部署到决策流", path: "/strategy/decision-flow" },
    },
    "/strategy/decision-flow": {
      prev: { label: "模型版本库", desc: "返回模型版本库", path: "/strategy/model-registry" },
      next: { label: "仿真回溯", desc: "验证决策流效果", path: "/strategy/backtest" },
    },
    "/strategy/backtest": {
      prev: { label: "决策流编排", desc: "返回决策流编排", path: "/strategy/decision-flow" },
    },
  },
  strategy_approver: {
    "/strategy/backtest": {
      next: { label: "策略发布", desc: "提交变更审批", path: "/strategy/publish" },
    },
    "/strategy/publish": {
      prev: { label: "仿真回溯", desc: "返回仿真回溯", path: "/strategy/backtest" },
      next: { label: "策略产品", desc: "查看策略产品矩阵", path: "/strategy/products" },
    },
    "/strategy/products": {
      prev: { label: "策略发布", desc: "返回策略发布", path: "/strategy/publish" },
      next: { label: "规则库", desc: "查看规则配置详情", path: "/strategy/rules" },
    },
    "/strategy/rules": {
      prev: { label: "策略产品", desc: "返回策略产品", path: "/strategy/products" },
      next: { label: "调优案例", desc: "查看规则调优案例", path: "/knowledge/rule-tune-cases" },
    },
    "/knowledge/rule-tune-cases": {
      prev: { label: "规则库", desc: "返回规则库", path: "/strategy/rules" },
    },
  },
};

export default function DemoFlowNav({ prev, next }: DemoFlowNavProps) {
  const { role } = useDemoRoleStore();
  const { pathname } = useLocation();

  const roleFlow = FLOW[role]?.[pathname];
  const effectivePrev = prev ?? roleFlow?.prev;
  const effectiveNext = next ?? roleFlow?.next;

  if (!effectivePrev && !effectiveNext) return null;

  return (
    <ModuleSectionCard title="操作导航">
      <div className="flex justify-between gap-4">
        <div>
          {effectivePrev ? (
            <Link to={effectivePrev.path}>
              <Button icon={<ArrowLeftOutlined />} size="middle">
                上一步：{effectivePrev.label}
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div>
          {effectiveNext ? (
            <Link to={effectiveNext.path}>
              <Button type="primary" icon={<ArrowRightOutlined />} size="middle">
                下一步：{effectiveNext.label}
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </ModuleSectionCard>
  );
}
