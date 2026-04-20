import { Typography, Button, Space, Table, Tag, Row, Col, Card, Alert, InputNumber, Switch, Divider, Spin } from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  LineChartOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api, formatApiError } from "@/api/client";
import type { PostLoanFeatureStudioResponse, PostLoanPsiByProductRow, PostLoanFeatureRow } from "@/types/scenarioPostLoan";

const { Text } = Typography;

type FeatureTableRow = {
  key: string;
  name: string;
  category: string;
  type: string;
  source: string;
  psiBiz: number;
  psiTax: number;
  status: "normal" | "warning";
};

function mapFeatures(rows: PostLoanFeatureRow[]): FeatureTableRow[] {
  return rows.map((f) => ({
    key: f.id,
    name: f.name,
    category: f.category,
    type: f.value_type,
    source: f.source,
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

export default function FeatureStudio() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<PostLoanFeatureStudioResponse | null>(null);
  const [psiThreshold, setPsiThreshold] = useState(0.2);
  const [alarmOn, setAlarmOn] = useState(true);

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

  const columns = [
    {
      title: "特征名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong className="text-[13px]">{text}</Text>,
    },
    {
      title: "类别",
      dataIndex: "category",
      width: 100,
      render: (text: string) => (
        <Tag color={text === "还款行为" ? "blue" : "purple"} className="!m-0 text-[11px]">{text}</Tag>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (text: string) => <Tag className="text-[12px]">{text}</Tag>,
    },
    {
      title: "数据源",
      dataIndex: "source",
      key: "source",
      render: (text: string) => <Text className="text-[13px]">{text}</Text>,
    },
    {
      title: "PSI·经营贷",
      dataIndex: "psiBiz",
      key: "psiBiz",
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
      render: (status: string) => (
        <Tag color={status === "normal" ? "green" : "orange"} className="text-[12px]">
          {status === "normal" ? "正常" : "漂移关注"}
        </Tag>
      ),
    },
  ];

  const psiMatrixColumns = [
    { title: "特征", dataIndex: "feature", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    {
      title: "经营贷 PSI",
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
      subtitle="数据来自 GET /api/scenario/post-loan/feature-studio（与 /scenario/post-loan 并存）；PSI 按产品线分面，阈值可本地调整"
      breadcrumb={["特征与数据", "贷后特征工作室"]}
      actions={
        <Space>
          <Button icon={<SyncOutlined />} loading={loading} onClick={() => void load()}>
            同步特征库
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>新建特征</Button>
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
        message="口径变更说明"
        description="已下线：全场景泛化 PSI 监控、授信侧「多头查询次数」等反欺诈特征为主列表。已上线：还款规律性、提前还款率、承诺履约率、联系成功率等；PSI 告警按产品线独立基线与阈值。"
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

        <ModuleSectionCard title="按产品线 PSI 监控" subtitle="经营贷与税易贷分池计算 PSI（接口字段 biz_psi / tax_psi）">
          <Table
            dataSource={psiMatrix}
            columns={psiMatrixColumns}
            rowKey="feature"
            size="small"
            pagination={false}
            locale={{ emptyText: loading ? "加载中…" : "暂无数据" }}
          />
        </ModuleSectionCard>

        <ModuleSectionCard title="特征列表" subtitle="含分产品线 PSI 列" noPadding>
          <Table
            dataSource={features}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="key"
            locale={{ emptyText: loading ? "加载中…" : "暂无数据" }}
          />
        </ModuleSectionCard>
      </Spin>
    </ModulePageShell>
  );
}
