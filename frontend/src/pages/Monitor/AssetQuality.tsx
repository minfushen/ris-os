import { Row, Col, Typography, Table, Tag, Space, Button } from "antd";
import { DownloadOutlined, HeatMapOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const KPI = {
  balanceYi: 128.6,
  nplRate: 2.34,
  m1Plus: 3.42,
  watchList: 1.12,
};

/** Vintage / M1+ 趋势（演示） */
const VINTAGE_M1 = [
  { cohort: "2024-01", m1: 1.2, m3: 2.8 },
  { cohort: "2024-02", m1: 1.1, m3: 2.5 },
  { cohort: "2024-03", m1: 1.3, m3: 2.6 },
  { cohort: "2024-04", m1: 1.0, m3: 2.4 },
  { cohort: "2024-05", m1: 0.95, m3: null },
];

/** 风险分层占比 % */
const RISK_BUCKETS = [
  { name: "正常", value: 72, color: "#5f9b7a" },
  { name: "关注", value: 18, color: "#faad14" },
  { name: "次级+", value: 10, color: "#c77b78" },
];

/** 产品结构余额占比 */
const PRODUCT_MIX = [
  { name: "经营贷", amt: 48 },
  { name: "税金贷", amt: 32 },
  { name: "消费贷", amt: 15 },
  { name: "小微贷", amt: 5 },
];

/** 逾期账龄分布（演示 百万） */
const AGEING = [
  { bucket: "M1", amt: 186 },
  { bucket: "M2", amt: 92 },
  { bucket: "M3", amt: 48 },
  { bucket: "M4+", amt: 31 },
];

/** 省份风险热力（简化：Top 展示） */
const REGION_HEAT = [
  { region: "华东", risk: 42, balance: 52 },
  { region: "华南", risk: 48, balance: 28 },
  { region: "华北", risk: 38, balance: 22 },
  { region: "西南", risk: 55, balance: 15 },
  { region: "西北", risk: 51, balance: 8 },
];

const TOP_INDUSTRIES = [
  { industry: "批发零售", npl: 2.9, balance: 22 },
  { industry: "制造业", npl: 2.4, balance: 18 },
  { industry: "道路运输", npl: 3.8, balance: 9 },
  { industry: "软件信息", npl: 1.6, balance: 12 },
];

function regionColor(risk: number): string {
  if (risk >= 50) return "rgba(207, 19, 34, 0.35)";
  if (risk >= 44) return "rgba(250, 140, 22, 0.28)";
  return "rgba(111, 143, 149, 0.15)";
}

export default function AssetQuality() {
  return (
    <ModulePageShell
      title="资产质量看板"
      subtitle="管理视角：余额、不良、Vintage·M1+、风险分层、结构、账龄与区域/行业热点（演示数据）"
      breadcrumb={["资产监控", "资产质量看板"]}
      actions={
        <Space>
          <Button icon={<HeatMapOutlined />}>区域下钻</Button>
          <Button icon={<DownloadOutlined />}>导出简报</Button>
        </Space>
      }
    >
      <ModuleSectionCard title="资产总览" subtitle="关键大数">
        <Row gutter={[16, 16]}>
          <Col xs={12} lg={6}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[12px] block">在贷余额（亿）</Text>
              <Text strong className="text-[28px] text-[#4f6970] block mt-1">{KPI.balanceYi}</Text>
            </div>
          </Col>
          <Col xs={12} lg={6}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[12px] block">NPL 率</Text>
              <Text strong className="text-[28px] text-[#c77b78] block mt-1">{KPI.nplRate}%</Text>
              <Text type="secondary" className="text-[12px]">90+ 口径</Text>
            </div>
          </Col>
          <Col xs={12} lg={6}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[12px] block">M1+ 逾期率</Text>
              <Text strong className="text-[28px] text-[#d46b08] block mt-1">{KPI.m1Plus}%</Text>
            </div>
          </Col>
          <Col xs={12} lg={6}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[12px] block">观察名单占比</Text>
              <Text strong className="text-[28px] text-[#6f8f95] block mt-1">{KPI.watchList}%</Text>
            </div>
          </Col>
        </Row>
      </ModuleSectionCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="Vintage · M1 / M3 趋势" subtitle="按放款 cohort 对比质量演化">
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={VINTAGE_M1} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={40} unit="%" />
                  <RTooltip formatter={(v: number) => (v == null || Number.isNaN(v) ? "—" : `${v}%`)} />
                  <Legend />
                  <Line type="monotone" dataKey="m1" name="M1%" stroke="#6f8f95" strokeWidth={2} dot connectNulls />
                  <Line type="monotone" dataKey="m3" name="M3%" stroke="#c77b78" strokeWidth={2} dot connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="风险等级分布" subtitle="分池占比">
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={RISK_BUCKETS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label={(p) => `${String(p.name)} ${p.value}%`}>
                    {RISK_BUCKETS.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <ModuleSectionCard title="产品结构（余额占比）" subtitle="Portfolio mix">
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={PRODUCT_MIX} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "%", angle: 0, position: "insideTopLeft", fontSize: 10 }} />
                  <RTooltip formatter={(v: number) => [`${v}%`, "占比"]} />
                  <Bar dataKey="amt" name="占比%" fill="#4f6970" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} md={12}>
          <ModuleSectionCard title="逾期账龄结构" subtitle="Outstanding 分布（演示单位：百万）">
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={AGEING} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip formatter={(v: number) => [v, "余额"]} />
                  <Bar dataKey="amt" name="余额" fill="#d7a85f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="地理风险热力（大区）" subtitle="颜色越深风险指数越高；可替换为省市区县级地图组件">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {REGION_HEAT.map((r) => (
                <div
                  key={r.region}
                  className="rounded-lg border border-black/[0.06] p-3 text-center"
                  style={{ backgroundColor: regionColor(r.risk) }}
                >
                  <Text strong className="text-[13px] block">{r.region}</Text>
                  <Text type="secondary" className="text-[11px] block">风险指数 {r.risk}</Text>
                  <Text className="text-[12px] tabular-nums">{r.balance} 亿</Text>
                </div>
              ))}
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="Top 行业风险" subtitle="NPL 与余额（演示）">
            <Table
              size="small"
              pagination={false}
              rowKey="industry"
              dataSource={TOP_INDUSTRIES}
              columns={[
                { title: "行业", dataIndex: "industry", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
                { title: "NPL%", dataIndex: "npl", render: (v: number) => <Tag color={v > 3 ? "red" : "orange"} className="!m-0">{v}%</Tag> },
                { title: "余额占比%", dataIndex: "balance" },
              ]}
            />
          </ModuleSectionCard>
        </Col>
      </Row>
    </ModulePageShell>
  );
}
