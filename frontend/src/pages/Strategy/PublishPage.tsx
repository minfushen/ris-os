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
        breadcrumb={["策略管控", "策略发布"]}
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
            <Button type="primary" onClick={() => navigate("/strategy/list")}>
              策略列表
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
      breadcrumb={["策略管控", "策略发布"]}
      actions={
        <Space>
          <Button onClick={() => navigate("/strategy/list")}>取消</Button>
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
          <div className="bg-[#fafafa] layout-p-md layout-mb-md">
            <Space direction="vertical" size={4}>
              <Text style={{ fontSize: 12 }}>
                • 策略版本: V3.1 → V3.2
              </Text>
              <Text style={{ fontSize: 12 }}>
                • 变更内容: 放宽多头查询阈值、收紧负债率阈值
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
