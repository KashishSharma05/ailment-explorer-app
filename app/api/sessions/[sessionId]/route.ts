import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { ApiResponse, UserSession } from "@/lib/types"

// GET /api/sessions/[sessionId] - Get specific session
export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const session = storage.getSession(params.sessionId)

    if (!session) {
      const response: ApiResponse = {
        success: false,
        error: "Session not found",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Update last activity
    storage.updateSessionActivity(params.sessionId)

    const response: ApiResponse<UserSession> = {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get session API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to get session",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// PUT /api/sessions/[sessionId] - Update session activity
export async function PUT(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const session = storage.getSession(params.sessionId)

    if (!session) {
      const response: ApiResponse = {
        success: false,
        error: "Session not found",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 404 })
    }

    storage.updateSessionActivity(params.sessionId)
    const updatedSession = storage.getSession(params.sessionId)

    const response: ApiResponse<UserSession> = {
      success: true,
      data: updatedSession!,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Update session API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to update session",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
