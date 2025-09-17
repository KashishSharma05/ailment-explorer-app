import { NextResponse } from "next/server"
import { getAllConditions, getCommonSymptoms } from "@/lib/medical-data"
import type { ApiResponse } from "@/lib/types"

// GET /api/conditions - Get all medical conditions
export async function GET() {
  try {
    const conditions = getAllConditions()
    const commonSymptoms = getCommonSymptoms()

    const response: ApiResponse<{
      conditions: typeof conditions
      commonSymptoms: string[]
      totalConditions: number
    }> = {
      success: true,
      data: {
        conditions,
        commonSymptoms,
        totalConditions: Object.keys(conditions).length,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get conditions API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to get medical conditions",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
