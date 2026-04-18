import { Typography, Tree, Button, Space, Form, Input, Select, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const RULE_TREE = [
  {
    title: "授信准入规则",
    key: "credit-access",
    children: [
      { title: "年龄准入 (18-60)", key: "rule-age" },
      { title: "黑名单校验", key: "rule-blacklist" },
      { title: "多头借贷限制", key: "rule-multi-lend" },
    ],
  },
  {
    title: "反欺诈规则",
    key: "anti-fraud",
    children: [
      { title: "设备指纹校验", key: "rule-device" },
      { title: "IP风险校验", key: "rule-ip" },
      { title: "关联人风险", key: "rule-relation" },
    ],
  },
  {
    title: "评分卡规则",
    key: "scorecard",
    children: [
      { title: "A卡评分 (≥620)", key: "rule-a-card" },
      { title: "B卡评分 (≥580)", key: "rule-b-card" },
    ],
  },
];

export default function Rules() {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  return (
    <ModulePageShell
      title="规则引擎"
      subtitle="规则配置与管理"
      breadcrumb={["策略管控", "规则引擎"]}
    >
      <ModuleSectionCard>
        <div className="layout-flex layout-gap-lg">
          {/* 左侧：规则树 */}
          <div
            className="layout-p-md border border-border-soft bg-[#fafafa] shrink-0"
            style={{ width: 300 }}
          >
            <div className="layout-flex-between layout-mb-sm">
              <Text strong className="text-[13px]">
                规则目录
              </Text>
              <Button type="link" size="small" icon={<PlusOutlined />} className="text-[13px]">
                新建
              </Button>
            </div>
            <Tree
              treeData={RULE_TREE}
              onSelect={(keys) => setSelectedRule(keys[0] as string)}
              defaultExpandAll
            />
          </div>

          {/* 右侧：规则详情 */}
          <div className="layout-flex-1 layout-p-md border border-border-soft">
            <Text strong className="text-[13px] block layout-mb-md">
              规则详情
            </Text>
            {selectedRule ? (
              <div>
                <Form layout="vertical" size="small">
                  <Form.Item label="规则名称">
                    <Input defaultValue="年龄准入规则" />
                  </Form.Item>
                  <Form.Item label="规则类型">
                    <Select
                      defaultValue="range"
                      options={[
                        { value: "range", label: "区间校验" },
                        { value: "list", label: "列表校验" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="参数配置">
                    <Space>
                      最小值: <Input defaultValue="18" style={{ width: 60 }} />
                      最大值: <Input defaultValue="60" style={{ width: 60 }} />
                    </Space>
                  </Form.Item>
                  <Form.Item label="是否启用">
                    <Switch defaultChecked />
                  </Form.Item>
                </Form>
                <Space>
                  <Button type="primary" size="small">
                    保存
                  </Button>
                  <Button size="small">取消</Button>
                </Space>
              </div>
            ) : (
              <div className="layout-p-empty text-center">
                <Text type="secondary" className="text-[13px]">
                  请从左侧选择规则
                </Text>
              </div>
            )}
          </div>
        </div>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
