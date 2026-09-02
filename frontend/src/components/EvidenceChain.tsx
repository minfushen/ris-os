/**
 * 预警证据链组件 [spec-RISK-6]
 *
 * 每条风险信号的证据项按「8 大变量域」分组展示，对齐《项目实施计划书》
 * 数据体系口径（客户/贷款/还款/信用卡/资产负债/交易/征信/三方），
 * 每条证据带来源、更新时间与可信度标识，支撑可解释性核查。
 */

import { Timeline, Tag, Typography, Empty } from "antd";
import {
  DatabaseOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { EvidenceItem } from "@/types/qcc";

const { Text } = Typography;

/** 可信度展示样式（高/中/低 → 语义色） */
const CREDIBILITY_STYLE: Record<string, { color: string; label: string }> = {
  高: { color: "success", label: "高" },
  中: { color: "warning", label: "中" },
  低: { color: "default", label: "低" },
};

/**
 * 数据来源 → 8 大变量域映射（对齐计划书数据体系章节）。
 * 命不中时归入「其他」。
 */
const VARIABLE_DOMAIN_RULES: { domain: string; keywords: string[] }[] = [
  { domain: "客户", keywords: ["客户", "ECIF", "主档", "工商"] },
  { domain: "贷款", keywords: ["贷款", "借据", "信贷", "授信"] },
  { domain: "还款", keywords: ["还款", "还息", "本金"] },
  { domain: "信用卡", keywords: ["信用卡", "账单", "额度"] },
  { domain: "资产负债", keywords: ["资产", "负债", "存款", "理财", "存贷汇"] },
  { domain: "交易", keywords: ["交易", "流水", "对公账户", "资金流向"] },
  { domain: "征信", keywords: ["征信", "多头", "人行"] },
  { domain: "三方", keywords: ["司法", "税务", "企查查", "法院", "被执行", "限高", "金税"] },
];

function resolveDomain(dataSource: string): string {
  for (const rule of VARIABLE_DOMAIN_RULES) {
    if (rule.keywords.some((k) => dataSource.includes(k))) return rule.domain;
  }
  return "其他";
}

interface EvidenceGroup {
  domain: string;
  items: EvidenceItem[];
}

function groupByDomain(items: EvidenceItem[]): EvidenceGroup[] {
  const groups = new Map<string, EvidenceItem[]>();
  for (const item of items) {
    const domain = resolveDomain(item.data_source);
    const list = groups.get(domain) ?? [];
    list.push(item);
    groups.set(domain, list);
  }
  // 按计划书变量域顺序输出，未匹配域排最后
  const order = ["客户", "贷款", "还款", "信用卡", "资产负债", "交易", "征信", "三方", "其他"];
  return [...groups.entries()]
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([domain, domainItems]) => ({ domain, items: domainItems }));
}

export interface EvidenceChainProps {
  items: EvidenceItem[];
}

export default function EvidenceChain({ items }: EvidenceChainProps) {
  if (!items || items.length === 0) {
    return <Empty description="暂无证据链数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const groups = groupByDomain(items);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.domain}>
          <div className="flex items-center gap-2 mb-2">
            <Tag color="blue" className="!m-0">
              {group.domain}域
            </Tag>
            <Text type="secondary" className="text-xs">
              {group.items.length} 条证据
            </Text>
          </div>
          <Timeline className="!pl-1">
            {group.items.map((evidence, idx) => {
              const cred = CREDIBILITY_STYLE[evidence.credibility] ?? CREDIBILITY_STYLE["低"];
              return (
                <Timeline.Item key={`${evidence.data_source}-${idx}`} color="blue">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Text strong className="text-[13px]">
                      <DatabaseOutlined className="mr-1 text-text-tertiary" />
                      {evidence.data_source}
                    </Text>
                    <Tag color={cred.color} className="!m-0 text-[11px]">
                      <SafetyCertificateOutlined className="mr-0.5" />
                      可信度 {cred.label}
                    </Tag>
                    <Text type="secondary" className="text-xs">
                      <ClockCircleOutlined className="mr-0.5" />
                      更新：{evidence.update_time}
                    </Text>
                  </div>
                  <Text className="text-[13px] block mt-1">{evidence.content}</Text>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </div>
      ))}
    </div>
  );
}
