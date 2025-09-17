// Utility functions for assessment calculations and recommendations

import type { AssessmentResult, RiskLevel, ConditionKey } from "./types"
import { medicalConditions } from "./medical-data"

export function calculateAssessmentScore(
  condition: ConditionKey,
  selectedSymptoms: string[],
  riskFactors?: string[],
): {
  score: number
  risk: RiskLevel
  matches: number
  riskFactorScore: number
} {
  const conditionData = medicalConditions[condition]
  if (!conditionData) {
    throw new Error(`Invalid condition: ${condition}`)
  }

  // Calculate symptom matches
  const matches = selectedSymptoms.filter((symptom) => conditionData.symptoms.includes(symptom)).length

  const score = Math.round((matches / conditionData.symptoms.length) * 100)

  // Calculate risk factor score
  let riskFactorScore = 0
  if (riskFactors && riskFactors.length > 0) {
    const riskMatches = riskFactors.filter((factor) => conditionData.riskFactors.includes(factor)).length
    riskFactorScore = Math.round((riskMatches / conditionData.riskFactors.length) * 100)
  }

  // Determine risk level
  let risk: RiskLevel = "low"
  if (score >= 60) risk = "high"
  else if (score >= 30) risk = "moderate"

  // Adjust risk based on risk factors
  if (riskFactorScore >= 50 && risk === "low") risk = "moderate"
  if (riskFactorScore >= 75 && risk === "moderate") risk = "high"

  return { score, risk, matches, riskFactorScore }
}

export function generateRecommendations(risk: RiskLevel, condition: ConditionKey, score: number): string[] {
  const baseRecommendations = [
    "This assessment is for informational purposes only and should not replace professional medical advice.",
    "Consult with a healthcare provider for proper diagnosis and treatment.",
  ]

  const conditionSpecificRecommendations = getConditionSpecificRecommendations(condition, risk)

  if (risk === "high") {
    return [
      "⚠️ HIGH RISK: Seek immediate medical attention from a healthcare professional.",
      "Schedule an appointment with your doctor as soon as possible.",
      "Keep a detailed log of your symptoms and their severity.",
      ...conditionSpecificRecommendations,
      ...baseRecommendations,
    ]
  } else if (risk === "moderate") {
    return [
      "⚠️ MODERATE RISK: Consider scheduling a medical consultation.",
      "Monitor your symptoms and note any changes or worsening.",
      "Maintain a healthy lifestyle and follow preventive measures.",
      ...conditionSpecificRecommendations,
      ...baseRecommendations,
    ]
  } else {
    return [
      "✅ LOW RISK: Continue monitoring your health and symptoms.",
      "Maintain regular health check-ups and preventive care.",
      "Consider lifestyle modifications for better health outcomes.",
      ...conditionSpecificRecommendations,
      ...baseRecommendations,
    ]
  }
}

function getConditionSpecificRecommendations(condition: ConditionKey, risk: RiskLevel): string[] {
  const recommendations: Record<ConditionKey, Record<RiskLevel, string[]>> = {
    mesothelioma: {
      high: ["Consider chest imaging (X-ray or CT scan)", "Discuss asbestos exposure history with your doctor"],
      moderate: ["Monitor respiratory symptoms closely", "Avoid further asbestos exposure"],
      low: ["Maintain lung health with regular exercise", "Avoid smoking and secondhand smoke"],
    },
    chronickidneydisease: {
      high: ["Request kidney function tests (creatinine, BUN)", "Monitor blood pressure regularly"],
      moderate: ["Stay hydrated and limit sodium intake", "Monitor urination patterns"],
      low: ["Maintain healthy blood pressure", "Stay hydrated and eat a balanced diet"],
    },
    coronaryheartdisease: {
      high: ["Consider cardiac evaluation (ECG, stress test)", "Monitor chest pain episodes"],
      moderate: ["Adopt heart-healthy diet and exercise", "Monitor blood pressure and cholesterol"],
      low: ["Maintain regular cardiovascular exercise", "Follow a heart-healthy diet"],
    },
    diabetesmelitus: {
      high: ["Request blood glucose and HbA1c testing", "Monitor symptoms of high blood sugar"],
      moderate: ["Monitor blood sugar levels if possible", "Maintain healthy weight and diet"],
      low: ["Follow a balanced diet low in refined sugars", "Maintain regular physical activity"],
    },
    livercirrhosis: {
      high: ["Request liver function tests", "Avoid alcohol completely"],
      moderate: ["Limit alcohol consumption", "Monitor abdominal symptoms"],
      low: ["Maintain liver health with balanced diet", "Limit alcohol and avoid hepatotoxic substances"],
    },
  }

  return recommendations[condition]?.[risk] || []
}

export function formatAssessmentSummary(assessment: AssessmentResult): string {
  return `${assessment.conditionName} assessment completed with ${assessment.score}% symptom match (${assessment.risk} risk). ${assessment.matches} out of ${assessment.totalSymptoms} symptoms matched.`
}

export function getAssessmentInsights(assessments: AssessmentResult[]): {
  mostCommonCondition: ConditionKey | null
  averageRiskLevel: RiskLevel
  totalSymptoms: number
  riskTrend: "improving" | "worsening" | "stable"
} {
  if (assessments.length === 0) {
    return {
      mostCommonCondition: null,
      averageRiskLevel: "low",
      totalSymptoms: 0,
      riskTrend: "stable",
    }
  }

  // Find most common condition
  const conditionCounts: Record<ConditionKey, number> = {} as any
  assessments.forEach((assessment) => {
    conditionCounts[assessment.condition] = (conditionCounts[assessment.condition] || 0) + 1
  })

  const mostCommonCondition = Object.entries(conditionCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as ConditionKey

  // Calculate average risk level
  const riskScores = { low: 1, moderate: 2, high: 3 }
  const averageRiskScore =
    assessments.reduce((sum, assessment) => sum + riskScores[assessment.risk], 0) / assessments.length

  let averageRiskLevel: RiskLevel = "low"
  if (averageRiskScore >= 2.5) averageRiskLevel = "high"
  else if (averageRiskScore >= 1.5) averageRiskLevel = "moderate"

  // Calculate total unique symptoms
  const allSymptoms = new Set(assessments.flatMap((assessment) => assessment.selectedSymptoms))
  const totalSymptoms = allSymptoms.size

  // Determine risk trend (comparing first half to second half of assessments)
  let riskTrend: "improving" | "worsening" | "stable" = "stable"
  if (assessments.length >= 4) {
    const midpoint = Math.floor(assessments.length / 2)
    const firstHalf = assessments.slice(0, midpoint)
    const secondHalf = assessments.slice(midpoint)

    const firstHalfAvg = firstHalf.reduce((sum, a) => sum + riskScores[a.risk], 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, a) => sum + riskScores[a.risk], 0) / secondHalf.length

    if (secondHalfAvg > firstHalfAvg + 0.3) riskTrend = "worsening"
    else if (firstHalfAvg > secondHalfAvg + 0.3) riskTrend = "improving"
  }

  return {
    mostCommonCondition,
    averageRiskLevel,
    totalSymptoms,
    riskTrend,
  }
}
