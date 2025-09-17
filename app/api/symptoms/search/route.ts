import { type NextRequest, NextResponse } from "next/server"
import { searchSymptoms } from "@/lib/medical-data"
import type { ApiResponse } from "@/lib/types"

// GET /api/symptoms/search?q=query - Search symptoms across conditions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length < 2) {
      const response: ApiResponse = {
        success: false,
        error: "Query parameter 'q' is required and must be at least 2 characters",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    const results = searchSymptoms(query.trim())

    const response: ApiResponse<typeof results> = {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Search symptoms API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to search symptoms",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
