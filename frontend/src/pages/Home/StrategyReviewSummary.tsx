import { Typography, Row, Col, Tag, Button, Space } from "antd";
import { DeploymentUnitOutlined, AuditOutlined, FileSearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface StrategyReviewSummaryProps {
  /** 策略发布待处理（演示） */
  strategyPending?: number;
  /** 复核/审批待签字（演示） */
  reviewPending?: number;
  /** 抽检/核查待办（演示） */
  inspectionPending?: number;
  onGotoPublish?: () => void;
  onGotoInspection?: () => void;
  onGotoRules?: () => void;
}

/**
 * 策略与复核待办摘要：与工单池区分，强调审批流与策略运营闭环。
 */
export default function StrategyReviewSummary({
  strategyPending = 2,
  reviewPending = 1,
  inspectionPending = 1,
  onGotoPublish,
  onGotoInspection,
  onGotoRules,
}: StrategyReviewSummaryProps) {
  return (
    <section className="section-shell">
      <div className="section-header flex flex-wrap items-center justify-between gap-2">
        <div>
          <Text className="section-title">策略与复核待办摘要</Text>
          <Text className="section-subtitle ml-2">与下方工单池互补：侧重发布、签字与抽检队列</Text>
        </div>
        <Tag className="text-xs m-0">演示口径</Tag>
      </div>
      <div className="section-body">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="glass-panel p-3 h-full">
              <Space align="start">
                <DeploymentUnitOutlined className="text-primary text-lg mt-0.5" />
                <div>
                  <Text className="text-xs text-text-muted block">策略发布 / 灰度</Text>
                  <Text strong className="text-2xl block my-1">{strategyPending}</Text>
                  <Button type="link" size="small" className="!px-0 !h-auto" onClick={onGotoPublish}>
                    打开发布进度
                  </Button>
                </div>
              </Space>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="glass-panel p-3 h-full">
              <Space align="start">
                <FileSearchOutlined className="text-primary text-lg mt-0.5" />
                <div>
                  <Text className="text-xs text-text-muted block">复核待签字</Text>
                  <Text strong className="text-2xl block my-1">{reviewPending}</Text>
                  <Button type="link" size="small" className="!px-0 !h-auto" onClick={onGotoRules}>
                    规则与审批流
                  </Button>
                </div>
              </Space>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="glass-panel p-3 h-full">
              <Space align="start">
                <AuditOutlined className="text-primary text-lg mt-0.5" />
                <div>
                  <Text className="text-xs text-text-muted block">抽检 / 专家核查</Text>
                  <Text strong className="text-2xl block my-1">{inspectionPending}</Text>
                  <Button type="link" size="small" className="!px-0 !h-auto" onClick={onGotoInspection}>
                    进入抽检中心
                  </Button>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
