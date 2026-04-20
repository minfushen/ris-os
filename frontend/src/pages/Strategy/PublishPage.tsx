import { useState } from "react";
import { Typography, Button, Space, Steps, App } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import StrategyDiff from "./StrategyDiff";
import SafeGuardConfig from "./SafeGuardConfig";
import PublishWorkflowPanel from "./PublishWorkflowPanel";

const { Text } = Typography;

function buildChangeId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const r = Math.floor(100 + Math.random() * 900);
  return `CHG-${y}${m}${day}-${r}`;
}

export default function PublishPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const trackId = searchParams.get("track");

  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [safeGuardConfig, setSafeGuardConfig] = useState<Record<string, unknown>>({});

  const handleSubmit = () => {
    const id = buildChangeId();
    void message.success("策略发布申请已提交，已进入流程跟踪（演示）");
    setSearchParams({ track: id });
  };

  if (trackId) {
    return (
      <ModulePageShell
        title="策略发布进度与灰度闭环"
        subtitle="流程可视、灰度指标对比、全量/回滚决策与审计留痕（演示）"
        breadcrumb={["预警策略", "策略发布审批"]}
        actions={
          <Space>
            <Button
              onClick={() => {
                setSearchParams({});
                setCurrentStep(0);
              }}
            >
              新建变更
            </Button>
            <Button type="primary" onClick={() => navigate("/strategy/products")}>
              产品线策略集
            </Button>
          </Space>
        }
      >
        <PublishWorkflowPanel changeId={trackId} />
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title="策略变更发布申请"
      subtitle="Diff → 护盾 → 提交；提交后进入流程与灰度跟踪"
      breadcrumb={["预警策略", "策略发布审批"]}
      actions={
        <Space>
          <Button onClick={() => navigate("/strategy/products")}>取消</Button>
          {currentStep < 2 ? (
            <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
              下一步
            </Button>
          ) : (
            <Button type="primary" onClick={handleSubmit}>
              提交审核
            </Button>
          )}
        </Space>
      }
    >
      <ModuleSectionCard>
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: "查看 Diff" },
            { title: "配置护盾" },
            { title: "提交审批" },
          ]}
        />
      </ModuleSectionCard>

      {currentStep === 0 && (
        <ModuleSectionCard>
          <StrategyDiff />
          <div className="layout-mt-lg text-right">
            <Button disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
              上一步
            </Button>
          </div>
        </ModuleSectionCard>
      )}

      {currentStep === 1 && (
        <ModuleSectionCard>
          <SafeGuardConfig onChange={setSafeGuardConfig} />
          <div className="layout-mt-lg text-right">
            <Space>
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                上一步
              </Button>
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            </Space>
          </div>
        </ModuleSectionCard>
      )}

      {currentStep === 2 && (
        <ModuleSectionCard title="确认提交">
          <div className="bg-[#fffbe6] border border-[#ffe58f] layout-p-md layout-mb-md rounded-md">
            <Text strong className="text-[12px] block layout-mb-xs">发布流程（贷后）</Text>
            <Text type="secondary" className="text-[12px]">
              高影响变更：主管复核 + 联席会签后方可全量；灰度期间若触发护栏（新增预警环比 / 有效率红线）将自动熔断或进入人工回滚。
            </Text>
          </div>
          <div className="bg-[#fafafa] layout-p-md layout-mb-md">
            <Space direction="vertical" size={4}>
              <Text style={{ fontSize: 12 }}>
                • 预警规则包: 经营贷包 V2.4 → V2.5
              </Text>
              <Text style={{ fontSize: 12 }}>
                • 变更内容: 制造业多头阈值 35%→38%；税报断档天数 45→30
              </Text>
              <Text style={{ fontSize: 12 }}>
                • 灰度流量: {(safeGuardConfig.canaryPercentage as number) || 10}%
              </Text>
              <Text style={{ fontSize: 12 }}>
                • 自动熔断: {safeGuardConfig.enableCircuitBreaker ? "已开启" : "已关闭"}
              </Text>
              <Text style={{ fontSize: 12 }}>
                • 回滚策略: {safeGuardConfig.rollbackStrategy === "auto" ? "自动回滚" : "人工确认"}
              </Text>
            </Space>
          </div>
          <div className="text-right">
            <Space>
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                上一步
              </Button>
              <Button type="primary" onClick={handleSubmit}>
                提交审核
              </Button>
            </Space>
          </div>
        </ModuleSectionCard>
      )}
    </ModulePageShell>
  );
}
