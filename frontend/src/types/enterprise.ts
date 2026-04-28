/**
 * 企业数据中心相关类型定义
 */

// 企业档案
export interface Enterprise {
  id: number;
  company_name: string;
  credit_code?: string;
  legal_person?: string;
  registered_capital?: string;
  established_date?: string;
  registration_status?: string;
  business_scope?: string;
  registered_address?: string;
  created_at: string;
  updated_at: string;
}

// 风险评估记录
export interface RiskAssessment {
  id: number;
  enterprise_id: number;
  overall_risk: string;
  assessment_data: any; // VendorRiskAssessment
  assessment_time: string;
}

// 预警记录
export interface Alert {
  id: number;
  enterprise_id: number;
  alert_type: string;
  alert_level: string;
  alert_source?: string;
  alert_status: string;
  triggered_at: string;
  resolved_at?: string;
  // 关联字段
  company_name?: string;
  credit_code?: string;
}

export interface OverdueLoanAlertCandidate {
  loan_id: number;
  enterprise_id: number;
  company_name: string;
  credit_code?: string;
  loan_account_no?: string;
  loan_amount?: number;
  loan_balance?: number;
  loan_status?: string;
  manager_id?: string;
  updated_at?: string;
}

// 大盘统计
export interface DashboardStats {
  total_enterprises: number;
  risk_distribution: Record<string, number>;
  pending_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  high_risk_enterprises: number;
  on_loan_enterprises?: number;
  on_loan_amount?: number;
  on_loan_balance?: number;
  normal_loan_balance?: number;
  watch_loan_balance?: number;
  normal_loan_count?: number;
  watch_loan_count?: number;
  loan_status_distribution?: Array<{
    loan_status?: string;
    loan_count: number;
    loan_balance: number;
  }>;
  top_loan_exposures?: Array<{
    company_name: string;
    industry_category?: string;
    loan_account_no?: string;
    loan_balance?: number;
    loan_status?: string;
    manager_id?: string;
  }>;
  manager_asset_distribution?: Array<{
    manager_id: string;
    manager_name?: string;
    loan_count: number;
    enterprise_count: number;
    total_loan_balance: number;
    watch_loan_count: number;
    high_risk_enterprises: number;
  }>;
  manager_trends?: Array<{
    manager_id: string;
    manager_name: string;
    new_alerts_7d: number;
    resolved_alerts_7d: number;
    active_alerts: number;
    alert_delta_7d: number;
    disposal_rate_7d: number;
  }>;
}

// 评估企业风险响应
export interface AssessEnterpriseRiskResponse {
  assessment: any; // VendorRiskAssessment
  alert?: Alert;
}

export interface BatchOnboardResultItem {
  company_name: string;
  enterprise_id: number;
  overall_risk: string;
  assessment_mode?: "low_cost" | "full";
  escalated_to_full?: boolean;
  alert_triggered: boolean;
  alert_level?: string | null;
}

export interface BatchOnboardFailureItem {
  company_name: string;
  error: string;
}

export interface BatchOnboardWatchlistResponse {
  mode?: "low_cost" | "full";
  total_submitted: number;
  total_valid: number;
  processed: number;
  created_enterprises: number;
  assessed: number;
  escalated_to_full?: number;
  alerts_triggered: number;
  failures: BatchOnboardFailureItem[];
  results: BatchOnboardResultItem[];
}

export interface WatchlistPrecheckResponse {
  can_submit: boolean;
  mode: "low_cost" | "full";
  planned_count: number;
  message: string;
}
