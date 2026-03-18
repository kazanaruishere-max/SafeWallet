// === API Response Types ===

export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    total?: number;
    remaining_quota?: number;
    new_badges?: string[];
    needs_education_lock?: boolean;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResult<T> = ApiResponse<T> | ApiError;

// === Error Codes ===
export const ERROR_CODES = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  AUTH_INVALID: "AUTH_INVALID",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  OCR_FAILED: "OCR_FAILED",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// === Scan Types ===
export type ScanResult = {
  scan_id: string;
  health_score: number;
  categories: Record<string, number>;
  debt_to_income_ratio: number;
  savings_rate: number;
  recommendations: string[];
  warnings: string[];
  processing_time_ms: number;
  blockchain_tx_id?: string;
  blockchain_hash?: string;
};

export type ScanHistoryItem = {
  id: string; // Changed from scan_id to match actual DB result
  health_score: number;
  created_at: string;
  categories: Record<string, number>;
  recommendations: string[];
  blockchain_tx_id?: string;
};

// === Scam Check Types ===
export type ScamCheckResult = {
  check_id: string;
  risk_score: number;
  confidence: "low" | "medium" | "high";
  verdict: "SAFE" | "CAUTION" | "HIGH_RISK";
  ojk_status: {
    registered: boolean;
    checked_at: string;
  };
  red_flags: Array<{
    type: string;
    detail: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  safe_alternatives: Array<{
    name: string;
    return: string;
    risk: string;
  }>;
};

// === Dashboard Types ===
export type DashboardData = {
  user: {
    email: string;
    subscription: string;
    member_since: string;
  };
  latest_scan: { 
    health_score: number; 
    date: string;
    debt_to_income_ratio?: number;
    savings_rate?: number;
  } | null;
  scan_trend: number[];
  scam_checks_count: number;
  badges: Array<{
    type: string;
    name: string;
    earned_at: string;
  }>;
  quota: {
    scans: { used: number; limit: number };
    scam_checks: { used: number; limit: number };
  };
};

// === Request Types ===
export type ScanRequest = {
  image: File;
  bank_hint?: string;
  monthly_income?: number;
};

export type ScamCheckRequest = {
  input_type: "text" | "url" | "screenshot";
  content: string;
  company_name?: string;
};
