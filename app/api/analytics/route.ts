import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { ApiResponse } from "@/lib/types"

// GET /api/analytics - Get system analytics and statistics
export async function GET() {
  try {
    const stats = storage.getGlobalStats()

    // Calculate additional analytics
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get recent activity (this would be more sophisticated with a real database)
    const recentSessions = Array.from((storage as any).sessions.values()).filter(
      (session: any) => new Date(session.lastActivity) > last24Hours,
    ).length

    const weeklyAssessments = Array.from((storage as any).assessments.values()).filter(
      (assessment: any) => new Date(assessment.timestamp) > last7Days,
    ).length

    const analytics = {
      ...stats,
      recentActivity: {
        sessionsLast24h: recentSessions,
        assessmentsLast7d: weeklyAssessments,
      },
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: now.toISOString(),
      },
    }

    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get analytics API error:", error)
    const response: ApiResponse = {
      success: false,
      error: "Failed to get analytics",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
