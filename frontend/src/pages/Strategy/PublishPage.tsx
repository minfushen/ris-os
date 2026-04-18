import { useState } from "react";
import { Typography, Button, Space, Steps, App } from "antd";
import { useNavigate } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import StrategyDiff from "./StrategyDiff";
import SafeGuardConfig from "./SafeGuardConfig";

const { Text } = Typography;

export default function PublishPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [safeGuardConfig, setSafeGuardConfig] = useState<Record<string, unknown>>({});

  const handleSubmit = () => {
    void message.success("策略发布申请已提交，等待审批");
    navigate("/strategy/list");
  };

  return (
    <ModulePageShell
      title="策略变更发布申请"
      subtitle="提交策略变更申请，配置上线护盾"
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
      {/* 步骤指示器 */}
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

      {/* Step 1: Diff 对比 */}
      {currentStep === 0 && (
        <ModuleSectionCard>
          <StrategyDiff />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
              上一步
            </Button>
          </div>
        </ModuleSectionCard>
      )}

      {/* Step 2: 护盾配置 */}
      {currentStep === 1 && (
        <ModuleSectionCard>
          <SafeGuardConfig onChange={setSafeGuardConfig} />
          <div style={{ marginTop: 16, textAlign: "right" }}>
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

      {/* Step 3: 确认提交 */}
      {currentStep === 2 && (
        <ModuleSectionCard title="确认提交">
          <div style={{ background: "#fafafa", padding: 12, marginBottom: 12 }}>
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
          <div style={{ textAlign: "right" }}>
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
