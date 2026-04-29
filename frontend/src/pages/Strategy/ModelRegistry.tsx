import { useState } from "react";
import { Button, Space, Table, Tag, Timeline, Typography, Select, Row, Col, Card, Statistic, Collapse } from "antd";
import { RollbackOutlined, SafetyCertificateOutlined, SwapOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";
import { mockModelVersions, type MockModelVersion } from "@/mock/data";

const { Text } = Typography;

function deltaTag(current: number, previous: number, suffix = "") {
  const delta = current - previous;
  const positive = delta >= 0;
  return (
    <Space size={4}>
      {positive ? <RiseOutlined className="text-red-500 text-xs" /> : <FallOutlined className="text-green-500 text-xs" />}
      <Text className={`text-[13px] ${positive ? "text-red-600" : "text-green-600"}`}>
        {positive ? "+" : ""}{delta.toFixed(3)}{suffix}
      </Text>
    </Space>
  );
}

export default function ModelRegistry() {
  const [compareModel, setCompareModel] = useState<string>("MDL-BIZ-002");

  const modelNames = [...new Set(mockModelVersions.map((m) => m.name))];
  const compareVersions = mockModelVersions.filter((m) => m.name === mockModelVersions.find((x) => x.id === compareModel)?.name);
  const champion = compareVersions.find((v) => v.role === "Champion" && v.stage === "生效中");
  const challenger = compareVersions.find((v) => v.role === "Challenger" || v.stage === "灰度中" || v.stage === "候选");

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
      <ModuleSectionCard title="模型版本清单" subtitle={`共 ${mockModelVersions.length} 个版本 · ${modelNames.length} 个模型`} noPadding>
        <Table
          rowKey={(row) => `${row.id}-${row.version}`}
          size="small"
          pagination={false}
          dataSource={mockModelVersions}
          columns={[
            { title: "模型编号", dataIndex: "id", width: 120, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
            { title: "模型名称", dataIndex: "name", width: 170, ellipsis: true },
            { title: "版本", dataIndex: "version", width: 85 },
            { title: "角色", dataIndex: "role", width: 100, render: (v: string) => <Tag color={v === "Champion" ? "green" : "blue"}>{v}</Tag> },
            { title: "上线状态", dataIndex: "stage", width: 95, render: (v: string) => <Tag color={v === "生效中" ? "green" : v === "灰度中" ? "gold" : v === "已回滚" ? "red" : "default"}>{v}</Tag> },
            { title: "AUC", dataIndex: "auc", width: 70 },
            { title: "KS", dataIndex: "ks", width: 70 },
            { title: "PSI", dataIndex: "psi", width: 70 },
            { title: "负责人", dataIndex: "owner", width: 90 },
            { title: "更新时间", dataIndex: "updatedAt", width: 100, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
            {
              title: "操作", key: "action", width: 100,
              render: (_: unknown, record: MockModelVersion) => (
                <Button type="link" size="small" icon={<RollbackOutlined />}>
                  {record.stage === "已回滚" ? "查看回滚" : "回滚预案"}
                </Button>
              ),
            },
          ]}
        />
      </ModuleSectionCard>

      {/* Champion vs Challenger 对比 */}
      <ModuleSectionCard title="Champion / Challenger 对比" subtitle="选择模型查看现行版本与候选版本的指标差异">
        <Space className="mb-3">
          <Text className="text-[13px]">选择模型：</Text>
          <Select
            value={compareModel}
            onChange={setCompareModel}
            style={{ width: 260 }}
            options={modelNames.map((n) => {
              const latest = mockModelVersions.find((m) => m.name === n);
              return { label: `${n} (${latest?.id ?? "-"})`, value: latest?.id ?? "" };
            })}
          />
        </Space>

        {champion && challenger ? (
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" title={<Space><Tag color="green">Champion</Tag><Text strong>{champion.version}</Text><Tag>{champion.stage}</Tag></Space>}>
                <Row gutter={[8, 8]}>
                  {[
                    { label: "AUC", champ: champion.auc, chall: challenger.auc },
                    { label: "KS", champ: champion.ks, chall: challenger.ks },
                    { label: "PSI", champ: champion.psi, chall: challenger.psi },
                    { label: "召回率", champ: parseFloat(champion.recall), chall: parseFloat(challenger.recall), suffix: "%" },
                    { label: "精确率", champ: parseFloat(champion.precision), chall: parseFloat(challenger.precision), suffix: "%" },
                  ].map((m) => (
                    <Col span={12} key={m.label}>
                      <Statistic
                        title={m.label}
                        value={m.champ}
                        suffix={m.suffix ?? ""}
                        valueStyle={{ fontSize: 18 }}
                      />
                      <Text type="secondary" className="text-[11px]">
                        vs Challenger: {deltaTag(m.champ, m.chall, m.suffix ?? "")}
                      </Text>
                    </Col>
                  ))}
                </Row>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Text type="secondary" className="text-[12px]">Champion changelog：{champion.changelog}</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title={<Space><Tag color="blue">Challenger</Tag><Text strong>{challenger.version}</Text><Tag>{challenger.stage}</Tag></Space>}>
                <Row gutter={[8, 8]}>
                  {[
                    { label: "AUC", champ: challenger.auc, chall: champion.auc },
                    { label: "KS", champ: challenger.ks, chall: champion.ks },
                    { label: "PSI", champ: challenger.psi, chall: champion.psi },
                    { label: "召回率", champ: parseFloat(challenger.recall), chall: parseFloat(champion.recall), suffix: "%" },
                    { label: "精确率", champ: parseFloat(challenger.precision), chall: parseFloat(champion.precision), suffix: "%" },
                  ].map((m) => (
                    <Col span={12} key={m.label}>
                      <Statistic
                        title={m.label}
                        value={m.champ}
                        suffix={m.suffix ?? ""}
                        valueStyle={{ fontSize: 18 }}
                      />
                      <Text type="secondary" className="text-[11px]">
                        vs Champion: {deltaTag(m.champ, m.chall, m.suffix ?? "")}
                      </Text>
                    </Col>
                  ))}
                </Row>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Text type="secondary" className="text-[12px]">Challenger changelog：{challenger.changelog}</Text>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <Text type="secondary">该模型暂无 Champion/Challenger 对照版本</Text>
        )}
      </ModuleSectionCard>

      {/* 版本历史时间线 */}
      <ModuleSectionCard title="版本准入门禁与发布历史" subtitle="展示该模型从注册 → 评估 → 灰度 → 全量 / 回滚的完整生命周期">
        <Collapse
          items={modelNames.map((name) => {
            const versions = mockModelVersions.filter((m) => m.name === name).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            return {
              key: name,
              label: <Space><SwapOutlined /><Text strong className="text-[13px]">{name}</Text><Tag>{versions.length} 个版本</Tag></Space>,
              children: (
                <Timeline
                  items={versions.map((v) => ({
                    color: v.stage === "生效中" ? "green" : v.stage === "已回滚" ? "red" : v.stage === "灰度中" ? "blue" : "gray",
                    children: (
                      <div>
                        <div className="flex items-center gap-2">
                          <Tag color={v.role === "Champion" ? "green" : "blue"} className="!m-0">{v.role}</Tag>
                          <Text strong className="text-[13px]">{v.version}</Text>
                          <Tag color={v.stage === "生效中" ? "green" : v.stage === "灰度中" ? "gold" : v.stage === "已回滚" ? "red" : "default"} className="!m-0">{v.stage}</Tag>
                          <Text type="secondary" className="text-[11px]">{v.updatedAt}</Text>
                        </div>
                        <Text type="secondary" className="text-[12px] block mt-1">{v.changelog}</Text>
                        <Space size={4} className="mt-1">
                          <Text className="text-[11px] text-gray-400">AUC {v.auc}</Text>
                          <Text className="text-[11px] text-gray-400">KS {v.ks}</Text>
                          <Text className="text-[11px] text-gray-400">PSI {v.psi}</Text>
                        </Space>
                      </div>
                    ),
                  }))}
                />
              ),
            };
          })}
        />
      </ModuleSectionCard>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
