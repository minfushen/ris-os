/**
 * 风险模式库 — 真实贷后风险案例与识别模式
 *
 * 对应招标交付：预警模型开发及验证报告 — 风险特征分析
 */

import { useState } from "react";
import { Typography, Tag, Card, Space, Descriptions } from "antd";
import { WarningOutlined, SafetyOutlined, ThunderboltOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";

const { Text, Paragraph } = Typography;

interface FraudPattern {
  id: string;
  name: string;
  riskLevel: "高" | "中" | "低";
  industries: string[];
  signals: string[];
  description: string;
  detectionMethod: string;
  caseExample: string;
  relatedRules: string[];
  occurrenceCount: number;
}

const PATTERNS: FraudPattern[] = [
  {
    id: "FP-01",
    name: "资金挪用 · 对公回流个人账户",
    riskLevel: "高",
    industries: ["批发零售", "制造业"],
    signals: ["对公账户大额资金分拆转入实控人个人账户", "转入时间与贷款发放日高度相关", "个人账户短期内多笔小额消费"],
    description: "企业将经营贷款资金通过化整为零方式转移至实控人个人账户，用于非经营用途（理财、购房、民间借贷等）。",
    detectionMethod: "监测对公账户单日转出金额与实控人个人账户转入金额的关联性，设定时间窗口（T+3日内）和金额阈值（单笔>10万或累计>授信额30%）。",
    caseExample: "XX贸易公司获得300万经营贷后，T+1~T+5日通过5笔50-70万不等金额转入法人个人账户，后续资金流向房地产领域。",
    relatedRules: ["对公回流个人账户", "贷款发放后短期资金异动"],
    occurrenceCount: 23,
  },
  {
    id: "FP-02",
    name: "团伙共债 · 设备/地址簇",
    riskLevel: "高",
    industries: ["服务业", "住宿餐饮"],
    signals: ["多主体共享设备指纹", "注册/经营地址高度集中", "还款日同步（同一日或连续日）", "申请材料模板化"],
    description: "多家企业由同一实控人/团伙控制，使用相似申请材料在多家机构获得贷款，形成跨机构共债风险。",
    detectionMethod: "构建设备指纹-地址-法人三重关联图谱，当关联节点数≥3且总授信额超过阈值时触发预警。",
    caseExample: "某园区内5家餐饮企业使用同一设备提交贷款申请，法人互为关联方，总授信额达1200万，后续3家同时逾期。",
    relatedRules: ["多头共债关联", "设备指纹重复"],
    occurrenceCount: 17,
  },
  {
    id: "FP-03",
    name: "税报粉饰 · 申报收入骤增",
    riskLevel: "中",
    industries: ["制造业", "批发零售"],
    signals: ["纳税申报收入环比骤增>50%", "同期水电能耗未同步增长", "申报数据季后大幅下修", "与行业季节性规律不符"],
    description: "企业通过临时做大申报收入获取更高授信额度，贷款发放后申报数据回归真实水平。",
    detectionMethod: "对比纳税申报收入与水电能耗/社保人数的交叉验证，设定行业基准偏离度阈值（制造业>30%，批发零售>50%）。",
    caseExample: "XX制造企业在贷款申请前2月申报收入环比+80%，但同期用电量持平，贷款获批后次月申报收入回落至原水平。",
    relatedRules: ["经营异常-税报断档", "收入能耗背离"],
    occurrenceCount: 31,
  },
  {
    id: "FP-04",
    name: "关联担保链断裂",
    riskLevel: "中",
    industries: ["建筑业", "制造业"],
    signals: ["担保方出现失信/被执行", "担保链上多家企业同时预警", "关联企业间频繁互保"],
    description: "担保链上某节点企业出现风险后，通过担保关系向链上其他企业传导，导致连锁反应。",
    detectionMethod: "构建担保关系图谱，监测担保链上企业的司法/经营异动，当核心节点（担保金额最大者）出现风险信号时触发全链预警。",
    caseExample: "某建筑工程公司为3家关联企业提供连带担保，自身因工程款纠纷被起诉后，3家被担保企业同时被列入风险监控。",
    relatedRules: ["司法风险-被执行", "担保集中度"],
    occurrenceCount: 14,
  },
  {
    id: "FP-05",
    name: "经营空心化 · 社保人数骤降",
    riskLevel: "中",
    industries: ["服务业", "住宿餐饮"],
    signals: ["社保缴纳人数环比降幅>30%", "同期工资支出同步下降", "工商注册地址与实际经营地不符"],
    description: "企业核心团队流失或经营规模大幅缩减，但仍维持存量贷款，实际已无持续还款能力。",
    detectionMethod: "每月比对社保人数变动，环比降幅超过阈值（服务业>30%、制造业>20%）且无合理解释的，触发经营异常预警。",
    caseExample: "XX酒店在2个月内社保人数从45人降至12人，期间贷款余额未减少，后续3个月进入逾期。",
    relatedRules: ["经营异常-用工骤降", "地址异常"],
    occurrenceCount: 19,
  },
];

const RISK_COLORS: Record<string, string> = { "高": "#ff4d4f", "中": "#faad14", "低": "#52c41a" };

export default function FraudPatterns() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ModulePageShell
      title="风险模式库"
      subtitle="历史核查中沉淀的高频风险模式，供预警规则设计、模型特征工程与核查参考"
      breadcrumb={["知识沉淀", "风险模式库"]}
    >
      <ModuleSectionCard title="风险模式目录" subtitle={`共沉淀 ${PATTERNS.length} 种可复用模式`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <div className="card-surface layout-p-md text-center">
            <WarningOutlined className="text-red-500 text-xl mb-2" />
            <div className="text-[12px] text-gray-500">高风险模式</div>
            <Text strong className="text-[22px] text-red-600">{PATTERNS.filter((p) => p.riskLevel === "高").length}</Text>
          </div>
          <div className="card-surface layout-p-md text-center">
            <ThunderboltOutlined className="text-orange-500 text-xl mb-2" />
            <div className="text-[12px] text-gray-500">涉及案例</div>
            <Text strong className="text-[22px]">{PATTERNS.reduce((s, p) => s + p.occurrenceCount, 0)}</Text>
          </div>
          <div className="card-surface layout-p-md text-center">
            <SafetyOutlined className="text-blue-500 text-xl mb-2" />
            <div className="text-[12px] text-gray-500">覆盖行业</div>
            <Text strong className="text-[22px]">{new Set(PATTERNS.flatMap((p) => p.industries)).size}</Text>
          </div>
        </div>

        {PATTERNS.map((pattern) => (
          <Card
            key={pattern.id}
            size="small"
            className="mb-3 cursor-pointer"
            onClick={() => setExpandedId(expandedId === pattern.id ? null : pattern.id)}
            title={
              <Space wrap>
                <Tag color={RISK_COLORS[pattern.riskLevel]}>{pattern.riskLevel}风险</Tag>
                <Text strong className="text-[13px]">{pattern.name}</Text>
                <Text type="secondary" className="text-[11px]">{pattern.occurrenceCount} 例</Text>
              </Space>
            }
          >
            <Paragraph className="text-[13px] mb-2">{pattern.description}</Paragraph>
            <Space wrap>
              {pattern.industries.map((ind) => (
                <Tag key={ind} className="text-[11px]">{ind}</Tag>
              ))}
            </Space>

            {expandedId === pattern.id && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="识别信号">
                    <ul className="list-disc list-inside">
                      {pattern.signals.map((s, i) => <li key={i} className="text-[12px]">{s}</li>)}
                    </ul>
                  </Descriptions.Item>
                  <Descriptions.Item label="检测方法">{pattern.detectionMethod}</Descriptions.Item>
                  <Descriptions.Item label="典型案例">{pattern.caseExample}</Descriptions.Item>
                  <Descriptions.Item label="关联规则">
                    <Space wrap>{pattern.relatedRules.map((r) => <Tag key={r} color="blue">{r}</Tag>)}</Space>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Card>
        ))}
      </ModuleSectionCard>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
