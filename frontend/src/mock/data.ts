/**
 * 统一 Mock 数据源
 *
 * 所有 API mock fixtures 集中定义于此，严格跟随 TypeScript 类型。
 * MSW handlers 和测试 mock 均从此文件引用，避免数据散落。
 */

import type { DashboardStats, Alert, RiskAssessment, BatchOnboardWatchlistResponse, WatchlistPrecheckResponse } from "@/types/enterprise";
import type { PostLoanFeatureStudioResponse, DataDictionaryVariableRow, DataDictionarySourceRow } from "@/types/scenarioPostLoan";
import type { TaskListItem, TaskDetail } from "@/types";

// ═══════════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════════

export const mockDashboardStats: DashboardStats = {
  total_enterprises: 3847,
  risk_distribution: { CRITICAL: 23, HIGH: 156, MEDIUM: 412, LOW: 3256 },
  pending_alerts: 47,
  critical_alerts: 12,
  high_alerts: 35,
  high_risk_enterprises: 179,
  on_loan_enterprises: 2841,
  on_loan_amount: 68_5000_0000,
  on_loan_balance: 42_3000_0000,
  normal_loan_balance: 38_1000_0000,
  watch_loan_balance: 4_2000_0000,
  normal_loan_count: 2591,
  watch_loan_count: 250,
  loan_status_distribution: [
    { loan_status: "正常", loan_count: 2591, loan_balance: 38_1000_0000 },
    { loan_status: "关注", loan_count: 198, loan_balance: 3_5000_0000 },
    { loan_status: "次级", loan_count: 35, loan_balance: 5200_0000 },
    { loan_status: "可疑", loan_count: 12, loan_balance: 1300_0000 },
    { loan_status: "损失", loan_count: 5, loan_balance: 500_0000 },
  ],
  top_loan_exposures: [
    { company_name: "重庆博远实业有限公司", industry_category: "制造业", loan_balance: 850_0000, loan_status: "正常" },
    { company_name: "渝州建设集团有限公司", industry_category: "建筑业", loan_balance: 720_0000, loan_status: "关注" },
    { company_name: "万州恒通商贸有限公司", industry_category: "批发零售", loan_balance: 680_0000, loan_status: "正常" },
    { company_name: "涪陵鑫源酒店管理有限公司", industry_category: "住宿餐饮", loan_balance: 450_0000, loan_status: "次级" },
    { company_name: "永川瑞丰物流有限公司", industry_category: "服务业", loan_balance: 390_0000, loan_status: "正常" },
  ],
  manager_asset_distribution: [
    { manager_id: "RM001", manager_name: "张明", loan_count: 312, enterprise_count: 287, total_loan_balance: 8_5000_0000, watch_loan_count: 42, high_risk_enterprises: 35 },
    { manager_id: "RM002", manager_name: "李华", loan_count: 298, enterprise_count: 265, total_loan_balance: 7_2000_0000, watch_loan_count: 38, high_risk_enterprises: 28 },
    { manager_id: "RM003", manager_name: "王芳", loan_count: 341, enterprise_count: 310, total_loan_balance: 9_1000_0000, watch_loan_count: 55, high_risk_enterprises: 42 },
  ],
  manager_trends: [
    { manager_id: "RM001", manager_name: "张明", new_alerts_7d: 8, resolved_alerts_7d: 5, active_alerts: 15, alert_delta_7d: 3, disposal_rate_7d: 62.5 },
    { manager_id: "RM002", manager_name: "李华", new_alerts_7d: 6, resolved_alerts_7d: 7, active_alerts: 12, alert_delta_7d: -1, disposal_rate_7d: 87.5 },
    { manager_id: "RM003", manager_name: "王芳", new_alerts_7d: 12, resolved_alerts_7d: 4, active_alerts: 20, alert_delta_7d: 8, disposal_rate_7d: 33.3 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Alerts
// ═══════════════════════════════════════════════════════════════

export const mockAlerts: Alert[] = [
  {
    id: 1001, enterprise_id: 201, alert_type: "资金挪用 · 对公回流个人账户", alert_level: "CRITICAL",
    alert_source: "规则引擎-资金监控", alert_status: "active",
    triggered_at: "2026-04-28T09:15:00+08:00", company_name: "重庆博远实业有限公司", credit_code: "91500101MA5UXXXXX1",
    manager_id: "RM001", manager_name: "张明",
  },
  {
    id: 1002, enterprise_id: 202, alert_type: "税报断档 · 申报收入骤降", alert_level: "HIGH",
    alert_source: "规则引擎-税务监控", alert_status: "active",
    triggered_at: "2026-04-27T14:30:00+08:00", company_name: "渝州建设集团有限公司", credit_code: "91500102MA5UXXXXX2",
    manager_id: "RM002", manager_name: "李华",
  },
  {
    id: 1003, enterprise_id: 203, alert_type: "多头共债跳升 · 环比+42%", alert_level: "HIGH",
    alert_source: "模型评分-多头监控", alert_status: "active",
    triggered_at: "2026-04-26T11:00:00+08:00", company_name: "万州恒通商贸有限公司",
    manager_id: "RM003", manager_name: "王芳",
  },
  {
    id: 1004, enterprise_id: 204, alert_type: "经营空心化 · 社保人数骤降", alert_level: "MEDIUM",
    alert_source: "规则引擎-用工监控", alert_status: "active",
    triggered_at: "2026-04-25T08:45:00+08:00", company_name: "涪陵鑫源酒店管理有限公司",
    manager_id: "RM001", manager_name: "张明",
  },
  {
    id: 1005, enterprise_id: 205, alert_type: "司法风险 · 被执行/限高", alert_level: "CRITICAL",
    alert_source: "数据源-司法爬取", alert_status: "active",
    triggered_at: "2026-04-29T06:10:00+08:00", company_name: "永川瑞丰物流有限公司", credit_code: "91500105MA5UXXXXX5",
    manager_id: "RM002", manager_name: "李华",
  },
  {
    id: 1006, enterprise_id: 206, alert_type: "关联担保链断裂", alert_level: "MEDIUM",
    alert_source: "图谱引擎-担保关系", alert_status: "resolved",
    triggered_at: "2026-04-20T10:00:00+08:00", resolved_at: "2026-04-24T16:00:00+08:00",
    company_name: "黔江长兴建材有限公司",
    manager_id: "RM003", manager_name: "王芳",
  },
  {
    id: 1007, enterprise_id: 207, alert_type: "设备指纹重复 · 团伙共债嫌疑", alert_level: "HIGH",
    alert_source: "图谱引擎-设备簇", alert_status: "active",
    triggered_at: "2026-04-29T07:30:00+08:00", company_name: "重庆鑫旺餐饮管理有限公司",
    manager_id: "RM001", manager_name: "张明",
  },
  {
    id: 1008, enterprise_id: 208, alert_type: "水电能耗与申报规模背离", alert_level: "MEDIUM",
    alert_source: "规则引擎-交叉验证", alert_status: "active",
    triggered_at: "2026-04-28T16:00:00+08:00", company_name: "江津鑫源机械制造有限公司",
    manager_id: "RM002", manager_name: "李华",
  },
  {
    id: 1009, enterprise_id: 209, alert_type: "贷款资金流入房地产领域", alert_level: "CRITICAL",
    alert_source: "规则引擎-资金流向", alert_status: "active",
    triggered_at: "2026-04-29T08:00:00+08:00", company_name: "合川锦宏房地产开发有限公司",
    manager_id: "RM003", manager_name: "王芳",
  },
  {
    id: 1010, enterprise_id: 210, alert_type: "纳税申报季后大幅下修", alert_level: "HIGH",
    alert_source: "规则引擎-税务监控", alert_status: "active",
    triggered_at: "2026-04-26T09:00:00+08:00", company_name: "大足宏达五金制品有限公司",
    manager_id: "RM001", manager_name: "张明",
  },
  {
    id: 1011, enterprise_id: 211, alert_type: "应收账款质押率异常跳升", alert_level: "MEDIUM",
    alert_source: "模型评分-供应链监控", alert_status: "active",
    triggered_at: "2026-04-25T14:20:00+08:00", company_name: "璧山鑫泰包装材料有限公司",
    manager_id: "RM002", manager_name: "李华",
  },
  {
    id: 1012, enterprise_id: 212, alert_type: "法人代表变更频繁 · 实控人风险", alert_level: "HIGH",
    alert_source: "规则引擎-工商变更", alert_status: "active",
    triggered_at: "2026-04-24T10:00:00+08:00", company_name: "长寿恒源商贸有限公司",
    manager_id: "RM003", manager_name: "王芳",
  },
];

// ═══════════════════════════════════════════════════════════════
// Risk Assessment (for Workbench)
// ═══════════════════════════════════════════════════════════════

/** 多企业风险评估字典，按 enterprise_id 索引，与 mockAlerts 的预警类型一一对应 */
export const mockRiskAssessments: Record<number, RiskAssessment> = {
  // 201: 资金挪用 · 对公回流个人账户 (CRITICAL)
  201: {
    id: 501, enterprise_id: 201, overall_risk: "CRITICAL", assessment_time: "2026-04-29T07:00:00+08:00",
    assessment_data: {
      company_name: "重庆博远实业有限公司", overall_risk: "CRITICAL" as const,
      dimensions: {
        financial_risk: { level: "HIGH" as const, score: 78.5, key_findings: ["对公账户资金分拆转入法人个人账户 5 笔", "T+1~T+5 累计转出 310 万元，单笔 50-70 万元"], evidence: ["核心银行系统-交易流水"] },
        operational_risk: { level: "MEDIUM" as const, score: 62.0, key_findings: ["社保人数维持 85 人未变动", "水电能耗与申报规模匹配"], evidence: ["社保局数据", "电力公司账单"] },
        compliance_risk: { level: "CRITICAL" as const, score: 88.0, key_findings: ["法人有被执行记录 2 起", "涉及民间借贷纠纷"], evidence: ["中国执行信息公开网"] },
        stability_risk: { level: "MEDIUM" as const, score: 55.0, key_findings: ["近 6 月股权变更 2 次", "董监高变动频繁"], evidence: ["工商变更记录"] },
      },
      risk_categories: [
        { category: "资金挪用风险", level: "CRITICAL" as const, description: "对公贷款资金通过化整为零方式转移至实控人个人账户", evidence: "T+1~T+5 日 5 笔转账合计 310 万元转入法人个人账户", impact: "贷款资金未用于约定经营用途，存在合规风险和资金损失风险", suggestion: "立即冻结未用额度，启动贷后检查，要求企业退回挪用资金", response_time: "4 小时" },
        { category: "司法风险", level: "HIGH" as const, description: "法人代表涉及民间借贷被执行案件", evidence: "案号：(2026)渝 0101 执 1234 号，执行标的 200 万元", impact: "法人信用受损，可能影响企业经营决策和还款意愿", suggestion: "评估法人个人债务对企业的传导风险，考虑追加担保措施", response_time: "24 小时" },
      ],
      evidence_chain: [
        { data_source: "核心银行系统-交易流水", update_time: "2026-04-28 09:00", credibility: "高", content: "对公账户 6222****1234 于 T+1~T+5 向法人个人账户 6228****5678 转账 5 笔合计 310 万元" },
        { data_source: "中国执行信息公开网", update_time: "2026-04-28 08:30", credibility: "高", content: "法人涉及执行案件 2 起，合计执行标的 350 万元，其中 1 起为民间借贷纠纷" },
        { data_source: "国家企业信用信息公示系统", update_time: "2026-04-27", credibility: "高", content: "近 6 个月股权变更记录 2 条，2025年11月新增股东李四（持股30%），2026年2月股东王五退出" },
      ],
      disposition_suggestions: [
        { action: "冻结未用授信额度", sla: "4 小时", responsible_person: "客户经理 RM001", materials: ["资金用途证明材料"] },
        { action: "启动现场贷后检查", sla: "3 个工作日", responsible_person: "贷后管理岗", materials: ["经营场所照片", "库存盘点表", "近 3 月银行流水"] },
      ],
      assessment_time: "2026-04-29T07:00:00+08:00",
    },
  },

  // 202: 税报断档 · 申报收入骤降 (HIGH)
  202: {
    id: 502, enterprise_id: 202, overall_risk: "HIGH", assessment_time: "2026-04-28T08:00:00+08:00",
    assessment_data: {
      company_name: "渝州建设集团有限公司", overall_risk: "HIGH" as const,
      dimensions: {
        financial_risk: { level: "HIGH" as const, score: 72.0, key_findings: ["纳税申报收入环比下降 62%", "近 2 个季度所得税为零申报"], evidence: ["金税三期-申报记录"] },
        operational_risk: { level: "MEDIUM" as const, score: 58.0, key_findings: ["在建工程数量从 5 个降至 2 个", "新签合同金额同比下降 45%"], evidence: ["住建委项目备案", "企业财报"] },
        compliance_risk: { level: "MEDIUM" as const, score: 55.0, key_findings: ["税收滞纳金记录 1 条", "社保欠缴 2 个月"], evidence: ["税务系统", "社保局数据"] },
        business_health_risk: { level: "HIGH" as const, score: 70.0, key_findings: ["建筑业季度开工率降至 55%（行业均值 72%）", "工程回款周期从 90 天延长至 150 天"], evidence: ["住建委开工备案", "对公账户流水"] },
      },
      risk_categories: [
        { category: "税报断档风险", level: "HIGH" as const, description: "企业纳税申报收入出现大幅下降，与贷款审批时的经营规模不匹配", evidence: "2026年Q1 申报收入环比下降 62%，Q4 2025 已出现零申报", impact: "企业经营规模可能已实质性收缩，第一还款来源弱化", suggestion: "核实实际经营状况，评估是否需下调授信额度或增加担保", response_time: "24 小时" },
        { category: "工程回款风险", level: "MEDIUM" as const, description: "在建工程量下滑叠加回款周期延长，现金流压力上升", evidence: "回款周期从 90 天延长至 150 天，新签合同额同比降 45%", impact: "经营现金流入减少，贷款按期偿还能力下降", suggestion: "逐笔核实在建工程进度与回款计划，必要时启动弹性还款方案", response_time: "3 个工作日" },
      ],
      evidence_chain: [
        { data_source: "金税三期-申报记录", update_time: "2026-04-27 10:00", credibility: "高", content: "2026年Q1增值税申报收入 186 万元，环比 2025年Q4（489 万元）下降 62%；2025年Q4 所得税零申报" },
        { data_source: "住建委项目备案系统", update_time: "2026-04-26", credibility: "高", content: "在建工程备案数量：2025年Q3 5个 → 2026年Q1 2个；新签合同金额同比下降 45%" },
        { data_source: "对公账户流水", update_time: "2026-04-28 07:00", credibility: "高", content: "近 6 个月工程回款合计 320 万元，同比减少 55%，单笔回款平均周期 150 天（2025年同期 90 天）" },
      ],
      disposition_suggestions: [
        { action: "核实企业经营现状与在手订单", sla: "3 个工作日", responsible_person: "客户经理 RM002", materials: ["近 6 月工程合同", "回款凭证", "在建工程进度表"] },
        { action: "重新评估授信额度", sla: "5 个工作日", responsible_person: "风险经理", materials: ["最新财报", "纳税申报表", "工程台账"] },
      ],
      assessment_time: "2026-04-28T08:00:00+08:00",
    },
  },

  // 203: 多头共债跳升 · 环比+42% (HIGH)
  203: {
    id: 503, enterprise_id: 203, overall_risk: "HIGH", assessment_time: "2026-04-27T09:00:00+08:00",
    assessment_data: {
      company_name: "万州恒通商贸有限公司", overall_risk: "HIGH" as const,
      dimensions: {
        financial_risk: { level: "HIGH" as const, score: 74.0, key_findings: ["近 3 月跨机构贷款申请 8 次（环比 +42%）", "当前存续贷款机构 6 家，总负债 1,860 万元"], evidence: ["征信报告-多头借贷"] },
        operational_risk: { level: "MEDIUM" as const, score: 60.0, key_findings: ["存货周转天数从 45 天延长至 68 天", "应收账款账龄 >90 天占比升至 28%"], evidence: ["企业财报", "进销存系统"] },
        stability_risk: { level: "LOW" as const, score: 35.0, key_findings: ["经营年限 8 年，法人未变更", "无失信或被执行记录"], evidence: ["工商信息", "司法查询"] },
      },
      risk_categories: [
        { category: "多头共债风险", level: "HIGH" as const, description: "企业短期内跨多家机构频繁申请贷款，负债率快速攀升", evidence: "近 3 月征信查询 8 次（同比 +42%），存续贷款机构从 4 家增至 6 家，总负债 1,860 万元", impact: "过度借贷可能导致还款压力集中爆发，跨机构传染风险上升", suggestion: "联系其他授信机构了解贷后策略，评估联合预警或协商还款", response_time: "24 小时" },
        { category: "经营周转风险", level: "MEDIUM" as const, description: "存货和应收账款周转效率下降，资金占用增加", evidence: "存货周转天数 45→68 天，应收账款 >90 天占比升至 28%", impact: "营运资金被存货和应收账款占用，加剧流动性压力", suggestion: "核实存货结构与应收账款回收计划，评估是否需要缩减循环贷额度", response_time: "3 个工作日" },
      ],
      evidence_chain: [
        { data_source: "人行征信报告", update_time: "2026-04-26 15:00", credibility: "高", content: "近 3 月贷款申请类查询 8 次（2025年同期 5-6 次）；存续贷款机构 6 家，总授信余额 1,860 万元，其中 3 家为近 6 个月新增" },
        { data_source: "企业进销存系统", update_time: "2026-04-25", credibility: "中", content: "存货周转天数从 2025年Q4 的 45 天延长至 2026年Q1 的 68 天；应收账款中 >90 天账龄占比从 15% 升至 28%" },
      ],
      disposition_suggestions: [
        { action: "启动多头共债专项核查", sla: "24 小时", responsible_person: "风险经理 RM003", materials: ["最新征信报告", "他行授信明细"] },
        { action: "评估降额或还款计划调整", sla: "5 个工作日", responsible_person: "贷后管理岗", materials: ["企业近 6 月银行流水", "存货清单", "应收账款明细"] },
      ],
      assessment_time: "2026-04-27T09:00:00+08:00",
    },
  },

  // 204: 经营空心化 · 社保人数骤降 (MEDIUM)
  204: {
    id: 504, enterprise_id: 204, overall_risk: "MEDIUM", assessment_time: "2026-04-26T14:00:00+08:00",
    assessment_data: {
      company_name: "涪陵鑫源酒店管理有限公司", overall_risk: "MEDIUM" as const,
      dimensions: {
        operational_risk: { level: "MEDIUM" as const, score: 65.0, key_findings: ["社保缴纳人数从 45 人降至 12 人（-73%），连续 2 个月", "同期工资支出下降 68%"], evidence: ["社保局数据", "银行代发工资流水"] },
        financial_risk: { level: "MEDIUM" as const, score: 58.0, key_findings: ["对公账户月均流入下降 55%", "贷款余额未减少，月还款占流入比升至 42%"], evidence: ["对公账户流水", "贷款台账"] },
        business_health_risk: { level: "MEDIUM" as const, score: 62.0, key_findings: ["住宿餐饮行业 Q1 区域入住率 48%（同期 62%）", "OTA 平台评分从 4.6 降至 3.8"], evidence: ["文旅委数据", "OTA 平台"] },
      },
      risk_categories: [
        { category: "经营空心化风险", level: "MEDIUM" as const, description: "企业员工规模大幅缩减，核心团队流失，实际经营能力下降", evidence: "社保人数 45→12 人（环比 -73%），工资支出同步下降 68%", impact: "企业已实质性缩减经营规模，但贷款余额未减少，还款能力与负债规模不匹配", suggestion: "现场核实酒店实际经营状态（客房入住率、在岗员工数），评估是否需提前收贷", response_time: "7 天" },
      ],
      evidence_chain: [
        { data_source: "社保局数据", update_time: "2026-04-25 16:00", credibility: "高", content: "社保缴纳人数：2026年2月 45 人 → 2026年3月 28 人 → 2026年4月 12 人，连续两月环比降幅超 30%" },
        { data_source: "银行代发工资流水", update_time: "2026-04-25", credibility: "高", content: "工资代发总额：2026年2月 28.5 万 → 2026年4月 9.2 万，降幅 68%，与社保人数下降同步" },
        { data_source: "OTA 平台经营数据", update_time: "2026-04-26", credibility: "中", content: "酒店近 3 月评分从 4.6 降至 3.8，多条差评涉及'服务人员不足''设施维护差'" },
      ],
      disposition_suggestions: [
        { action: "现场经营核实（暗访/明访）", sla: "7 个工作日", responsible_person: "贷后管理岗", materials: ["现场照片", "在岗员工名册", "近 3 月入住记录"] },
        { action: "评估提前收贷或增信措施", sla: "10 个工作日", responsible_person: "风险经理", materials: ["经营现状报告", "还款能力重新评估"] },
      ],
      assessment_time: "2026-04-26T14:00:00+08:00",
    },
  },

  // 205: 司法风险 · 被执行/限高 (CRITICAL)
  205: {
    id: 505, enterprise_id: 205, overall_risk: "CRITICAL", assessment_time: "2026-04-29T06:30:00+08:00",
    assessment_data: {
      company_name: "永川瑞丰物流有限公司", overall_risk: "CRITICAL" as const,
      dimensions: {
        compliance_risk: { level: "CRITICAL" as const, score: 92.0, key_findings: ["新增被执行案件 3 起，合计标的 580 万元", "法人被限制高消费，关联失信记录 2 条"], evidence: ["中国执行信息公开网", "全国法院被执行人查询"] },
        financial_risk: { level: "HIGH" as const, score: 76.0, key_findings: ["对公账户近 30 天被冻结 2 次", "贷款月供已出现 15 天逾期"], evidence: ["行内核心系统", "贷款台账"] },
        operational_risk: { level: "HIGH" as const, score: 68.0, key_findings: ["名下 12 辆营运车辆中 4 辆被查封", "主要客户合同到期未续签"], evidence: ["车管所数据", "运输合同"] },
        stability_risk: { level: "HIGH" as const, score: 72.0, key_findings: ["公司银行账户被法院冻结", "法人限制消费影响业务拓展"], evidence: ["法院裁定书", "银行冻结通知"] },
      },
      risk_categories: [
        { category: "司法执行风险", level: "CRITICAL" as const, description: "企业及法人涉及多起被执行案件且被限制高消费，信用状况恶化", evidence: "新增被执行 3 起合计 580 万元，法人限高令 2026-04-28 生效", impact: "账户冻结直接影响经营周转，法人限高导致无法正常开展业务谈判和签约", suggestion: "立即启动法律催收程序，评估资产保全可行性，协调法院解冻经营必需账户", response_time: "4 小时" },
        { category: "贷款逾期风险", level: "HIGH" as const, description: "企业已出现还款逾期，且账户冻结将进一步恶化还款能力", evidence: "贷款月供已逾期 15 天，2 个对公账户被冻结", impact: "逾期将持续扩大，形成不良贷款的可能性极高", suggestion: "列入重点监控名单，启动委外催收或法务介入", response_time: "24 小时" },
      ],
      evidence_chain: [
        { data_source: "中国执行信息公开网", update_time: "2026-04-29 06:00", credibility: "高", content: "2026年4月新增被执行案件 3 起：(2026)渝 0105 执 201 号（运输合同纠纷，标的 280 万）、(2026)渝 0105 执 202 号（民间借贷，标的 180 万）、(2026)渝 0105 执 203 号（货款纠纷，标的 120 万）；法人限高令 (2026)渝 0105 执 201 号" },
        { data_source: "行内核心系统", update_time: "2026-04-29 07:00", credibility: "高", content: "对公账户 6222****9012 于 2026-04-15 被重庆市第五中级人民法院冻结；账户 6222****3456 于 2026-04-22 被冻结；贷款账户当前逾期 15 天，欠款本息 23.5 万元" },
        { data_source: "车管所车辆登记系统", update_time: "2026-04-28", credibility: "高", content: "名下 12 辆营运货车中 4 辆（车牌渝A·XXXX1~4）被查封，查封日期 2026-04-20" },
      ],
      disposition_suggestions: [
        { action: "启动法律催收程序", sla: "4 小时", responsible_person: "法务合规部", materials: ["贷款合同", "抵押/担保文件", "执行裁定书"] },
        { action: "评估资产保全方案", sla: "24 小时", responsible_person: "风险经理 RM001", materials: ["企业资产清单", "应收账款明细", "车辆登记信息"] },
        { action: "上报风险处置委员会", sla: "48 小时", responsible_person: "贷后管理岗", materials: ["完整风险评估报告", "处置方案建议"] },
      ],
      assessment_time: "2026-04-29T06:30:00+08:00",
    },
  },

  // 207: 设备指纹重复 · 团伙共债嫌疑 (HIGH)
  207: {
    id: 507, enterprise_id: 207, overall_risk: "HIGH", assessment_time: "2026-04-29T08:00:00+08:00",
    assessment_data: {
      company_name: "重庆鑫旺餐饮管理有限公司", overall_risk: "HIGH" as const,
      dimensions: {
        financial_risk: { level: "HIGH" as const, score: 71.0, key_findings: ["同设备下关联 5 家餐饮企业，总授信 1,200 万元", "2 家关联企业已出现 30 天以上逾期"], evidence: ["设备指纹系统", "贷款台账"] },
        operational_risk: { level: "MEDIUM" as const, score: 63.0, key_findings: ["5 家关联企业注册地址集中在同一园区 3 层", "各企业申报经营数据高度相似（菜单、人均消费、座位数）"], evidence: ["工商登记", "现场调查报告"] },
        compliance_risk: { level: "HIGH" as const, score: 75.0, key_findings: ["2 家关联企业法人互为直系亲属", "申请材料模板化（经营计划书、财务报表格式一致）"], evidence: ["贷款申请档案", "企业信用报告"] },
        stability_risk: { level: "MEDIUM" as const, score: 58.0, key_findings: ["3 家企业近 6 月法人变更", "实际控制人为同一自然人"], evidence: ["工商变更记录", "穿透式股权图谱"] },
      },
      risk_categories: [
        { category: "团伙共债风险", level: "HIGH" as const, description: "多主体共享设备指纹与经营地址，疑似同一实控人控制多家企业套取贷款", evidence: "同设备 ID 下关联 5 家餐饮企业，注册地址集中在同一园区，总授信 1,200 万元", impact: "实际风险敞口远大于单一企业授信额度，一旦违约将形成连锁反应", suggestion: "将所有关联企业纳入同一风险组统一监控，冻结关联企业未用额度", response_time: "24 小时" },
        { category: "材料造假嫌疑", level: "HIGH" as const, description: "多家企业申请材料模板高度一致，经营数据缺乏差异化", evidence: "5 家企业经营计划书格式一致，财务报表科目结构相似度 >85%", impact: "授信审批依据的经营数据可能不真实，风险评估基础存在偏差", suggestion: "逐户现场核实实际经营情况，与申报材料比对差异", response_time: "3 个工作日" },
      ],
      evidence_chain: [
        { data_source: "设备指纹系统", update_time: "2026-04-29 07:00", credibility: "高", content: "设备 ID DEV-2024-A8B3 关联 5 家企业贷款申请记录：鑫旺餐饮（授信 300 万）、永鑫餐饮（授信 280 万）、旺鑫餐饮（授信 250 万）、鑫盛餐饮（授信 200 万）、鑫源餐饮（授信 170 万），合计 1,200 万元" },
        { data_source: "穿透式股权图谱", update_time: "2026-04-28", credibility: "高", content: "5 家企业法人分别为：李某一（2家）、李某二（1家）、王某一（1家）、王某二（1家）；实控人穿透为同一自然人张某，李某为非直系但互为亲属" },
        { data_source: "贷款台账", update_time: "2026-04-29", credibility: "高", content: "关联企业中永鑫餐饮已逾期 35 天（欠款 12.5 万），旺鑫餐饮已逾期 28 天（欠款 8.3 万）" },
      ],
      disposition_suggestions: [
        { action: "将所有关联企业纳入同一风险组", sla: "24 小时", responsible_person: "风险经理 RM003", materials: ["股权穿透报告", "关联企业授信明细"] },
        { action: "现场逐户核实经营真实性", sla: "5 个工作日", responsible_person: "贷后管理岗", materials: ["现场调查报告模板", "申报材料比对表"] },
      ],
      assessment_time: "2026-04-29T08:00:00+08:00",
    },
  },

  // 209: 贷款资金流入房地产领域 (CRITICAL)
  209: {
    id: 509, enterprise_id: 209, overall_risk: "CRITICAL", assessment_time: "2026-04-29T08:30:00+08:00",
    assessment_data: {
      company_name: "合川锦宏房地产开发有限公司", overall_risk: "CRITICAL" as const,
      dimensions: {
        financial_risk: { level: "CRITICAL" as const, score: 85.0, key_findings: ["惠快贷款 500 万元中 320 万元转入关联房地产公司账户", "资金转移发生在贷款发放后 T+2 日内"], evidence: ["对公账户流水", "转账凭证"] },
        compliance_risk: { level: "CRITICAL" as const, score: 90.0, key_findings: ["贷款资金用途与合同约定严重不符", "关联房地产公司为法人亲属控股"], evidence: ["贷款合同", "工商登记"] },
        operational_risk: { level: "HIGH" as const, score: 68.0, key_findings: ["原申报经营用途（建材批发）未见对应采购记录", "企业名下无仓库租赁记录"], evidence: ["进销存系统", "租赁合同"] },
        stability_risk: { level: "MEDIUM" as const, score: 55.0, key_findings: ["企业主营业务已事实上转向房地产", "受房地产调控政策影响经营不确定性高"], evidence: ["企业经营范围变更申请", "行业政策文件"] },
      },
      risk_categories: [
        { category: "资金挪用至房地产", level: "CRITICAL" as const, description: "惠快贷资金被转移至关联房地产公司，用途与贷款合同约定严重背离", evidence: "贷款发放后 T+2 日，320 万元从对公账户转入法人亲属控股的房地产公司账户", impact: "贷款资金进入房地产领域违反监管红线，银行面临合规处罚风险，且资金回收存在高度不确定性", suggestion: "立即冻结剩余授信额度，要求企业限期退回挪用资金，上报合规部门", response_time: "4 小时" },
        { category: "经营真实性风险", level: "HIGH" as const, description: "企业申报经营用途与实际经营活动不匹配，疑似壳公司", evidence: "申报建材批发经营但无仓库租赁记录、无对应采购流水", impact: "贷款主体可能为融资壳，实际经营活动不存在或已停止", suggestion: "现场核实经营场所与业务真实性，评估是否需提前终止授信", response_time: "24 小时" },
      ],
      evidence_chain: [
        { data_source: "核心银行系统-交易流水", update_time: "2026-04-29 08:00", credibility: "高", content: "2026-04-22 贷款发放 500 万元至对公账户 6222****5678；2026-04-24 转账 200 万元至XX房地产开发公司账户 6228****9012；2026-04-24 转账 120 万元至同一房地产公司账户 6228****3456；合计 320 万元" },
        { data_source: "工商登记系统", update_time: "2026-04-29", credibility: "高", content: "XX房地产开发公司法人王某，与锦宏公司法人李某为夫妻关系；锦宏公司经营范围变更申请中增加了'房地产经纪'项目（尚未获批）" },
        { data_source: "进销存/租赁合同核查", update_time: "2026-04-28", credibility: "中", content: "企业申报建材批发经营，但名下无仓库租赁合同，近 6 月无大额建材采购记录，对公账户无建材供应商付款记录" },
      ],
      disposition_suggestions: [
        { action: "冻结剩余授信额度并上报合规", sla: "4 小时", responsible_person: "合规管理部", materials: ["贷款合同", "资金流水凭证", "挪用资金明细"] },
        { action: "要求企业限期退回挪用资金", sla: "3 个工作日", responsible_person: "客户经理 RM001", materials: ["书面通知函", "退款账户信息"] },
        { action: "评估法律追偿方案", sla: "5 个工作日", responsible_person: "法务合规部", materials: ["贷款合同违约条款", "担保合同", "证据链完整报告"] },
      ],
      assessment_time: "2026-04-29T08:30:00+08:00",
    },
  },
};

/** 默认评估（用作无匹配 enterprise_id 时的兜底） */
export const mockRiskAssessmentDefault: RiskAssessment = mockRiskAssessments[201];

// ═══════════════════════════════════════════════════════════════
// Watchlist
// ═══════════════════════════════════════════════════════════════

export const mockPrecheck: WatchlistPrecheckResponse = {
  can_submit: true,
  mode: "low_cost",
  planned_count: 3,
  message: "预算充足，预计消耗 3 次 low_cost 评估额度",
};

export const mockBatchOnboard: BatchOnboardWatchlistResponse = {
  mode: "low_cost",
  total_submitted: 3,
  total_valid: 3,
  processed: 3,
  created_enterprises: 2,
  assessed: 3,
  alerts_triggered: 1,
  failures: [],
  results: [
    { company_name: "重庆市江北区新盛贸易有限公司", enterprise_id: 301, overall_risk: "LOW", assessment_mode: "low_cost", alert_triggered: false },
    { company_name: "渝北双龙制造有限公司", enterprise_id: 302, overall_risk: "MEDIUM", assessment_mode: "low_cost", alert_triggered: true, alert_level: "MEDIUM" },
    { company_name: "重庆高新科技有限公司", enterprise_id: 201, overall_risk: "HIGH", assessment_mode: "low_cost", escalated_to_full: true, alert_triggered: true, alert_level: "HIGH" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Feature Studio
// ═══════════════════════════════════════════════════════════════

export const mockFeatureStudio: PostLoanFeatureStudioResponse = {
  scenario: "post_loan",
  overview_cards: [
    { label: "特征总数", value: 972, subtitle: "8 大变量域 · 含衍生特征 486 个" },
    { label: "PSI 超标特征", value: 23, subtitle: "阈值 0.25", warn: true },
    { label: "数据源", value: 8, subtitle: "客户/贷款/还款/信用卡/资产负债/交易/征信/三方" },
    { label: "本月新增", value: 14, subtitle: "司法/图谱类居多" },
  ],
  psi_by_product: [
    { feature: "近3月多头查询次数", biz_psi: 0.08, tax_psi: 0.12, note: "正常" },
    { feature: "对公账户月均流入", biz_psi: 0.31, tax_psi: 0.18, note: "惠快贷 PSI 超标" },
    { feature: "社保缴纳人数", biz_psi: 0.22, tax_psi: 0.09, note: "接近阈值" },
    { feature: "被执行/限高标识", biz_psi: 0.05, tax_psi: 0.06, note: "正常" },
    { feature: "纳税申报收入环比", biz_psi: 0.15, tax_psi: 0.42, note: "税易贷 PSI 超标" },
    { feature: "近6月贷款申请次数", biz_psi: 0.11, tax_psi: 0.28, note: "税易贷超标" },
    { feature: "对公账户月均流出", biz_psi: 0.26, tax_psi: 0.14, note: "惠快贷超标" },
    { feature: "法人征信查询次数", biz_psi: 0.09, tax_psi: 0.07, note: "正常" },
    { feature: "水电能耗环比变化", biz_psi: 0.19, tax_psi: 0.11, note: "正常" },
    { feature: "关联企业担保余额", biz_psi: 0.33, tax_psi: 0.21, note: "惠快贷 PSI 超标" },
    { feature: "工商变更频率", biz_psi: 0.12, tax_psi: 0.08, note: "正常" },
  ],
  features: [
    // ═══ 客户域 ═══
    { id: "F-001", name: "企业成立年限", domain: "客户", category: "基础信息", value_type: "int", source: "ECIF 客户主档", data_layer: "DWD", source_table: "dwd_ecif_customer", calculation_logic: "YEAR(CURRENT_DATE) - YEAR(established_date)", refresh_freq: "实时", owner_dept: "大数据部", psi_biz_loan: 0.06, psi_tax_easy_loan: 0.08, drift_status: "normal" },
    { id: "F-002", name: "注册资本实缴比例", domain: "客户", category: "基础信息", value_type: "float", source: "工商数据", data_layer: "ODS", source_table: "ods_qcc_company_info", calculation_logic: "paid_in_capital / registered_capital", refresh_freq: "月更", owner_dept: "大数据部", psi_biz_loan: 0.09, psi_tax_easy_loan: 0.11, drift_status: "normal" },
    { id: "F-003", name: "企业行业分类代码", domain: "客户", category: "基础信息", value_type: "string", source: "ECIF 客户主档", data_layer: "DWD", source_table: "dwd_ecif_customer", calculation_logic: "industry_code", refresh_freq: "实时", owner_dept: "大数据部", psi_biz_loan: 0.04, psi_tax_easy_loan: 0.05, drift_status: "normal" },
    { id: "F-004", name: "企业规模标签", domain: "客户", category: "基础信息", value_type: "string", source: "ECIF 客户主档", data_layer: "DWD", source_table: "dwd_ecif_customer", calculation_logic: "CASE WHEN employee_count < 50 THEN '小微' WHEN employee_count < 200 THEN '中型' ELSE '大型' END", refresh_freq: "实时", owner_dept: "大数据部", psi_biz_loan: 0.03, psi_tax_easy_loan: 0.04, drift_status: "normal" },
    { id: "F-005", name: "法人性别/年龄", domain: "客户", category: "法定代表人", value_type: "string", source: "ECIF 客户主档", data_layer: "DWD", source_table: "dwd_ecif_customer", calculation_logic: "legal_person_gender, legal_person_age", refresh_freq: "实时", owner_dept: "大数据部", psi_biz_loan: 0.02, psi_tax_easy_loan: 0.03, drift_status: "normal" },
    // ═══ 贷款域 ═══
    { id: "F-006", name: "贷款余额", domain: "贷款", category: "贷款状态", value_type: "float", source: "新信贷系统", data_layer: "DWD", source_table: "dwd_loan_account", calculation_logic: "current_balance", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.12, psi_tax_easy_loan: 0.15, drift_status: "normal" },
    { id: "F-007", name: "贷款期限（月）", domain: "贷款", category: "贷款属性", value_type: "int", source: "新信贷系统", data_layer: "DWD", source_table: "dwd_loan_contract", calculation_logic: "loan_term_months", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.05, psi_tax_easy_loan: 0.07, drift_status: "normal" },
    { id: "F-008", name: "贷款利率", domain: "贷款", category: "贷款属性", value_type: "float", source: "新信贷系统", data_layer: "DWD", source_table: "dwd_loan_contract", calculation_logic: "interest_rate", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.04, psi_tax_easy_loan: 0.06, drift_status: "normal" },
    { id: "F-009", name: "担保方式", domain: "贷款", category: "贷款属性", value_type: "string", source: "新信贷系统", data_layer: "DWD", source_table: "dwd_loan_contract", calculation_logic: "guarantee_type", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.08, psi_tax_easy_loan: 0.10, drift_status: "normal" },
    { id: "F-010", name: "贷款产品类型", domain: "贷款", category: "贷款属性", value_type: "string", source: "新信贷系统", data_layer: "DWD", source_table: "dwd_loan_contract", calculation_logic: "product_code", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.11, psi_tax_easy_loan: 0.13, drift_status: "normal" },
    // ═══ 还款域 ═══
    { id: "F-011", name: "近6月还款覆盖率", domain: "还款", category: "还款行为", value_type: "float", source: "核心还款流水", data_layer: "DWS", source_table: "dws_repayment_summary", calculation_logic: "SUM(repay_amount) / SUM(due_amount) WHERE months <= 6", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.18, psi_tax_easy_loan: 0.22, drift_status: "normal" },
    { id: "F-012", name: "近3月逾期天数", domain: "还款", category: "还款行为", value_type: "int", source: "核心还款流水", data_layer: "DWS", source_table: "dws_repayment_summary", calculation_logic: "MAX(overdue_days) WHERE months <= 3", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.24, psi_tax_easy_loan: 0.19, drift_status: "normal" },
    { id: "F-013", name: "还款方式变更次数", domain: "还款", category: "还款行为", value_type: "int", source: "核心还款流水", data_layer: "DWD", source_table: "dwd_repayment_flow", calculation_logic: "COUNT(DISTINCT repay_method) WHERE months <= 12", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.07, psi_tax_easy_loan: 0.09, drift_status: "normal" },
    { id: "F-014", name: "提前还款率", domain: "还款", category: "还款行为", value_type: "float", source: "核心还款流水", data_layer: "DWS", source_table: "dws_repayment_summary", calculation_logic: "COUNT(prepayment) / COUNT(*) WHERE months <= 6", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.15, psi_tax_easy_loan: 0.13, drift_status: "normal" },
    { id: "F-015", name: "承诺履约率", domain: "还款", category: "还款行为", value_type: "float", source: "核心还款流水", data_layer: "DWS", source_table: "dws_repayment_summary", calculation_logic: "COUNT(promise_fulfilled) / COUNT(promise_made) WHERE months <= 3", refresh_freq: "实时", owner_dept: "信贷管理部", psi_biz_loan: 0.19, psi_tax_easy_loan: 0.16, drift_status: "normal" },
    // ═══ 信用卡域 ═══
    { id: "F-016", name: "信用卡额度使用率", domain: "信用卡", category: "额度使用", value_type: "float", source: "信用卡账单", data_layer: "DWD", source_table: "dwd_credit_card_bill", calculation_logic: "used_amount / credit_limit", refresh_freq: "T+1", owner_dept: "信用卡中心", psi_biz_loan: 0.14, psi_tax_easy_loan: 0.17, drift_status: "normal" },
    { id: "F-017", name: "近6月最低还款额占比", domain: "信用卡", category: "还款习惯", value_type: "float", source: "信用卡账单", data_layer: "DWS", source_table: "dws_credit_card_summary", calculation_logic: "COUNT(repay_amount = min_payment) / COUNT(*) WHERE months <= 6", refresh_freq: "T+1", owner_dept: "信用卡中心", psi_biz_loan: 0.21, psi_tax_easy_loan: 0.25, drift_status: "normal" },
    { id: "F-018", name: "信用卡账单金额环比", domain: "信用卡", category: "消费行为", value_type: "float", source: "信用卡账单", data_layer: "DWD", source_table: "dwd_credit_card_bill", calculation_logic: "(current_month_bill - last_month_bill) / last_month_bill", refresh_freq: "T+1", owner_dept: "信用卡中心", psi_biz_loan: 0.12, psi_tax_easy_loan: 0.15, drift_status: "normal" },
    // ═══ 资产负债域 ═══
    { id: "F-019", name: "对公存款余额", domain: "资产负债", category: "存款", value_type: "float", source: "核心存款系统", data_layer: "DWD", source_table: "dwd_corp_deposit", calculation_logic: "current_balance", refresh_freq: "T+1", owner_dept: "公司金融部", psi_biz_loan: 0.09, psi_tax_easy_loan: 0.12, drift_status: "normal" },
    { id: "F-020", name: "理财持仓余额", domain: "资产负债", category: "理财", value_type: "float", source: "理财系统", data_layer: "DWD", source_table: "dwd_wealth_management", calculation_logic: "current_balance", refresh_freq: "T+1", owner_dept: "资产管理部", psi_biz_loan: 0.06, psi_tax_easy_loan: 0.08, drift_status: "normal" },
    { id: "F-021", name: "资产负债比", domain: "资产负债", category: "财务指标", value_type: "float", source: "财报系统", data_layer: "DWS", source_table: "dws_financial_summary", calculation_logic: "total_liabilities / total_assets", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.16, psi_tax_easy_loan: 0.19, drift_status: "normal" },
    { id: "F-022", name: "流动比率", domain: "资产负债", category: "财务指标", value_type: "float", source: "财报系统", data_layer: "DWS", source_table: "dws_financial_summary", calculation_logic: "current_assets / current_liabilities", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.13, psi_tax_easy_loan: 0.16, drift_status: "normal" },
    // ═══ 交易域 ═══
    { id: "F-023", name: "对公账户月均流入金额", domain: "交易", category: "资金流", value_type: "float", source: "对公交易流水", data_layer: "DWS", source_table: "dws_corp_transaction_summary", calculation_logic: "AVG(monthly_inflow) WHERE months <= 6", refresh_freq: "实时", owner_dept: "交易银行部", psi_biz_loan: 0.31, psi_tax_easy_loan: 0.18, drift_status: "warning" },
    { id: "F-024", name: "对公账户月均流出金额", domain: "交易", category: "资金流", value_type: "float", source: "对公交易流水", data_layer: "DWS", source_table: "dws_corp_transaction_summary", calculation_logic: "AVG(monthly_outflow) WHERE months <= 6", refresh_freq: "实时", owner_dept: "交易银行部", psi_biz_loan: 0.26, psi_tax_easy_loan: 0.14, drift_status: "warning" },
    { id: "F-025", name: "交易对手集中度", domain: "交易", category: "交易行为", value_type: "float", source: "对公交易流水", data_layer: "DWS", source_table: "dws_corp_transaction_summary", calculation_logic: "TOP1_counterparty_amount / total_amount", refresh_freq: "实时", owner_dept: "交易银行部", psi_biz_loan: 0.17, psi_tax_easy_loan: 0.20, drift_status: "normal" },
    { id: "F-026", name: "交易频率环比变化", domain: "交易", category: "交易行为", value_type: "float", source: "对公交易流水", data_layer: "DWD", source_table: "dwd_corp_transaction", calculation_logic: "(current_month_count - last_month_count) / last_month_count", refresh_freq: "实时", owner_dept: "交易银行部", psi_biz_loan: 0.11, psi_tax_easy_loan: 0.14, drift_status: "normal" },
    { id: "F-027", name: "资金流向房地产标识", domain: "交易", category: "资金流向", value_type: "bool", source: "对公交易流水", data_layer: "DWD", source_table: "dwd_corp_transaction", calculation_logic: "EXISTS(to_account IN real_estate_accounts)", refresh_freq: "实时", owner_dept: "交易银行部", psi_biz_loan: 0.28, psi_tax_easy_loan: 0.23, drift_status: "warning" },
    // ═══ 征信域 ═══
    { id: "F-028", name: "近3月多头查询次数", domain: "征信", category: "多头借贷", value_type: "int", source: "人行征信", data_layer: "ODS", source_table: "ods_pboc_credit", calculation_logic: "COUNT(query_type = 'loan') WHERE months <= 3", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.08, psi_tax_easy_loan: 0.12, drift_status: "normal" },
    { id: "F-029", name: "近6月贷款申请机构数", domain: "征信", category: "多头借贷", value_type: "int", source: "人行征信", data_layer: "ODS", source_table: "ods_pboc_credit", calculation_logic: "COUNT(DISTINCT lender) WHERE months <= 6", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.11, psi_tax_easy_loan: 0.28, drift_status: "warning" },
    { id: "F-030", name: "对外担保余额", domain: "征信", category: "担保", value_type: "float", source: "人行征信", data_layer: "ODS", source_table: "ods_pboc_credit", calculation_logic: "SUM(guarantee_amount)", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.15, psi_tax_easy_loan: 0.18, drift_status: "normal" },
    { id: "F-031", name: "历史逾期次数", domain: "征信", category: "信用历史", value_type: "int", source: "人行征信", data_layer: "ODS", source_table: "ods_pboc_credit", calculation_logic: "COUNT(overdue_record)", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.19, psi_tax_easy_loan: 0.22, drift_status: "normal" },
    { id: "F-032", name: "法人征信近1月查询次数", domain: "征信", category: "法定代表人", value_type: "int", source: "人行征信", data_layer: "ODS", source_table: "ods_pboc_credit", calculation_logic: "COUNT(query) WHERE months <= 1", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.09, psi_tax_easy_loan: 0.07, drift_status: "normal" },
    // ═══ 三方域 ═══
    { id: "F-033", name: "被执行/限高标识", domain: "三方", category: "司法", value_type: "bool", source: "外部司法", data_layer: "ODS", source_table: "ods_court_enforcement", calculation_logic: "EXISTS(enforcement_record)", refresh_freq: "T+1", owner_dept: "风险管理部", psi_biz_loan: 0.05, psi_tax_easy_loan: 0.06, drift_status: "normal" },
    { id: "F-034", name: "纳税申报收入环比变化率", domain: "三方", category: "税务", value_type: "float", source: "金税三期", data_layer: "ODS", source_table: "ods_tax_declaration", calculation_logic: "(current_income - last_income) / last_income", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.15, psi_tax_easy_loan: 0.42, drift_status: "warning" },
    { id: "F-035", name: "工商变更次数（近12月）", domain: "三方", category: "工商", value_type: "int", source: "工商数据", data_layer: "ODS", source_table: "ods_qcc_company_change", calculation_logic: "COUNT(change_record) WHERE months <= 12", refresh_freq: "T+1", owner_dept: "大数据部", psi_biz_loan: 0.12, psi_tax_easy_loan: 0.08, drift_status: "normal" },
    { id: "F-036", name: "社保缴纳人数", domain: "三方", category: "经营验证", value_type: "int", source: "社保局", data_layer: "ODS", source_table: "ods_social_insurance", calculation_logic: "current_insured_count", refresh_freq: "月更", owner_dept: "大数据部", psi_biz_loan: 0.22, psi_tax_easy_loan: 0.09, drift_status: "normal" },
    { id: "F-037", name: "水电能耗环比变化率", domain: "三方", category: "经营验证", value_type: "float", source: "电力/水务", data_layer: "ODS", source_table: "ods_utility_bill", calculation_logic: "(current_usage - last_usage) / last_usage", refresh_freq: "月更", owner_dept: "大数据部", psi_biz_loan: 0.19, psi_tax_easy_loan: 0.11, drift_status: "normal" },
    { id: "F-038", name: "关联企业担保余额合计", domain: "三方", category: "担保关系", value_type: "float", source: "行内核心", data_layer: "DWD", source_table: "dwd_related_guarantee", calculation_logic: "SUM(related_party_guarantee)", refresh_freq: "实时", owner_dept: "风险管理部", psi_biz_loan: 0.33, psi_tax_easy_loan: 0.21, drift_status: "warning" },
    { id: "F-039", name: "设备指纹关联企业数", domain: "三方", category: "图谱", value_type: "int", source: "设备指纹系统", data_layer: "DWD", source_table: "dwd_device_fingerprint", calculation_logic: "COUNT(DISTINCT related_company)", refresh_freq: "实时", owner_dept: "大数据部", psi_biz_loan: 0.29, psi_tax_easy_loan: 0.22, drift_status: "warning" },
    { id: "F-040", name: "贷款用途一致性评分", domain: "三方", category: "资金流", value_type: "float", source: "模型产出", data_layer: "ADS", source_table: "ads_model_output", calculation_logic: "ml_model_score('loan_purpose_consistency')", refresh_freq: "实时", owner_dept: "风险管理部", psi_biz_loan: 0.15, psi_tax_easy_loan: 0.19, drift_status: "normal" },
    { id: "F-041", name: "应收账款周转天数", domain: "三方", category: "财务", value_type: "float", source: "财报/税务", data_layer: "DWS", source_table: "dws_financial_summary", calculation_logic: "365 / (revenue / avg_accounts_receivable)", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.24, psi_tax_easy_loan: 0.17, drift_status: "normal" },
    { id: "F-042", name: "纳税信用等级", domain: "三方", category: "税务", value_type: "string", source: "金税三期", data_layer: "ODS", source_table: "ods_tax_credit", calculation_logic: "tax_credit_rating", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.07, psi_tax_easy_loan: 0.09, drift_status: "normal" },
    { id: "F-043", name: "经营异常名录标识", domain: "三方", category: "工商", value_type: "bool", source: "工商数据", data_layer: "ODS", source_table: "ods_qcc_abnormal", calculation_logic: "EXISTS(abnormal_operation_record)", refresh_freq: "T+1", owner_dept: "大数据部", psi_biz_loan: 0.13, psi_tax_easy_loan: 0.16, drift_status: "normal" },
    { id: "F-044", name: "环保处罚次数", domain: "三方", category: "合规", value_type: "int", source: "环保数据", data_layer: "ODS", source_table: "ods_environmental_penalty", calculation_logic: "COUNT(penalty_record)", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.06, psi_tax_easy_loan: 0.08, drift_status: "normal" },
    { id: "F-045", name: "行政处罚次数", domain: "三方", category: "合规", value_type: "int", source: "工商数据", data_layer: "ODS", source_table: "ods_administrative_penalty", calculation_logic: "COUNT(penalty_record)", refresh_freq: "T+1", owner_dept: "大数据部", psi_biz_loan: 0.10, psi_tax_easy_loan: 0.12, drift_status: "normal" },
    { id: "F-046", name: "欠税公告标识", domain: "三方", category: "税务", value_type: "bool", source: "金税三期", data_layer: "ODS", source_table: "ods_tax_arrears", calculation_logic: "EXISTS(tax_arrears_record)", refresh_freq: "月更", owner_dept: "风险管理部", psi_biz_loan: 0.14, psi_tax_easy_loan: 0.18, drift_status: "normal" },
    { id: "F-047", name: "终本案件标识", domain: "三方", category: "司法", value_type: "bool", source: "外部司法", data_layer: "ODS", source_table: "ods_final_case", calculation_logic: "EXISTS(final_case_record)", refresh_freq: "T+1", owner_dept: "风险管理部", psi_biz_loan: 0.16, psi_tax_easy_loan: 0.20, drift_status: "normal" },
    { id: "F-048", name: "股权冻结标识", domain: "三方", category: "司法", value_type: "bool", source: "外部司法", data_layer: "ODS", source_table: "ods_equity_freeze", calculation_logic: "EXISTS(equity_freeze_record)", refresh_freq: "T+1", owner_dept: "风险管理部", psi_biz_loan: 0.18, psi_tax_easy_loan: 0.21, drift_status: "normal" },
    { id: "F-049", name: "动产抵押标识", domain: "三方", category: "司法", value_type: "bool", source: "工商数据", data_layer: "ODS", source_table: "ods_chattel_mortgage", calculation_logic: "EXISTS(chattel_mortgage_record)", refresh_freq: "T+1", owner_dept: "大数据部", psi_biz_loan: 0.08, psi_tax_easy_loan: 0.10, drift_status: "normal" },
    { id: "F-050", name: "司法拍卖标识", domain: "三方", category: "司法", value_type: "bool", source: "外部司法", data_layer: "ODS", source_table: "ods_judicial_auction", calculation_logic: "EXISTS(judicial_auction_record)", refresh_freq: "T+1", owner_dept: "风险管理部", psi_biz_loan: 0.20, psi_tax_easy_loan: 0.24, drift_status: "normal" },
  ],
  psi_alarm_defaults: { enabled: true, threshold: 0.25 },
};

// ═══════════════════════════════════════════════════════════════
// Model Registry (策略与模型 — 模型版本库)
// ═══════════════════════════════════════════════════════════════

export interface MockModelVersion {
  id: string;
  name: string;
  version: string;
  role: "Champion" | "Challenger";
  stage: string;
  auc: number;
  ks: number;
  psi: number;
  recall: string;
  precision: string;
  owner: string;
  updatedAt: string;
  changelog: string;
}

export const mockModelVersions: MockModelVersion[] = [
  { id: "MDL-BIZ-002", name: "经营异常预警模型", version: "v2.3.1", role: "Champion", stage: "生效中", auc: 0.842, ks: 0.413, psi: 0.08, recall: "72.8%", precision: "68.4%", owner: "模型团队", updatedAt: "2026-04-28", changelog: "新增资金挪用特征 + 司法权重上调至 0.22" },
  { id: "MDL-BIZ-002", name: "经营异常预警模型", version: "v2.3.0", role: "Champion", stage: "已回滚", auc: 0.839, ks: 0.408, psi: 0.07, recall: "71.5%", precision: "67.1%", owner: "模型团队", updatedAt: "2026-04-15", changelog: "引入社保人数骤降信号，召回率提升 1.3ppt" },
  { id: "MDL-BIZ-001", name: "经营异常预警模型", version: "v2.2.0", role: "Challenger", stage: "灰度中", auc: 0.831, ks: 0.395, psi: 0.06, recall: "69.8%", precision: "66.2%", owner: "模型团队", updatedAt: "2026-04-12", changelog: "增加关联担保风险特征，AUC +0.012" },
  { id: "MDL-BIZ-003", name: "经营异常预警模型", version: "v2.1.0", role: "Challenger", stage: "候选", auc: 0.825, ks: 0.388, psi: 0.09, recall: "68.0%", precision: "64.5%", owner: "模型团队", updatedAt: "2026-03-28", changelog: "替换多头共债特征为图谱版本，特征缺失率降低" },
  { id: "MDL-TAX-003", name: "税报断档风险模型", version: "v1.7.4", role: "Champion", stage: "生效中", auc: 0.811, ks: 0.386, psi: 0.09, recall: "68.4%", precision: "63.8%", owner: "贷后策略", updatedAt: "2026-04-20", changelog: "调优断档天数阈值 45→30 天，触发量 +18%" },
  { id: "MDL-TAX-002", name: "税报断档风险模型", version: "v1.6.2", role: "Challenger", stage: "候选", auc: 0.804, ks: 0.379, psi: 0.11, recall: "66.9%", precision: "62.1%", owner: "贷后策略", updatedAt: "2026-04-05", changelog: "新增金税三期申报收入环比特征" },
  { id: "MDL-MULTI-001", name: "多头共债跳升模型", version: "v1.5.0", role: "Champion", stage: "生效中", auc: 0.798, ks: 0.361, psi: 0.07, recall: "64.9%", precision: "60.2%", owner: "风控建模", updatedAt: "2026-04-25", changelog: "制造业多头余额阈值调至 38%，误报下降 1ppt" },
  { id: "MDL-MULTI-002", name: "多头共债跳升模型", version: "v1.4.0", role: "Champion", stage: "已回滚", auc: 0.786, ks: 0.352, psi: 0.05, recall: "63.2%", precision: "58.7%", owner: "风控建模", updatedAt: "2026-03-15", changelog: "设备指纹特征 V1 引入，PSI 上升触发回滚" },
  { id: "MDL-CASH-001", name: "资金挪用识别模型", version: "v1.2.0", role: "Champion", stage: "生效中", auc: 0.862, ks: 0.445, psi: 0.05, recall: "78.1%", precision: "71.5%", owner: "模型团队", updatedAt: "2026-04-25", changelog: "对公回流检测 + 实控人账户关联图谱特征" },
  { id: "MDL-CASH-002", name: "资金挪用识别模型", version: "v1.1.0", role: "Challenger", stage: "灰度中", auc: 0.855, ks: 0.436, psi: 0.04, recall: "76.5%", precision: "70.2%", owner: "模型团队", updatedAt: "2026-04-10", changelog: "新增 T+3 时间窗口约束，降低行业周期性误报" },
];

// ═══════════════════════════════════════════════════════════════
// Data Dictionary
// ═══════════════════════════════════════════════════════════════

/**
 * 变量字典 · 抽样对齐评分卡建模口径（WOE 分箱 / IV 筛选，来自 8 大变量域）
 */
export const mockVariables: DataDictionaryVariableRow[] = [
  { id: "V-001", name: "multi_head_query_cnt_3m", cn_name: "近3月多头查询次数", var_type: "raw", source: "征信", source_code: "enterprise_credit", refresh: "月更", status: "active" },
  { id: "V-002", name: "corp_acct_monthly_inflow", cn_name: "对公账户月均流入金额", var_type: "raw", source: "交易行为域", source_code: "core", refresh: "实时", status: "active" },
  { id: "V-003", name: "executed_limited_high_flag", cn_name: "被执行/限高标识", var_type: "raw", source: "三方数据域", source_code: "court", refresh: "T+1", status: "active" },
  { id: "V-004", name: "tax_income_mom_change", cn_name: "纳税申报收入环比变化率", var_type: "derived", source: "三方数据域", source_code: "golden_tax_3", refresh: "月更", status: "active" },
  { id: "V-005", name: "fund_diversion_score", cn_name: "资金挪用评分", var_type: "model", source: "模型产出", source_code: "core", refresh: "实时", status: "active" },
  { id: "V-006", name: "social_insurance_mom_change", cn_name: "社保人数环比变化率", var_type: "derived", source: "三方数据域", source_code: "core", refresh: "月更", status: "draft" },
  { id: "V-007", name: "loan_dpd_bucket_woe", cn_name: "贷款逾期期数分箱 WOE 值", var_type: "derived", source: "贷款业务域", source_code: "core", refresh: "实时", status: "active" },
  { id: "V-008", name: "repay_ratio_6m_woe", cn_name: "近6月还款覆盖率分箱 WOE 值", var_type: "derived", source: "还款流水域", source_code: "core", refresh: "实时", status: "active" },
  { id: "V-009", name: "cc_utilization_woe", cn_name: "信用卡额度使用率分箱 WOE 值", var_type: "derived", source: "信用卡域", source_code: "core", refresh: "T+1", status: "active" },
  { id: "V-010", name: "asset_liab_ratio_woe", cn_name: "资产负债比分箱 WOE 值", var_type: "derived", source: "资产负债域", source_code: "core", refresh: "T+1", status: "active" },
];

/**
 * 风险数据集市 · 8 大变量域（对照《项目实施计划书》范围：客户/贷款/还款/信用卡/资产负债/交易/征信/三方）
 */
export const mockSources: DataDictionarySourceRow[] = [
  { id: "DS-001", name: "客户信息域 · ECIF 客户主档", category: "客户", refresh: "实时", connection_status: "connected", last_sync_at: "2026-04-29 10:00" },
  { id: "DS-002", name: "贷款业务域 · 新信贷系统借据", category: "贷款", refresh: "实时", connection_status: "connected", last_sync_at: "2026-04-29 10:00" },
  { id: "DS-003", name: "还款流水域 · 核心还款流水", category: "还款", refresh: "实时", connection_status: "connected", last_sync_at: "2026-04-29 10:00" },
  { id: "DS-004", name: "信用卡域 · 信用卡账单与额度", category: "信用卡", refresh: "T+1", connection_status: "connected", last_sync_at: "2026-04-29 06:00" },
  { id: "DS-005", name: "资产负债域 · 存贷汇与理财余额", category: "资产负债", refresh: "T+1", connection_status: "connected", last_sync_at: "2026-04-29 06:00" },
  { id: "DS-006", name: "交易行为域 · 对公交易流水（972 行变量清单）", category: "交易", refresh: "实时", connection_status: "connected", last_sync_at: "2026-04-29 10:00" },
  { id: "DS-007", name: "征信域 · 人行征信与多头借贷", category: "征信", refresh: "月更", connection_status: "connected", last_sync_at: "2026-04-25 08:00" },
  { id: "DS-008", name: "三方数据域 · 工商/司法/税务/企查查", category: "三方", refresh: "T+1", connection_status: "error", last_sync_at: "2026-03-31 23:00" },
];

// ═══════════════════════════════════════════════════════════════
// Tasks (首页任务列表，store/taskStore 使用)
// ═══════════════════════════════════════════════════════════════

export const mockTaskList: TaskListItem[] = [
  { task_id: "tsk_001", task_type: "analysis", status: "completed", title: "惠快贷资产质量归因分析", scenario_node: "post_loan", created_at: "2026-04-28T10:00:00+08:00", updated_at: "2026-04-28T11:30:00+08:00", priority: "P0", current_handler: "张明", progress_pct: 100 },
  { task_id: "tsk_002", task_type: "backtest", status: "running", title: "多头共债规则阈值回溯", scenario_node: "post_loan", created_at: "2026-04-29T08:00:00+08:00", updated_at: "2026-04-29T09:00:00+08:00", priority: "P1", current_handler: "李华", progress_pct: 65 },
  { task_id: "tsk_003", task_type: "strategy", status: "pending", title: "制造业预警规则包灰度发布", scenario_node: "post_loan", created_at: "2026-04-29T09:30:00+08:00", updated_at: "2026-04-29T09:30:00+08:00", priority: "P0", current_handler: "王芳", sla_due_at: "2026-04-30T18:00:00+08:00" },
  { task_id: "tsk_004", task_type: "inspection", status: "processing", title: "4月第4周处置记录抽检", scenario_node: "post_loan", created_at: "2026-04-28T14:00:00+08:00", updated_at: "2026-04-29T08:00:00+08:00", priority: "P2", current_handler: "质检组A", progress_pct: 48 },
];

export const mockTaskDetail: TaskDetail = {
  task: {
    task_id: "tsk_001",
    task_type: "analysis",
    status: "completed",
    title: "惠快贷资产质量归因分析",
    scenario_node: "post_loan",
    created_at: "2026-04-28T10:00:00+08:00",
    updated_at: "2026-04-28T11:30:00+08:00",
    description: "分析惠快贷产品线近 3 个月 NPL 率上升的驱动因子，按行业/区域/客户经理维度拆解",
  },
  events: [
    { id: 1, task_id: "tsk_001", event_type: "TASK_CREATED", payload: { title: "惠快贷资产质量归因分析" }, created_at: "2026-04-28T10:00:00+08:00" },
    { id: 2, task_id: "tsk_001", event_type: "TASK_RUNNING", payload: {}, created_at: "2026-04-28T10:01:00+08:00" },
    { id: 3, task_id: "tsk_001", event_type: "TASK_COMPLETED", payload: {}, created_at: "2026-04-28T11:30:00+08:00" },
  ],
};
