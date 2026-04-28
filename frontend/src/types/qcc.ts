/**
 * 企查查风险评估相关类型定义
 */

// 风险等级枚举
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// 维度风险评估
export interface DimensionRisk {
  level: RiskLevel;
  score: number; // 0-100
  key_findings: string[];
  evidence: string[];
}

// 风险类别
export interface RiskCategory {
  category: string; // 风险类型
  level: RiskLevel;
  description: string;
  evidence: string;
  impact: string; // 供应链影响
  suggestion: string; // 处置建议
  response_time: string; // 响应时间要求
}

// 证据项
export interface EvidenceItem {
  data_source: string; // 数据来源
  update_time: string; // 更新时间
  credibility: string; // 可信度
  content: string; // 证据内容
}

// 处置建议
export interface DispositionSuggestion {
  action: string; // 处置动作
  sla: string; // SLA
  responsible_person: string; // 责任人
  materials: string[]; // 需补充材料
}

// 企业风险评估结果
export interface VendorRiskAssessment {
  company_name: string;
  overall_risk: RiskLevel;
  dimensions: {
    commercial_risk?: DimensionRisk; // 商业风险
    operational_risk?: DimensionRisk; // 运营风险
    financial_risk?: DimensionRisk; // 财务风险
    compliance_risk?: DimensionRisk; // 合规风险
    strategic_risk?: DimensionRisk; // 战略风险
    geopolitical_risk?: DimensionRisk; // 地缘政治风险
    capacity_risk?: DimensionRisk; // 产能资质风险
    stability_risk?: DimensionRisk; // 组织稳定性风险
    business_health_risk?: DimensionRisk; // 业务健康度风险
  };
  risk_categories: RiskCategory[];
  evidence_chain: EvidenceItem[];
  disposition_suggestions: DispositionSuggestion[];
  assessment_time: string;
}

// 企业风险评估请求
export interface AssessVendorRiskRequest {
  company_name: string;
  dimensions?: string[]; // 可选：指定评估维度
}

// 企查查企业工商信息
export interface QccCompanyInfo {
  企业名称: string;
  统一社会信用代码: string;
  法定代表人: string;
  注册资本: string;
  成立日期: string;
  登记机关: string;
  登记状态: string;
  经营范围: string;
  注册地址?: string;
  通信地址?: string;
}

// 企查查风险信息
export interface QccRiskInfo {
  dishonest?: Array<Record<string, unknown>>; // 失信信息
  judgment_debtor?: Array<Record<string, unknown>>; // 被执行人
  high_consumption?: Array<Record<string, unknown>>; // 限制高消费
  abnormal_operation?: Array<Record<string, unknown>>; // 经营异常
  serious_violation?: Array<Record<string, unknown>>; // 严重违法
  cancellation_filing?: Array<Record<string, unknown>>; // 注销备案
  equity_freeze?: Array<Record<string, unknown>>; // 股权冻结
  equity_pledge?: Array<Record<string, unknown>>; // 股权出质
  chattel_mortgage?: Array<Record<string, unknown>>; // 动产抵押
  tax_arrears?: Array<Record<string, unknown>>; // 欠税公告
  abnormal_tax?: Array<Record<string, unknown>>; // 税务异常
  final_case?: Array<Record<string, unknown>>; // 终本案件
  administrative_penalty?: Array<Record<string, unknown>>; // 行政处罚
  environmental_penalty?: Array<Record<string, unknown>>; // 环保处罚
  bankruptcy_reorganization?: Array<Record<string, unknown>>; // 破产重整
  judicial_auction?: Array<Record<string, unknown>>; // 司法拍卖
}

// 企查查经营信息
export interface QccOperationInfo {
  qualifications?: Array<Record<string, unknown>>; // 资质证书
  administrative_licenses?: Array<Record<string, unknown>>; // 行政许可
  bidding_info?: Array<Record<string, unknown>>; // 招投标信息
  credit_rating?: Array<Record<string, unknown>>; // 信用评级
  spot_check_records?: Array<Record<string, unknown>>; // 抽查检查记录
  financing_records?: Array<Record<string, unknown>>; // 融资记录
}

// 风险等级颜色映射
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  CRITICAL: "#ff4d4f",
  HIGH: "#ff7a45",
  MEDIUM: "#faad14",
  LOW: "#52c41a",
};

// 风险等级文本映射
export const RISK_LEVEL_TEXT: Record<RiskLevel, string> = {
  CRITICAL: "关键风险",
  HIGH: "高风险",
  MEDIUM: "中等风险",
  LOW: "低风险",
};

// 维度名称映射
export const DIMENSION_NAMES: Record<string, string> = {
  commercial_risk: "商业风险",
  operational_risk: "运营风险",
  financial_risk: "财务风险",
  compliance_risk: "合规风险",
  strategic_risk: "战略风险",
  geopolitical_risk: "地缘政治风险",
  capacity_risk: "产能资质风险",
  stability_risk: "组织稳定性风险",
  business_health_risk: "业务健康度风险",
};
