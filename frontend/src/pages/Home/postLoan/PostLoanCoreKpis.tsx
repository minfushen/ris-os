import { Row, Col, Typography } from "antd";
import { RiseOutlined } from "@ant-design/icons";
import { RiskStrip, type RiskStripVariant } from "./uiPrimitives";

const { Text, Title } = Typography;

export type PostLoanKpiKey = "m1" | "newAlert" | "timeout" | "effectiveness";

interface PostLoanCoreKpisProps {
  onDrill?: (key: PostLoanKpiKey) => void;
}

const KPI_STRIP: Record<PostLoanKpiKey, RiskStripVariant> = {
  m1: "danger",
  newAlert: "warning",
  timeout: "warning",
  effectiveness: "success",
};

function Trend({ text, semantic }: { text: string; semantic: "good" | "bad" }) {
  const Icon = RiseOutlined;
  const color = semantic === "bad" ? "#cf1322" : "#389e0d";
  return (
    <span className="inline-flex items-center gap-1 text-sm" style={{ color }}>
      <Icon />
      <span>{text}</span>
    </span>
  );
}

export default function PostLoanCoreKpis({ onDrill }: PostLoanCoreKpisProps) {
  return (
    <section className="section-shell">
      <div className="section-header">
        <Text className="section-title">核心资产指标</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          聚焦贷后：资产质量恶化、新增预警与处置时效（演示数据）
        </Text>
      </div>
      <div className="section-body">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <div
              role="button"
              tabIndex={0}
              className="pl-solid-card pl-solid-card--interactive flex h-full min-h-[148px] cursor-pointer overflow-hidden"
              onClick={() => onDrill?.("m1")}
              onKeyDown={(e) => e.key === "Enter" && onDrill?.("m1")}
            >
              <RiskStrip variant={KPI_STRIP.m1} />
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <Text className="pl-aux-text mb-1 block !text-[12px]">M1+逾期率</Text>
                <Title level={2} className="!m-0 !text-[1.75rem] !font-semibold !text-[#262626]" style={{ color: "#cf1322" }}>
                  3.42%
                </Title>
                <div className="mt-2">
                  <Trend text="较上月 +0.18%" semantic="bad" />
                </div>
                <Text className="pl-aux-text mt-auto block pt-3">经营贷 · 本月 · 点击下钻</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div
              role="button"
              tabIndex={0}
              className="pl-solid-card pl-solid-card--interactive flex h-full min-h-[148px] cursor-pointer overflow-hidden"
              onClick={() => onDrill?.("newAlert")}
              onKeyDown={(e) => e.key === "Enter" && onDrill?.("newAlert")}
            >
              <RiskStrip variant={KPI_STRIP.newAlert} />
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <Text className="pl-aux-text mb-1 block !text-[12px]">新增预警客户</Text>
                <Title level={2} className="!m-0 !text-[1.75rem] !font-semibold !text-[#262626]" style={{ color: "#d48806" }}>
                  23
                </Title>
                <div className="mt-2">
                  <Text className="text-sm font-medium" style={{ color: "#fa8c16" }}>
                    较昨日 +8
                  </Text>
                </div>
                <Text className="pl-aux-text mt-auto block pt-3">全产品线 · 今日 · 点击处置</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div
              role="button"
              tabIndex={0}
              className="pl-solid-card pl-solid-card--interactive flex h-full min-h-[148px] cursor-pointer overflow-hidden"
              onClick={() => onDrill?.("timeout")}
              onKeyDown={(e) => e.key === "Enter" && onDrill?.("timeout")}
            >
              <RiskStrip variant={KPI_STRIP.timeout} />
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <Text className="pl-aux-text mb-1 block !text-[12px]">超时未处置工单</Text>
                <Title level={2} className="!m-0 !text-[1.75rem] !font-semibold !text-[#262626]" style={{ color: "#d46b08" }}>
                  8
                </Title>
                <div className="mt-2">
                  <Text className="pl-aux-text !text-[12px]">最长超时 38h</Text>
                </div>
                <Text className="pl-aux-text mt-auto block pt-3">我的队列 · 点击认领</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div
              role="button"
              tabIndex={0}
              className="pl-solid-card pl-solid-card--interactive flex h-full min-h-[148px] cursor-pointer overflow-hidden"
              onClick={() => onDrill?.("effectiveness")}
              onKeyDown={(e) => e.key === "Enter" && onDrill?.("effectiveness")}
            >
              <RiskStrip variant={KPI_STRIP.effectiveness} />
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <Text className="pl-aux-text mb-1 block !text-[12px]">本月预警有效率</Text>
                <Title level={2} className="!m-0 !text-[1.75rem] !font-semibold !text-[#262626]" style={{ color: "#389e0d" }}>
                  68%
                </Title>
                <div className="mt-2">
                  <Trend text="较上月 +5%" semantic="good" />
                </div>
                <Text className="pl-aux-text mt-auto block pt-3">司法涉诉规则最高 83%</Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
