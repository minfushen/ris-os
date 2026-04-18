import { useState } from "react";
import { Card, Typography, Switch, Slider, InputNumber, Space, Alert, Divider, Tag, Select } from "antd";
import {
  SafetyOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface SafeGuardConfigProps {
  initialValues?: {
    enableCircuitBreaker?: boolean;
    passRateThreshold?: number;
    o2oDeviationThreshold?: number;
    canaryPercentage?: number;
    rollbackStrategy?: "auto" | "manual";
  };
  onChange?: (values: any) => void;
}

export default function SafeGuardConfig({
  initialValues = {
    enableCircuitBreaker: true,
    passRateThreshold: 15,
    o2oDeviationThreshold: 5,
    canaryPercentage: 10,
    rollbackStrategy: "auto",
  },
  onChange,
}: SafeGuardConfigProps) {
  const [config, setConfig] = useState(initialValues);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  return (
    <div>
      <Text strong className="text-[13px] block layout-mb-md">
        2. 上线护盾配置 (Safe-guard)
      </Text>

      <Card
        size="small"
        className="rounded-none border border-[#d9d9d9]"
        styles={{ body: { padding: "var(--spacing-lg)" } }}
      >
        <div className="layout-mb-xl">
          <div className="layout-flex-between layout-mb-sm">
            <Space>
              <SafetyOutlined style={{ color: "#6f8f95" }} />
              <Text strong className="text-[12px]">
                开启自动熔断
              </Text>
            </Space>
            <Switch
              checked={config.enableCircuitBreaker}
              onChange={(checked) => updateConfig("enableCircuitBreaker", checked)}
            />
          </div>

          {config.enableCircuitBreaker && (
            <div className="layout-ml-xl layout-mt-md">
              <div className="layout-mb-lg">
                <Text type="secondary" className="text-[13px] block layout-mb-xs">
                  通过率波动阈值 (%)
                </Text>
                <div className="layout-flex-center layout-gap-md">
                  <Slider
                    style={{ flex: 1 }}
                    min={1}
                    max={30}
                    value={config.passRateThreshold}
                    onChange={(v) => updateConfig("passRateThreshold", v)}
                  />
                  <InputNumber
                    min={1}
                    max={30}
                    value={config.passRateThreshold}
                    onChange={(v) => updateConfig("passRateThreshold", v)}
                    style={{ width: 60 }}
                    size="small"
                  />
                  <Text type="secondary" className="text-[13px]">
                    %
                  </Text>
                </div>
              </div>

              <div className="layout-mb-lg">
                <Text type="secondary" className="text-[13px] block layout-mb-xs">
                  O2O 偏差阈值 (%)
                </Text>
                <div className="layout-flex-center layout-gap-md">
                  <Slider
                    style={{ flex: 1 }}
                    min={1}
                    max={20}
                    value={config.o2oDeviationThreshold}
                    onChange={(v) => updateConfig("o2oDeviationThreshold", v)}
                  />
                  <InputNumber
                    min={1}
                    max={20}
                    value={config.o2oDeviationThreshold}
                    onChange={(v) => updateConfig("o2oDeviationThreshold", v)}
                    style={{ width: 60 }}
                    size="small"
                  />
                  <Text type="secondary" className="text-[13px]">
                    %
                  </Text>
                </div>
              </div>

              <Alert
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                className="layout-mt-sm rounded-none"
                message={
                  <Text className="text-[13px]">
                    当 通过率波动 &gt; {config.passRateThreshold}% 或 O2O偏差 &gt; {config.o2oDeviationThreshold}% 时自动回滚
                  </Text>
                }
              />
            </div>
          )}
        </div>

        <Divider rootClassName="layout-divider-y-lg" />

        <div>
          <div className="layout-flex-between layout-mb-sm">
            <Space>
              <ExperimentOutlined style={{ color: "#6f8f95" }} />
              <Text strong className="text-[12px]">
                灰度流量分配
              </Text>
            </Space>
            <Tag color="blue">{config.canaryPercentage}%</Tag>
          </div>

          <div className="layout-ml-xl layout-mt-md">
            <div className="layout-flex-center layout-gap-md">
              <Slider
                style={{ flex: 1 }}
                min={1}
                max={50}
                value={config.canaryPercentage}
                onChange={(v) => updateConfig("canaryPercentage", v)}
                marks={{
                  1: "1%",
                  10: "10%",
                  25: "25%",
                  50: "50%",
                }}
              />
            </div>

            <div className="layout-mt-md layout-flex layout-gap-sm">
              <Tag style={{ cursor: "pointer" }} onClick={() => updateConfig("canaryPercentage", 5)}>
                5%
              </Tag>
              <Tag style={{ cursor: "pointer" }} onClick={() => updateConfig("canaryPercentage", 10)}>
                10%
              </Tag>
              <Tag style={{ cursor: "pointer" }} onClick={() => updateConfig("canaryPercentage", 20)}>
                20%
              </Tag>
              <Tag style={{ cursor: "pointer" }} onClick={() => updateConfig("canaryPercentage", 50)}>
                50%
              </Tag>
            </div>

            <Alert
              type="info"
              showIcon
              className="layout-mt-md rounded-none"
              message={
                <Text className="text-[13px]">
                  新版本将分配 {config.canaryPercentage ?? 10}% 流量，剩余 {100 - (config.canaryPercentage ?? 10)}% 流量走线上版本
                </Text>
              }
            />
          </div>
        </div>

        <Divider rootClassName="layout-divider-y-lg" />

        <div>
          <div className="layout-flex-between">
            <Space>
              <ThunderboltOutlined style={{ color: "#6f8f95" }} />
              <Text strong className="text-[12px]">
                回滚策略
              </Text>
            </Space>
            <Select
              value={config.rollbackStrategy}
              onChange={(v) => updateConfig("rollbackStrategy", v)}
              style={{ width: 120 }}
              size="small"
              options={[
                { label: "自动回滚", value: "auto" },
                { label: "人工确认", value: "manual" },
              ]}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
