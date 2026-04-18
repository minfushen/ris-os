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
      {/* 标题 */}
      <Text strong style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
        2. 上线护盾配置 (Safe-guard)
      </Text>

      <Card
        size="small"
        style={{ border: "1px solid #d9d9d9", borderRadius: 0 }}
        styles={{ body: { padding: 16 } }}
      >
        {/* 自动熔断 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Space>
              <SafetyOutlined style={{ color: "#6f8f95" }} />
              <Text strong style={{ fontSize: 12 }}>
                开启自动熔断
              </Text>
            </Space>
            <Switch
              checked={config.enableCircuitBreaker}
              onChange={(checked) => updateConfig("enableCircuitBreaker", checked)}
            />
          </div>

          {config.enableCircuitBreaker && (
            <div style={{ marginLeft: 24, marginTop: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  通过率波动阈值 (%)
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    %
                  </Text>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  O2O 偏差阈值 (%)
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    %
                  </Text>
                </div>
              </div>

              <Alert
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                message={
                  <Text style={{ fontSize: 11 }}>
                    当 通过率波动 &gt; {config.passRateThreshold}% 或 O2O偏差 &gt; {config.o2oDeviationThreshold}% 时自动回滚
                  </Text>
                }
                style={{ marginTop: 8, borderRadius: 0 }}
              />
            </div>
          )}
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* 灰度流量配置 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Space>
              <ExperimentOutlined style={{ color: "#6f8f95" }} />
              <Text strong style={{ fontSize: 12 }}>
                灰度流量分配
              </Text>
            </Space>
            <Tag color="blue">{config.canaryPercentage}%</Tag>
          </div>

          <div style={{ marginLeft: 24, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
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
              message={
                <Text style={{ fontSize: 11 }}>
                  新版本将分配 {config.canaryPercentage ?? 10}% 流量，剩余 {100 - (config.canaryPercentage ?? 10)}% 流量走线上版本
                </Text>
              }
              style={{ marginTop: 12, borderRadius: 0 }}
            />
          </div>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* 回滚策略 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
              <ThunderboltOutlined style={{ color: "#6f8f95" }} />
              <Text strong style={{ fontSize: 12 }}>
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
