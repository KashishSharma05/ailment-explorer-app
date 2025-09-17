import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { ApiResponse, UserSession } from "@/lib/types"

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || undefined
    const forwarded = request.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    const session = storage.createSession(userAgent, ipAddress)

    const response: ApiResponse<UserSession> = {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Create session API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to create session",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// GET /api/sessions - Get session statistics (admin endpoint)
export async function GET() {
  try {
    const stats = storage.getGlobalStats()

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get sessions API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to get session statistics",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
