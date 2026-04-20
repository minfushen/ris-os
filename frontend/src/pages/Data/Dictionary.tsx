import { Typography, Table, Tag, Button, Space, Input, Select, Tabs, Alert, Spin } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api, formatApiError } from "@/api/client";
import type { DataDictionarySourceRow, DataDictionaryVariableRow } from "@/types/scenarioPostLoan";

const { Text } = Typography;

type RefreshDisplay = string;

type VariableRow = {
  id: string;
  name: string;
  cnName: string;
  type: string;
  source: string;
  refresh: RefreshDisplay;
  status: string;
};

type SourceRow = {
  id: string;
  name: string;
  type: string;
  refresh: RefreshDisplay;
  status: string;
  lastSync: string;
};

function mapVariables(rows: DataDictionaryVariableRow[]): VariableRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    cnName: r.cn_name,
    type: r.var_type,
    source: r.source,
    refresh: r.refresh,
    status: r.status,
  }));
}

function mapSources(rows: DataDictionarySourceRow[]): SourceRow[] {
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.category,
    refresh: s.refresh,
    status: s.connection_status,
    lastSync: s.last_sync_at,
  }));
}

function refreshTagColor(freq: string): string {
  if (freq === "实时") return "red";
  if (freq === "T+1") return "blue";
  if (freq === "月更") return "default";
  return "orange";
}

const SOURCE_OPTIONS = [
  { value: "core", label: "核心账务" },
  { value: "collection", label: "催收系统" },
  { value: "enterprise_credit", label: "国家企信" },
  { value: "court", label: "裁判/执行" },
  { value: "golden_tax_3", label: "金税三期" },
];

export default function Dictionary() {
  const [tab, setTab] = useState("variables");
  const [loadingVars, setLoadingVars] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variables, setVariables] = useState<VariableRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);

  const [qInput, setQInput] = useState("");
  const [sourceCode, setSourceCode] = useState<string | undefined>();
  const [refresh, setRefresh] = useState<string | undefined>();

  const filtersRef = useRef({ qInput, sourceCode, refresh });
  filtersRef.current = { qInput, sourceCode, refresh };

  const fetchVariables = useCallback(async () => {
    const { qInput: q, sourceCode: sc, refresh: rf } = filtersRef.current;
    setLoadingVars(true);
    setError(null);
    try {
      const raw = await api.listPostLoanDataDictionaryVariables({
        q: q.trim() || undefined,
        source_code: sc,
        refresh: rf,
      });
      setVariables(mapVariables(raw));
    } catch (e) {
      setError(formatApiError(e));
      setVariables([]);
    } finally {
      setLoadingVars(false);
    }
  }, []);

  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    setError(null);
    try {
      const raw = await api.listPostLoanDataDictionarySources();
      setSources(mapSources(raw));
    } catch (e) {
      setError(formatApiError(e));
      setSources([]);
    } finally {
      setLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    void fetchVariables();
  }, [fetchVariables]);

  useEffect(() => {
    if (tab === "sources") {
      void fetchSources();
    }
  }, [tab, fetchSources]);

  const variableColumns = [
    { title: "变量ID", dataIndex: "id", width: 80, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "变量名", dataIndex: "name", width: 160, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
    { title: "中文名", dataIndex: "cnName", width: 160, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    {
      title: "类型",
      dataIndex: "type",
      width: 72,
      render: (v: string) => (
        <Tag color={v === "raw" ? "blue" : v === "derived" ? "orange" : "purple"} className="!m-0 text-[11px]">
          {v === "raw" ? "原始" : v === "derived" ? "衍生" : "模型"}
        </Tag>
      ),
    },
    { title: "数据来源", dataIndex: "source", width: 140, ellipsis: true, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    {
      title: "刷新频率",
      dataIndex: "refresh",
      width: 88,
      render: (v: string) => <Tag color={refreshTagColor(v)} className="!m-0 text-[11px]">{v}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 72,
      render: (v: string) => (
        <Tag color={v === "active" ? "green" : "default"} className="!m-0 text-[11px]">
          {v === "active" ? "生效" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 72,
      render: () => <Button type="link" size="small" icon={<EditOutlined />} className="text-[13px]">编辑</Button>,
    },
  ];

  const sourceColumns = [
    { title: "数据源ID", dataIndex: "id", width: 88, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "名称", dataIndex: "name", width: 220, ellipsis: true, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    { title: "类型", dataIndex: "type", width: 88, render: (v: string) => <Tag className="!m-0">{v}</Tag> },
    {
      title: "刷新频率",
      dataIndex: "refresh",
      width: 96,
      render: (v: string) => <Tag color={refreshTagColor(v)} className="!m-0 text-[11px]">{v}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 88,
      render: (v: string) => (
        <Tag color={v === "connected" ? "green" : "red"} className="!m-0 text-[11px]">
          {v === "connected" ? "已连接" : "异常"}
        </Tag>
      ),
    },
    { title: "最后同步", dataIndex: "lastSync", width: 140, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => (
        <Space size={0}>
          <Button type="link" size="small" className="text-[13px]">配置</Button>
          <Button type="link" size="small" className="text-[13px]">测试</Button>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: "variables",
      label: <Text className="text-[12px]">变量字典</Text>,
      children: (
        <div className="layout-pb-md">
          <Alert
            type="info"
            showIcon
            className="rounded-md layout-mb-md"
            message="变量与血缘管理保留"
            description="GET /api/scenario/post-loan/data-dictionary/variables 支持 q、source_code、refresh；授信期百融/同盾等已从示例后端数据中移除。"
          />
          <Space className="layout-mb-lg flex-wrap">
            <Input placeholder="变量名/中文名" style={{ width: 160 }} size="small" value={qInput} onChange={(e) => setQInput(e.target.value)} />
            <Select
              placeholder="数据来源"
              style={{ width: 160 }}
              size="small"
              allowClear
              value={sourceCode}
              onChange={(v) => setSourceCode(v ?? undefined)}
              options={SOURCE_OPTIONS}
            />
            <Select
              placeholder="刷新频率"
              style={{ width: 110 }}
              size="small"
              allowClear
              value={refresh}
              onChange={(v) => setRefresh(v ?? undefined)}
              options={[
                { value: "实时", label: "实时" },
                { value: "T+1", label: "T+1" },
                { value: "月更", label: "月更" },
              ]}
            />
            <Button type="primary" icon={<SearchOutlined />} size="small" loading={loadingVars} onClick={() => void fetchVariables()}>
              搜索
            </Button>
            <Button icon={<PlusOutlined />} size="small">新建变量</Button>
          </Space>
          <Spin spinning={loadingVars}>
            <Table
              dataSource={variables}
              columns={variableColumns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 960 }}
              locale={{ emptyText: "无匹配变量" }}
            />
          </Spin>
        </div>
      ),
    },
    {
      key: "sources",
      label: <Text className="text-[12px]">数据源管理</Text>,
      children: (
        <div className="layout-pb-md">
          <Alert
            type="warning"
            showIcon
            className="rounded-md layout-mb-md"
            message="数据源说明"
            description="GET /api/scenario/post-loan/data-dictionary/sources 返回企信、司法、金税与内部系统；含 connection_status 与 last_sync_at。"
          />
          <Spin spinning={loadingSources}>
            <Table
              dataSource={sources}
              columns={sourceColumns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 900 }}
              locale={{ emptyText: "暂无数据源" }}
            />
          </Spin>
        </div>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="数据源管理"
      subtitle="变量与数据源由贷后场景 REST 提供：/api/scenario/post-loan/data-dictionary/*"
      breadcrumb={["特征与数据", "数据源管理"]}
    >
      {error ? (
        <Alert type="error" showIcon className="layout-mb-md" message="接口错误" description={error} />
      ) : null}
      <ModuleSectionCard noPadding>
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k)}
          items={items}
          className="layout-px-lg layout-pb-sm"
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
