/**
 * 预警大盘 - 使用真实数据
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
  Spin,
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

export default function Dashboard() {
  const navigate = useNavigate();

  // 状态
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, alertsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAlertList({ status: "active", limit: 50 }),
      ]);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (error) {
      message.error("加载数据失败");
    } finally {
      setLoading(false);
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
    <ModulePageShell title="预警大盘" subtitle="实时监控预警态势">
      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待处置预警"
                value={stats?.pending_alerts || 0}
                suffix="条"
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="关键预警"
                value={stats?.critical_alerts || 0}
                suffix="条"
                prefix={<WarningOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="高风险预警"
                value={stats?.high_alerts || 0}
                suffix="条"
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="高风险企业"
                value={stats?.high_risk_enterprises || 0}
                suffix="家"
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* 风险分布 */}
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

        {/* 预警列表 */}
        <ModuleSectionCard
          title="待处置预警"
          subtitle={`共 ${alerts.length} 条`}
          extra={
            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => navigate("/monitor/watchlist-upload")}
              >
                上传监控名单
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadData}>
                刷新
              </Button>
            </Space>
          }
        >
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
        </ModuleSectionCard>
      </Spin>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
