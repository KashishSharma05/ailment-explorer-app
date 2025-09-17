import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { ApiResponse, AssessmentHistory } from "@/lib/types"

// GET /api/history/[sessionId] - Get assessment history for session
export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const history = storage.getAssessmentHistory(params.sessionId)

    if (!history) {
      const response: ApiResponse = {
        success: false,
        error: "Session not found or no assessment history",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<AssessmentHistory> = {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get history API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to get assessment history",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
