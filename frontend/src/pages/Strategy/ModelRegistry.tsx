import { Button, Space, Table, Tag, Timeline, Typography } from "antd";
import { RollbackOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const MODEL_VERSIONS = [
  {
    id: "MDL-BIZ-002",
    name: "经营异常预警模型",
    version: "v2.3.1",
    role: "Champion",
    stage: "灰度中",
    auc: 0.842,
    psi: 0.08,
    owner: "模型团队",
    updatedAt: "2026-04-18",
  },
  {
    id: "MDL-BIZ-001",
    name: "经营异常预警模型",
    version: "v2.2.0",
    role: "Challenger",
    stage: "候选",
    auc: 0.831,
    psi: 0.06,
    owner: "模型团队",
    updatedAt: "2026-04-12",
  },
  {
    id: "MDL-TAX-003",
    name: "税报断档风险模型",
    version: "v1.7.4",
    role: "Champion",
    stage: "生效中",
    auc: 0.811,
    psi: 0.09,
    owner: "贷后策略",
    updatedAt: "2026-04-10",
  },
];

export default function ModelRegistry() {
  return (
    <ModulePageShell
      title="模型版本库"
      subtitle="管理模型注册、版本、Champion/Challenger、灰度状态与回滚，连接模型工厂和决策流编排"
      breadcrumb={["策略与模型", "模型版本库"]}
      actions={
        <Space wrap>
          <Button size="small">注册模型</Button>
          <Button type="primary" size="small" icon={<SafetyCertificateOutlined />}>
            发起准入评审
          </Button>
        </Space>
      }
    >
      <ModuleSectionCard title="模型版本清单" subtitle="用于说明模型治理不是“训练完即上线”" noPadding>
        <Table
          rowKey={(row) => `${row.id}-${row.version}`}
          size="small"
          pagination={false}
          dataSource={MODEL_VERSIONS}
          columns={[
            { title: "模型编号", dataIndex: "id", width: 120, render: (v: string) => <Text code>{v}</Text> },
            { title: "模型名称", dataIndex: "name", width: 180 },
            { title: "版本", dataIndex: "version", width: 90 },
            {
              title: "角色",
              dataIndex: "role",
              width: 110,
              render: (v: string) => <Tag color={v === "Champion" ? "green" : "blue"}>{v}</Tag>,
            },
            {
              title: "上线状态",
              dataIndex: "stage",
              width: 100,
              render: (v: string) => <Tag color={v === "生效中" ? "green" : v === "灰度中" ? "gold" : "default"}>{v}</Tag>,
            },
            { title: "AUC", dataIndex: "auc", width: 80 },
            { title: "PSI", dataIndex: "psi", width: 80 },
            { title: "负责人", dataIndex: "owner", width: 100 },
            { title: "更新时间", dataIndex: "updatedAt", width: 110 },
            {
              title: "操作",
              key: "action",
              width: 110,
              render: () => (
                <Button type="link" size="small" icon={<RollbackOutlined />}>
                  回滚预案
                </Button>
              ),
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="版本准入门禁" subtitle="面试版展示生产级治理边界">
        <Timeline
          items={[
            { color: "green", children: "离线评估通过：AUC / KS / Recall 达到准入线" },
            { color: "green", children: "稳定性校验通过：PSI < 0.1，关键特征缺失率可控" },
            { color: "blue", children: "Champion/Challenger 灰度对比：10% 流量观察 7 天" },
            { color: "gray", children: "发布审批通过后进入决策流节点，支持一键回滚到上一版本" },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
