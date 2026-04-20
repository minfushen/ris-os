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

export interface PostLoanFeatureRow {
  id: string;
  name: string;
  category: string;
  value_type: string;
  source: string;
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
