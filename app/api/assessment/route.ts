import { type NextRequest, NextResponse } from "next/server"

// Medical conditions data (moved from frontend)
export const medicalConditions = {
  mesothelioma: {
    name: "Mesothelioma",
    description: "Cancer affecting the lining of lungs, abdomen, or heart",
    symptoms: [
      "Chest pain",
      "Shortness of breath",
      "Persistent cough",
      "Fatigue",
      "Weight loss",
      "Abdominal pain",
      "Abdominal swelling",
      "Difficulty swallowing",
      "Hoarse voice",
      "Night sweats",
    ],
    riskFactors: ["Asbestos exposure", "Age over 65", "Male gender", "Radiation exposure"],
  },
  chronickidneydisease: {
    name: "Chronic Kidney Disease",
    description: "Gradual loss of kidney function over time",
    symptoms: [
      "Fatigue",
      "Swelling in legs/feet",
      "Frequent urination",
      "Blood in urine",
      "Foamy urine",
      "High blood pressure",
      "Nausea",
      "Loss of appetite",
      "Muscle cramps",
      "Itchy skin",
    ],
    riskFactors: ["Diabetes", "High blood pressure", "Family history", "Age over 60"],
  },
  coronaryheartdisease: {
    name: "Coronary Heart Disease",
    description: "Narrowed or blocked coronary arteries",
    symptoms: [
      "Chest pain",
      "Chest pressure",
      "Shortness of breath",
      "Fatigue",
      "Heart palpitations",
      "Dizziness",
      "Nausea",
      "Cold sweats",
      "Pain in arms/shoulders",
      "Jaw pain",
    ],
    riskFactors: ["High cholesterol", "High blood pressure", "Smoking", "Diabetes"],
  },
  diabetesmelitus: {
    name: "Diabetes Mellitus",
    description: "High blood sugar due to insulin problems",
    symptoms: [
      "Frequent urination",
      "Excessive thirst",
      "Increased hunger",
      "Fatigue",
      "Blurred vision",
      "Slow healing wounds",
      "Frequent infections",
      "Weight loss",
      "Tingling in hands/feet",
      "Dry mouth",
    ],
    riskFactors: ["Family history", "Obesity", "Age over 45", "Sedentary lifestyle"],
  },
  livercirrhosis: {
    name: "Liver Cirrhosis",
    description: "Scarring and damage to the liver",
    symptoms: [
      "Fatigue",
      "Abdominal pain",
      "Abdominal swelling",
      "Jaundice",
      "Nausea",
      "Loss of appetite",
      "Weight loss",
      "Swelling in legs",
      "Easy bruising",
      "Dark urine",
      "Pale stools",
      "Confusion",
    ],
    riskFactors: ["Alcohol abuse", "Hepatitis B/C", "Fatty liver disease", "Autoimmune diseases"],
  },
}

type ConditionKey = keyof typeof medicalConditions

interface AssessmentRequest {
  condition: ConditionKey
  symptoms: string[]
  riskFactors?: string[]
  userInfo?: {
    age?: number
    gender?: string
    medicalHistory?: string[]
  }
}

interface AssessmentResult {
  id: string
  condition: ConditionKey
  conditionName: string
  score: number
  risk: "low" | "moderate" | "high"
  matches: number
  totalSymptoms: number
  selectedSymptoms: string[]
  riskFactorScore?: number
  recommendations: string[]
  timestamp: string
}

// POST /api/assessment - Create new symptom assessment
export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json()

    // Validate request
    if (!body.condition || !body.symptoms || !Array.isArray(body.symptoms)) {
      return NextResponse.json({ error: "Invalid request. Condition and symptoms array required." }, { status: 400 })
    }

    if (!(body.condition in medicalConditions)) {
      return NextResponse.json({ error: "Invalid condition specified." }, { status: 400 })
    }

    const condition = medicalConditions[body.condition]

    // Calculate symptom matches
    const matches = body.symptoms.filter((symptom) => condition.symptoms.includes(symptom)).length

    const score = Math.round((matches / condition.symptoms.length) * 100)

    // Determine risk level
    let risk: "low" | "moderate" | "high" = "low"
    if (score >= 60) risk = "high"
    else if (score >= 30) risk = "moderate"

    // Calculate risk factor score if provided
    let riskFactorScore = 0
    if (body.riskFactors && body.riskFactors.length > 0) {
      const riskMatches = body.riskFactors.filter((factor) => condition.riskFactors.includes(factor)).length
      riskFactorScore = Math.round((riskMatches / condition.riskFactors.length) * 100)

      // Adjust overall risk based on risk factors
      if (riskFactorScore >= 50 && risk === "low") risk = "moderate"
      if (riskFactorScore >= 75 && risk === "moderate") risk = "high"
    }

    // Generate recommendations based on risk level
    const recommendations = generateRecommendations(risk, body.condition, score)

    // Create assessment result
    const result: AssessmentResult = {
      id: generateAssessmentId(),
      condition: body.condition,
      conditionName: condition.name,
      score,
      risk,
      matches,
      totalSymptoms: condition.symptoms.length,
      selectedSymptoms: body.symptoms,
      riskFactorScore,
      recommendations,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Assessment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/assessment - Get all conditions info
export async function GET() {
  try {
    return NextResponse.json({
      conditions: medicalConditions,
      totalConditions: Object.keys(medicalConditions).length,
    })
  } catch (error) {
    console.error("Get conditions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateRecommendations(risk: "low" | "moderate" | "high", condition: ConditionKey, score: number): string[] {
  const baseRecommendations = [
    "This assessment is for informational purposes only and should not replace professional medical advice.",
    "Consult with a healthcare provider for proper diagnosis and treatment.",
  ]

  if (risk === "high") {
    return [
      "⚠️ HIGH RISK: Seek immediate medical attention from a healthcare professional.",
      "Schedule an appointment with your doctor as soon as possible.",
      "Keep a detailed log of your symptoms and their severity.",
      ...baseRecommendations,
    ]
  } else if (risk === "moderate") {
    return [
      "⚠️ MODERATE RISK: Consider scheduling a medical consultation.",
      "Monitor your symptoms and note any changes or worsening.",
      "Maintain a healthy lifestyle and follow preventive measures.",
      ...baseRecommendations,
    ]
  } else {
    return [
      "✅ LOW RISK: Continue monitoring your health and symptoms.",
      "Maintain regular health check-ups and preventive care.",
      "Consider lifestyle modifications for better health outcomes.",
      ...baseRecommendations,
    ]
  }
}

function generateAssessmentId(): string {
  return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
