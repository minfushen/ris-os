/**
 * 归因 Agent 类型定义 — 对应后端 POST /api/agents/attribution
 */

export interface AttributionFactor {
  name: string;
  weight: number;
  note: string;
}

export interface AttributionEvidence {
  data_source: string;
  content: string;
}

export interface AttributionResult {
  company_name: string;
  credit_code?: string;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  risk_level_text: string;
  conclusion: string;
  confidence: number;
  stats: {
    total_writs: number;
    execution_cases: number;
    executed_total: number;
    dishonest_total: number;
  };
  factors: AttributionFactor[];
  suggestions: string[];
  evidence_chain: AttributionEvidence[];
}

export const ATTRIBUTION_LEVEL_COLORS: Record<string, string> = {
  CRITICAL: "#b91c1c",
  HIGH: "#ea580c",
  MEDIUM: "#d97706",
  LOW: "#52c41a",
};
