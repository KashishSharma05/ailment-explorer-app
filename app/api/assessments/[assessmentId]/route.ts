import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { ApiResponse, AssessmentResult } from "@/lib/types"

// GET /api/assessments/[assessmentId] - Get specific assessment
export async function GET(request: NextRequest, { params }: { params: { assessmentId: string } }) {
  try {
    const assessment = storage.getAssessment(params.assessmentId)

    if (!assessment) {
      const response: ApiResponse = {
        success: false,
        error: "Assessment not found",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<AssessmentResult> = {
      success: true,
      data: assessment,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get assessment API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to get assessment",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
