import { type NextRequest, NextResponse } from "next/server"
import { medicalConditions } from "../../assessment/route"

type ConditionKey = keyof typeof medicalConditions

// GET /api/conditions/[condition] - Get specific condition details
export async function GET(request: NextRequest, { params }: { params: { condition: string } }) {
  try {
    const condition = params.condition as ConditionKey

    if (!(condition in medicalConditions)) {
      return NextResponse.json({ error: "Condition not found" }, { status: 404 })
    }

    const conditionData = medicalConditions[condition]

    return NextResponse.json({
      id: condition,
      ...conditionData,
      symptomsCount: conditionData.symptoms.length,
      riskFactorsCount: conditionData.riskFactors.length,
    })
  } catch (error) {
    console.error("Get condition API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
