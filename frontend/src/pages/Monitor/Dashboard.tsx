/**
 * 预警大盘 - 使用真实数据
 *
 * 渐进式加载策略：KPI 卡片先出（骨架屏占位），预警列表延迟加载（分页）
 */

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Card,
  message,
  Skeleton,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  UploadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";
import { api } from "@/api/client";
import type { Alert, DashboardStats } from "@/types/enterprise";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT } from "@/types/qcc";

const { Text } = Typography;

/** 今日预警概览（面试演示口径，常量不依赖接口） */
const TODAY_OVERVIEW = {
  total: 23,
  red: 6,
  yellow: 17,
  disposalRate: "74.2%",
  newToday: 3,
};

/** 预警类型分布（占比%） */
const ALERT_TYPE_DISTRIBUTION = [
  { type: "多头共债", pct: 32, color: "#dc2626" },
  { type: "经营异常", pct: 26, color: "#ea580c" },
  { type: "司法涉诉", pct: 18, color: "#d97706" },
  { type: "资金流异常", pct: 14, color: "#2563eb" },
  { type: "其他", pct: 10, color: "#64748b" },
];

/** 模型效果监控（评分卡 champion 版本口径） */
const MODEL_EFFECT = [
  { label: "PSI: 0.08", desc: "群体稳定性 · 阈值 <0.1 达标", color: "#52c41a" },
  { label: "KS: 0.42", desc: "区分能力 · 阈值 ≥0.3 达标", color: "#2563eb" },
  { label: "命中率: 68%", desc: "预警命中真实风险比例", color: "#7c3aed" },
];

/** KPI 卡片骨架屏 */
function KpiSkeleton() {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: "60%" }} />
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  // 状态
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // 分阶段加载：先加载 KPI 指标，再加载预警列表
  const loadData = async () => {
    // 第一阶段：KPI 指标（快速返回）
    setStatsLoading(true);
    try {
      const statsData = await api.getDashboardStats();
      setStats(statsData);
    } catch {
      message.error("加载统计数据失败");
    } finally {
      setStatsLoading(false);
    }

    // 第二阶段：预警列表（延迟加载，模拟大数据量）
    setAlertsLoading(true);
    try {
      const alertsData = await api.getAlertList({ status: "active", limit: 50 });
      setAlerts(alertsData);
    } catch {
      message.error("加载预警列表失败");
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 查看预警详情
  const handleViewAlert = (alert: Alert) => {
    navigate(`/risk/workbench?alert_id=${alert.id}`);
  };

  // 解决预警
  const handleResolveAlert = async (alertId: number) => {
    try {
      await api.resolveAlert(alertId);
      message.success("预警已解决");
      await loadData();
    } catch (error) {
      message.error("解决预警失败");
    }
  };

  // 表格列定义
  const columns: ColumnsType<Alert> = [
    {
      title: "预警等级",
      dataIndex: "alert_level",
      width: 100,
      render: (level: string) => (
        <Tag color={RISK_LEVEL_COLORS[level]}>
          {level === "CRITICAL" && <WarningOutlined className="mr-1" />}
          {RISK_LEVEL_TEXT[level]}
        </Tag>
      ),
    },
    {
      title: "企业名称",
      dataIndex: "company_name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "预警类型",
      dataIndex: "alert_type",
      width: 120,
    },
    {
      title: "预警来源",
      dataIndex: "alert_source",
      width: 150,
    },
    {
      title: "触发时间",
      dataIndex: "triggered_at",
      width: 180,
      render: (time: string) => new Date(time).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewAlert(record)}>
            查看详情
          </Button>
          <Button type="link" size="small" onClick={() => handleResolveAlert(record.id)}>
            解决预警
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="贷后预警监控大盘"
      subtitle="实时监控预警态势 · 项目效果口径：预警时效 15 天 → 5–7 天，人工排查工作量降 30%–40%"
    >
      {/* 今日预警概览（演示常量） */}
      <ModuleSectionCard title="今日预警概览" subtitle={`较昨日新增 ${TODAY_OVERVIEW.newToday} 条`} className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="总预警数" value={TODAY_OVERVIEW.total} suffix="条" valueStyle={{ color: "#2563eb" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="红灯" value={TODAY_OVERVIEW.red} suffix="条" valueStyle={{ color: "#dc2626" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="黄灯" value={TODAY_OVERVIEW.yellow} suffix="条" valueStyle={{ color: "#d97706" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="处置率" value={TODAY_OVERVIEW.disposalRate} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
        </Row>
      </ModuleSectionCard>

      {/* 预警类型分布 + 模型效果监控（演示常量） */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="预警类型分布" subtitle="近 30 天触发占比" className="h-full">
            <div className="space-y-3">
              {ALERT_TYPE_DISTRIBUTION.map((d) => (
                <div key={d.type}>
                  <div className="flex justify-between mb-1">
                    <Text>{d.type}</Text>
                    <Text type="secondary">{d.pct}%</Text>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="模型效果监控" subtitle="贷后预警评分卡 · Champion 版本" className="h-full">
            <Row gutter={[12, 12]}>
              {MODEL_EFFECT.map((m) => (
                <Col xs={24} sm={8} key={m.label}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title={m.label}
                      value={m.desc.split(" · ")[0]}
                      valueStyle={{ fontSize: 14, color: m.color }}
                    />
                    <Text type="secondary" className="text-[11px]">{m.desc.split(" · ")[1]}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </ModuleSectionCard>
        </Col>
      </Row>

      {/* KPI 指标区：骨架屏 → 数据到达 */}
      <Row gutter={[16, 16]} className="mb-4">
        {statsLoading ? (
          // 骨架屏占位
          Array.from({ length: 6 }).map((_, i) => (
            <Col xs={24} sm={12} md={4} key={i}>
              <KpiSkeleton />
            </Col>
          ))
        ) : (
          <>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="待处置预警"
                  value={stats?.pending_alerts || 0}
                  suffix="条"
                  valueStyle={{ color: "#dc2626" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="关键预警"
                  value={stats?.critical_alerts || 0}
                  suffix="条"
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: "#dc2626" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="高风险预警"
                  value={stats?.high_alerts || 0}
                  suffix="条"
                  valueStyle={{ color: "#d97706" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="高风险企业"
                  value={stats?.high_risk_enterprises || 0}
                  suffix="家"
                  valueStyle={{ color: "#d97706" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="预警时效"
                  value="5–7 天"
                  suffix="（原 15 天）"
                  valueStyle={{ color: "#2563eb" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="覆盖前六大小微产品"
                  value="88%"
                  suffix="余额 / 客户 96.75%"
                  valueStyle={{ color: "#2563eb" }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* 风险分布 */}
      {!statsLoading && (
        <ModuleSectionCard title="风险分布" className="mb-4">
          <Row gutter={[16, 16]}>
            {Object.entries(stats?.risk_distribution || {}).map(([level, count]) => (
              <Col xs={24} sm={12} md={6} key={level}>
                <Card size="small">
                  <Statistic
                    title={RISK_LEVEL_TEXT[level]}
                    value={count}
                    suffix="家"
                    valueStyle={{ color: RISK_LEVEL_COLORS[level] }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </ModuleSectionCard>
      )}

        {/* 预警列表：骨架屏 → 数据到达 */}
        <ModuleSectionCard
          title="待处置预警列表"
          subtitle={alertsLoading ? "加载中..." : `共 ${alerts.length} 条`}
          extra={
            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => navigate("/monitor/watchlist-upload")}
              >
                上传监控名单
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadData} loading={statsLoading || alertsLoading}>
                刷新
              </Button>
            </Space>
          }
        >
          {alertsLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={alerts}
              rowKey="id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          )}
        </ModuleSectionCard>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
