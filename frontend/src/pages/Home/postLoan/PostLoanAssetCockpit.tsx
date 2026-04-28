import { useEffect, useState } from "react";
import { Card, Col, Progress, Row, Spin, Table, Tag, Typography } from "antd";
import { api } from "@/api/client";
import type { DashboardStats } from "@/types/enterprise";

const { Text } = Typography;

function fmtAmount(value?: number): string {
  if (!value) return "0";
  if (value >= 100000000) return `${(value / 100000000).toFixed(2)} 亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(2)} 万`;
  return `${value.toFixed(0)}`;
}

export default function PostLoanAssetCockpit() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error("加载在贷资产驾驶舱失败", e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const totalLoanCount = (stats?.normal_loan_count || 0) + (stats?.watch_loan_count || 0);
  const normalCountPct = totalLoanCount > 0 ? Math.round(((stats?.normal_loan_count || 0) / totalLoanCount) * 100) : 0;
  const watchCountPct = totalLoanCount > 0 ? Math.round(((stats?.watch_loan_count || 0) / totalLoanCount) * 100) : 0;
  const normalBalancePct = (stats?.on_loan_balance || 0) > 0
    ? Math.round(((stats?.normal_loan_balance || 0) / (stats?.on_loan_balance || 1)) * 100)
    : 0;
  const watchBalancePct = (stats?.on_loan_balance || 0) > 0
    ? Math.round(((stats?.watch_loan_balance || 0) / (stats?.on_loan_balance || 1)) * 100)
    : 0;

  return (
    <section className="section-shell pl-fade-in-up">
      <div className="section-header">
        <Text className="section-title">在贷资产驾驶舱</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          同时展示正常在贷与关注资产，避免只看预警造成视角偏差
        </Text>
      </div>
      <div className="section-body">
        <Spin spinning={loading}>
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}>
              <Card><Text type="secondary">在贷企业数</Text><div className="text-[24px] font-semibold mt-1">{stats?.on_loan_enterprises ?? 0}</div></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Text type="secondary">在贷余额</Text><div className="text-[24px] font-semibold mt-1">{fmtAmount(stats?.on_loan_balance)}</div></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Text type="secondary">正常还款余额</Text><div className="text-[24px] font-semibold mt-1">{fmtAmount(stats?.normal_loan_balance)}</div></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Text type="secondary">关注类余额</Text><div className="text-[24px] font-semibold mt-1">{fmtAmount(stats?.watch_loan_balance)}</div></Card>
            </Col>
          </Row>

          <div className="mt-3">
            <Table
              size="small"
              rowKey={(r) => `${r.loan_account_no}-${r.company_name}`}
              pagination={false}
              dataSource={stats?.top_loan_exposures || []}
              columns={[
                { title: "企业名称", dataIndex: "company_name" },
                { title: "行业", dataIndex: "industry_category", width: 180 },
                { title: "借据号", dataIndex: "loan_account_no", width: 150 },
                {
                  title: "在贷余额",
                  dataIndex: "loan_balance",
                  width: 140,
                  render: (v: number) => fmtAmount(v),
                },
                { title: "状态", dataIndex: "loan_status", width: 120 },
              ]}
            />
          </div>

          <Row gutter={[12, 12]} className="mt-3">
            <Col xs={24} lg={12}>
              <Card title="状态结构占比">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Text>笔数结构（正常还款中）</Text>
                    <Text strong>{stats?.normal_loan_count || 0} 笔 / {normalCountPct}%</Text>
                  </div>
                  <Progress percent={normalCountPct} strokeColor="#52C41A" showInfo={false} />
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Text>笔数结构（关注）</Text>
                    <Text strong>{stats?.watch_loan_count || 0} 笔 / {watchCountPct}%</Text>
                  </div>
                  <Progress percent={watchCountPct} strokeColor="#FAAD14" showInfo={false} />
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Text>余额结构（正常还款中）</Text>
                    <Text strong>{fmtAmount(stats?.normal_loan_balance)} / {normalBalancePct}%</Text>
                  </div>
                  <Progress percent={normalBalancePct} strokeColor="#52C41A" showInfo={false} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Text>余额结构（关注）</Text>
                    <Text strong>{fmtAmount(stats?.watch_loan_balance)} / {watchBalancePct}%</Text>
                  </div>
                  <Progress percent={watchBalancePct} strokeColor="#FAAD14" showInfo={false} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="客户经理资产分布">
                <Table
                  size="small"
                  pagination={false}
                  rowKey={(r) => r.manager_id}
                  dataSource={stats?.manager_asset_distribution || []}
                  columns={[
                    {
                      title: "客户经理",
                      dataIndex: "manager_name",
                      width: 120,
                      render: (_, r) => r.manager_name || r.manager_id,
                    },
                    {
                      title: "在贷余额",
                      dataIndex: "total_loan_balance",
                      width: 120,
                      render: (v: number) => fmtAmount(v),
                    },
                    { title: "企业数", dataIndex: "enterprise_count", width: 80 },
                    {
                      title: "风险暴露",
                      dataIndex: "high_risk_enterprises",
                      width: 120,
                      render: (v: number) => (
                        <Tag color={v > 0 ? "red" : "green"}>{v > 0 ? `${v} 家高风险` : "无高风险"}</Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <div className="mt-3">
            <Card title="经理维度趋势（近7天）">
              <Table
                size="small"
                pagination={false}
                rowKey={(r) => r.manager_id}
                dataSource={stats?.manager_trends || []}
                columns={[
                  { title: "客户经理", dataIndex: "manager_name", width: 120 },
                  { title: "新增预警", dataIndex: "new_alerts_7d", width: 100 },
                  { title: "已处置", dataIndex: "resolved_alerts_7d", width: 100 },
                  { title: "在办预警", dataIndex: "active_alerts", width: 100 },
                  {
                    title: "趋势",
                    dataIndex: "alert_delta_7d",
                    width: 120,
                    render: (v: number) => {
                      if (v > 0) return <Tag color="red">+{v} 上升</Tag>;
                      if (v < 0) return <Tag color="green">{v} 下降</Tag>;
                      return <Tag>持平</Tag>;
                    },
                  },
                  {
                    title: "7天处置率",
                    dataIndex: "disposal_rate_7d",
                    width: 120,
                    render: (v: number) => `${v.toFixed(1)}%`,
                  },
                ]}
              />
            </Card>
          </div>
        </Spin>
      </div>
    </section>
  );
}
