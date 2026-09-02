/** 贷后场景 REST：`/api/scenario/post-loan/*`（及无前缀 `/scenario/post-loan/*`）响应类型，snake_case */

export type ScenarioPostLoanCode = "post_loan";

export interface PostLoanOverviewCard {
  label: string;
  value: number;
  subtitle: string;
  warn?: boolean;
}

export interface PostLoanPsiByProductRow {
  feature: string;
  biz_psi: number;
  tax_psi: number;
  note: string;
}

export type PostLoanDriftStatus = "normal" | "warning";

/** 数据分层（对齐数据仓库层级） */
export type DataLayer = "ODS" | "DWD" | "DWS" | "ADS";

/** 8 大变量域（对齐《项目实施计划书》数据体系） */
export type VariableDomain =
  | "客户"
  | "贷款"
  | "还款"
  | "信用卡"
  | "资产负债"
  | "交易"
  | "征信"
  | "三方";

export interface PostLoanFeatureRow {
  id: string;
  name: string;
  /** 变量域分类（对齐计划书 8 大变量域） */
  domain: VariableDomain;
  category: string;
  value_type: string;
  source: string;
  /** 数据分层（ODS/DWD/DWS/ADS） */
  data_layer?: DataLayer;
  /** 来源表名（字段映射） */
  source_table?: string;
  /** 计算逻辑（SQL 伪代码或规则描述） */
  calculation_logic?: string;
  /** 更新频率 */
  refresh_freq?: "实时" | "T+1" | "月更";
  /** 责任部门 */
  owner_dept?: string;
  psi_biz_loan: number;
  psi_tax_easy_loan: number;
  drift_status: PostLoanDriftStatus;
}

export interface PostLoanPsiAlarmDefaults {
  enabled: boolean;
  threshold: number;
}

export interface PostLoanFeatureStudioResponse {
  scenario: ScenarioPostLoanCode;
  overview_cards: PostLoanOverviewCard[];
  psi_by_product: PostLoanPsiByProductRow[];
  features: PostLoanFeatureRow[];
  psi_alarm_defaults: PostLoanPsiAlarmDefaults;
}

export type DataDictionaryVarType = "raw" | "derived" | "model";
export type DataDictionaryVarStatus = "active" | "draft";
export type DataDictionaryRefresh = "实时" | "T+1" | "月更" | "按需";
export type DataDictionarySourceCode =
  | "core"
  | "collection"
  | "enterprise_credit"
  | "court"
  | "golden_tax_3";

export interface DataDictionaryVariableRow {
  id: string;
  name: string;
  cn_name: string;
  var_type: DataDictionaryVarType;
  source: string;
  source_code: DataDictionarySourceCode | string;
  refresh: DataDictionaryRefresh | string;
  status: DataDictionaryVarStatus;
}

export type DataDictionaryConnectionStatus = "connected" | "error";

export interface DataDictionarySourceRow {
  id: string;
  name: string;
  category: string;
  refresh: DataDictionaryRefresh | string;
  connection_status: DataDictionaryConnectionStatus;
  last_sync_at: string;
}
