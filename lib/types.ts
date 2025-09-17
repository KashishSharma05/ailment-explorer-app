// Core data types for the medical assessment system

export type ConditionKey =
  | "mesothelioma"
  | "chronickidneydisease"
  | "coronaryheartdisease"
  | "diabetesmelitus"
  | "livercirrhosis"

export type RiskLevel = "low" | "moderate" | "high"

export interface MedicalCondition {
  name: string
  description: string
  symptoms: string[]
  riskFactors: string[]
}

export interface UserInfo {
  age?: number
  gender?: "male" | "female" | "other"
  medicalHistory?: string[]
  currentMedications?: string[]
  allergies?: string[]
}

export interface AssessmentRequest {
  condition: ConditionKey
  symptoms: string[]
  riskFactors?: string[]
  userInfo?: UserInfo
  sessionId?: string
}

export interface AssessmentResult {
  id: string
  condition: ConditionKey
  conditionName: string
  score: number
  risk: RiskLevel
  matches: number
  totalSymptoms: number
  selectedSymptoms: string[]
  riskFactorScore?: number
  recommendations: string[]
  timestamp: string
  sessionId?: string
  userInfo?: UserInfo
}

export interface UserSession {
  id: string
  createdAt: string
  lastActivity: string
  assessments: AssessmentResult[]
  userAgent?: string
  ipAddress?: string
}

export interface AssessmentHistory {
  sessionId: string
  assessments: AssessmentResult[]
  totalAssessments: number
  lastAssessment: string
  riskTrends: {
    condition: ConditionKey
    assessments: Array<{
      timestamp: string
      risk: RiskLevel
      score: number
    }>
  }[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  services: {
    api: "operational" | "degraded" | "down"
    database: "operational" | "degraded" | "down"
    cache?: "operational" | "degraded" | "down"
  }
  uptime?: number
}
