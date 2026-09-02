import { Typography, Button, Space, Table, Tag, Row, Col, Card, Alert, InputNumber, Switch, Divider, Spin, Tabs, Descriptions, Modal, Drawer, Form, Input, Select, message } from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  LineChartOutlined,
  WarningOutlined,
  DatabaseOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";
import { api, formatApiError } from "@/api/client";
import type { PostLoanFeatureStudioResponse, PostLoanPsiByProductRow, PostLoanFeatureRow, VariableDomain } from "@/types/scenarioPostLoan";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type FeatureTableRow = {
  key: string;
  name: string;
  domain: VariableDomain;
  category: string;
  type: string;
  source: string;
  dataLayer?: string;
  sourceTable?: string;
  calculationLogic?: string;
  refreshFreq?: string;
  ownerDept?: string;
  psiBiz: number;
  psiTax: number;
  status: "normal" | "warning";
};

function mapFeatures(rows: PostLoanFeatureRow[]): FeatureTableRow[] {
  return rows.map((f) => ({
    key: f.id,
    name: f.name,
    domain: f.domain,
    category: f.category,
    type: f.value_type,
    source: f.source,
    dataLayer: f.data_layer,
    sourceTable: f.source_table,
    calculationLogic: f.calculation_logic,
    refreshFreq: f.refresh_freq,
    ownerDept: f.owner_dept,
    psiBiz: f.psi_biz_loan,
    psiTax: f.psi_tax_easy_loan,
    status: f.drift_status,
  }));
}

function mapPsiMatrix(rows: PostLoanPsiByProductRow[]) {
  return rows.map((r) => ({
    feature: r.feature,
    bizPsi: r.biz_psi,
    taxPsi: r.tax_psi,
    note: r.note,
  }));
}

/** 数据分层颜色映射 */
const DATA_LAYER_COLORS: Record<string, string> = {
  ODS: "default",
  DWD: "blue",
  DWS: "purple",
  ADS: "green",
};

/** 变量域颜色映射 */
const DOMAIN_COLORS: Record<VariableDomain, string> = {
  客户: "blue",
  贷款: "geekblue",
  还款: "cyan",
  信用卡: "purple",
  资产负债: "magenta",
  交易: "orange",
  征信: "gold",
  三方: "red",
};

export default function FeatureStudio() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<PostLoanFeatureStudioResponse | null>(null);
  const [psiThreshold, setPsiThreshold] = useState(0.2);
  const [alarmOn, setAlarmOn] = useState(true);
  const [detailFeature, setDetailFeature] = useState<FeatureTableRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPostLoanFeatureStudio();
      setBundle(data);
      setPsiThreshold(data.psi_alarm_defaults.threshold);
      setAlarmOn(data.psi_alarm_defaults.enabled);
    } catch (e) {
      setError(formatApiError(e));
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const features = bundle ? mapFeatures(bundle.features) : [];
  const psiMatrix = bundle ? mapPsiMatrix(bundle.psi_by_product) : [];
  const overviewCards = bundle?.overview_cards ?? [];

  const watchCount = features.filter((f) => f.psiBiz > psiThreshold || f.psiTax > psiThreshold).length;

  const showDetail = (feature: FeatureTableRow) => {
    setDetailFeature(feature);
    setDetailOpen(true);
  };

  /** 新建特征提交 */
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success(`特征「${values.name}」已创建并提交审核`);
      setCreateOpen(false);
      createForm.resetFields();
      void load(); // 刷新列表
    } catch {
      message.error("请完善必填信息");
    } finally {
      setCreateLoading(false);
    }
  };

  /** 同步特征库 */
  const handleSync = async () => {
    setLoading(true);
    try {
      await load();
      message.success("特征库同步完成");
    } catch {
      message.error("同步失败");
    }
  };

  const columns = [
    {
      title: "特征名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: FeatureTableRow) => (
        <Button type="link" size="small" className="!p-0" onClick={() => showDetail(record)}>
          <Text strong className="text-[13px]">{text}</Text>
        </Button>
      ),
    },
    {
      title: "变量域",
      dataIndex: "domain",
      width: 90,
      render: (domain: VariableDomain) => (
        <Tag color={DOMAIN_COLORS[domain]} className="!m-0 text-[11px]">{domain}</Tag>
      ),
    },
    {
      title: "类别",
      dataIndex: "category",
      width: 100,
      render: (text: string) => (
        <Tag className="!m-0 text-[11px]">{text}</Tag>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 70,
      render: (text: string) => <Tag className="text-[12px]">{text}</Tag>,
    },
    {
      title: "数据源",
      dataIndex: "source",
      key: "source",
      width: 120,
      render: (text: string) => <Text className="text-[13px]">{text}</Text>,
    },
    {
      title: "PSI·惠快贷",
      dataIndex: "psiBiz",
      key: "psiBiz",
      width: 100,
      render: (value: number) => (
        <Text className={`text-[13px] ${value > psiThreshold ? "text-[#faad14]" : "text-[#52c41a]"}`}>
          {value.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "PSI·税易贷",
      dataIndex: "psiTax",
      key: "psiTax",
      width: 100,
      render: (value: number) => (
        <Text className={`text-[13px] ${value > psiThreshold ? "text-[#faad14]" : "text-[#52c41a]"}`}>
          {value.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status: string) => (
        <Tag color={status === "normal" ? "green" : "orange"} className="text-[12px]">
          {status === "normal" ? "正常" : "漂移关注"}
        </Tag>
      ),
    },
  ];

  const mappingColumns = [
    {
      title: "特征名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong className="text-[13px]">{text}</Text>,
    },
    {
      title: "变量域",
      dataIndex: "domain",
      width: 90,
      render: (domain: VariableDomain) => (
        <Tag color={DOMAIN_COLORS[domain]} className="!m-0 text-[11px]">{domain}</Tag>
      ),
    },
    {
      title: "数据分层",
      dataIndex: "dataLayer",
      width: 90,
      render: (layer: string) => (
        <Tag color={DATA_LAYER_COLORS[layer] || "default"} className="!m-0 text-[11px]">
          {layer || "-"}
        </Tag>
      ),
    },
    {
      title: "来源表",
      dataIndex: "sourceTable",
      width: 180,
      render: (text: string) => <Text code className="text-[12px]">{text || "-"}</Text>,
    },
    {
      title: "计算逻辑",
      dataIndex: "calculationLogic",
      ellipsis: true,
      render: (text: string) => (
        <Text type="secondary" className="text-[12px] font-mono">{text || "-"}</Text>
      ),
    },
    {
      title: "更新频率",
      dataIndex: "refreshFreq",
      width: 90,
      render: (text: string) => <Tag className="text-[11px]">{text || "-"}</Tag>,
    },
    {
      title: "责任部门",
      dataIndex: "ownerDept",
      width: 110,
      render: (text: string) => <Text className="text-[13px]">{text || "-"}</Text>,
    },
  ];

  const psiMatrixColumns = [
    { title: "特征", dataIndex: "feature", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    {
      title: "惠快贷 PSI",
      dataIndex: "bizPsi",
      render: (v: number) => <Text className={v > psiThreshold ? "text-[#faad14]" : ""}>{v.toFixed(2)}</Text>,
    },
    {
      title: "税易贷 PSI",
      dataIndex: "taxPsi",
      render: (v: number) => <Text className={v > psiThreshold ? "text-[#faad14]" : ""}>{v.toFixed(2)}</Text>,
    },
    { title: "说明", dataIndex: "note", ellipsis: true, render: (v: string) => <Text type="secondary" className="text-[12px]">{v}</Text> },
  ];

  return (
    <ModulePageShell
      title="贷后特征工作室"
      subtitle="8 大变量域特征体系 · 字段映射 · PSI 监控（对齐《项目实施计划书》数据体系章节）"
      breadcrumb={["数据与特征", "贷后特征工作室"]}
      actions={
        <Space>
          <Button icon={<SyncOutlined />} loading={loading} onClick={handleSync}>
            同步特征库
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            新建特征
          </Button>
        </Space>
      }
    >
      {error ? (
        <Alert type="error" showIcon className="rounded-xl layout-mb-md" message="加载失败" description={error} />
      ) : null}

      <Alert
        type="info"
        showIcon
        className="rounded-xl"
        message="数据体系说明"
        description="特征目录已对齐《项目实施计划书》8 大变量域（客户/贷款/还款/信用卡/资产负债/交易/征信/三方），共 972 维特征。PSI 告警按产品线独立基线与阈值。"
      />

      <Spin spinning={loading}>
        <ModuleSectionCard
          title="特征概览"
          subtitle="由服务端聚合统计（漂移需关注条数随默认阈值计算，刷新页面可同步）"
          extra={<Button size="small" icon={<LineChartOutlined />}>分布与血缘</Button>}
        >
          <Row gutter={[16, 16]}>
            {overviewCards.map((x) => (
              <Col xs={12} md={6} key={x.label}>
                <Card size="small" className={`rounded-lg ${x.warn ? "border-[#faad14]" : ""}`}>
                  <Text type="secondary" className="text-[12px] block">{x.label}</Text>
                  <Text strong className={`text-xl block ${x.warn ? "text-[#d46b08]" : ""}`}>{x.value}</Text>
                  <Text type="secondary" className="text-[11px]">{x.subtitle}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </ModuleSectionCard>

        <ModuleSectionCard title="PSI 阈值告警" subtitle="默认值来自接口 psi_alarm_defaults；下方可本地调节用于高亮与计数">
          <Space wrap align="center" className="w-full">
            <Text className="text-[13px]">启用 PSI 告警</Text>
            <Switch checked={alarmOn} onChange={setAlarmOn} />
            <Divider type="vertical" />
            <Text className="text-[13px]">PSI 红线（任一产品线超过即告警）</Text>
            <InputNumber min={0.05} max={0.5} step={0.01} value={psiThreshold} onChange={(v) => setPsiThreshold(Number(v) || 0.2)} size="small" />
            <Tag color="orange" className="!m-0">
              <WarningOutlined /> 当前 {alarmOn ? watchCount : 0} 条特征需关注
            </Tag>
          </Space>
        </ModuleSectionCard>

        <ModuleSectionCard title="按产品线 PSI 监控" subtitle="惠快贷与税易贷分池计算 PSI（接口字段 biz_psi / tax_psi）">
          <Table
            dataSource={psiMatrix}
            columns={psiMatrixColumns}
            rowKey="feature"
            size="small"
            pagination={false}
            locale={{ emptyText: loading ? "加载中…" : "暂无数据" }}
          />
        </ModuleSectionCard>

        <ModuleSectionCard title="特征目录" subtitle="按 8 大变量域分组，点击特征名查看详情" noPadding>
          <Tabs
            defaultActiveKey="list"
            items={[
              {
                key: "list",
                label: (
                  <span>
                    <DatabaseOutlined />
                    特征列表（{features.length}）
                  </span>
                ),
                children: (
                  <Table
                    dataSource={features}
                    columns={columns}
                    pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                    size="small"
                    rowKey="key"
                    locale={{ emptyText: loading ? "加载中…" : "暂无数据" }}
                  />
                ),
              },
              {
                key: "mapping",
                label: (
                  <span>
                    <TableOutlined />
                    字段映射
                  </span>
                ),
                children: (
                  <Table
                    dataSource={features}
                    columns={mappingColumns}
                    pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                    size="small"
                    rowKey="key"
                    locale={{ emptyText: loading ? "加载中…" : "暂无数据" }}
                  />
                ),
              },
            ]}
          />
        </ModuleSectionCard>
      </Spin>

      {/* 特征详情 Modal */}
      <Modal
        title={detailFeature?.name}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
      >
        {detailFeature && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="变量域">
              <Tag color={DOMAIN_COLORS[detailFeature.domain]}>{detailFeature.domain}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="业务类别">{detailFeature.category}</Descriptions.Item>
            <Descriptions.Item label="数据类型">{detailFeature.type}</Descriptions.Item>
            <Descriptions.Item label="数据源">{detailFeature.source}</Descriptions.Item>
            <Descriptions.Item label="来源表">
              <Text code>{detailFeature.sourceTable || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="更新频率">{detailFeature.refreshFreq || "-"}</Descriptions.Item>
            <Descriptions.Item label="责任部门">{detailFeature.ownerDept || "-"}</Descriptions.Item>
            <Descriptions.Item label="PSI（惠快贷）">{detailFeature.psiBiz.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="PSI（税易贷）">{detailFeature.psiTax.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="漂移状态">
              <Tag color={detailFeature.status === "normal" ? "green" : "orange"}>
                {detailFeature.status === "normal" ? "正常" : "漂移关注"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="计算逻辑" span={2}>
              <Text code className="text-[12px]">{detailFeature.calculationLogic || "-"}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 新建特征抽屉 */}
      <Drawer
        title="新建特征"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={560}
        footer={
          <Space>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" loading={createLoading} onClick={handleCreateSubmit}>
              提交审核
            </Button>
          </Space>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label="特征名称"
            rules={[{ required: true, message: "请输入特征名称" }]}
          >
            <Input placeholder="如：近3月对公账户交易对手集中度" />
          </Form.Item>
          <Form.Item
            name="domain"
            label="变量域"
            rules={[{ required: true, message: "请选择变量域" }]}
          >
            <Select placeholder="选择所属变量域">
              <Option value="客户">客户</Option>
              <Option value="贷款">贷款</Option>
              <Option value="还款">还款</Option>
              <Option value="信用卡">信用卡</Option>
              <Option value="资产负债">资产负债</Option>
              <Option value="交易">交易</Option>
              <Option value="征信">征信</Option>
              <Option value="三方">三方</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="业务类别"
            rules={[{ required: true, message: "请输入业务类别" }]}
          >
            <Input placeholder="如：交易行为 / 资金流 / 多头借贷" />
          </Form.Item>
          <Form.Item name="valueType" label="数据类型" initialValue="float">
            <Select>
              <Option value="int">int（整数）</Option>
              <Option value="float">float（小数）</Option>
              <Option value="string">string（字符串）</Option>
              <Option value="bool">bool（布尔）</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="source"
            label="数据源"
            rules={[{ required: true, message: "请输入数据源" }]}
          >
            <Input placeholder="如：对公交易流水 / 人行征信" />
          </Form.Item>
          <Form.Item name="dataLayer" label="数据分层" initialValue="DWD">
            <Select>
              <Option value="ODS">ODS（原始数据层）</Option>
              <Option value="DWD">DWD（明细数据层）</Option>
              <Option value="DWS">DWS（汇总数据层）</Option>
              <Option value="ADS">ADS（应用数据层）</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sourceTable" label="来源表名">
            <Input placeholder="如：dwd_corp_transaction" />
          </Form.Item>
          <Form.Item
            name="calculationLogic"
            label="计算逻辑"
            rules={[{ required: true, message: "请输入计算逻辑" }]}
          >
            <TextArea
              rows={3}
              placeholder="SQL 伪代码或规则描述，如：TOP1_counterparty_amount / total_amount"
            />
          </Form.Item>
          <Form.Item name="refreshFreq" label="更新频率" initialValue="实时">
            <Select>
              <Option value="实时">实时</Option>
              <Option value="T+1">T+1</Option>
              <Option value="月更">月更</Option>
            </Select>
          </Form.Item>
          <Form.Item name="ownerDept" label="责任部门" initialValue="风险管理部">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
