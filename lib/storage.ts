// In-memory storage system for assessments and sessions
// In production, this would be replaced with a proper database

import type { AssessmentResult, UserSession, AssessmentHistory, ConditionKey } from "./types"

class MemoryStorage {
  private sessions: Map<string, UserSession> = new Map()
  private assessments: Map<string, AssessmentResult> = new Map()

  // Session management
  createSession(userAgent?: string, ipAddress?: string): UserSession {
    const sessionId = this.generateId("session")
    const session: UserSession = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      assessments: [],
      userAgent,
      ipAddress,
    }

    this.sessions.set(sessionId, session)
    return session
  }

  getSession(sessionId: string): UserSession | null {
    return this.sessions.get(sessionId) || null
  }

  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date().toISOString()
    }
  }

  // Assessment management
  saveAssessment(assessment: AssessmentResult): void {
    this.assessments.set(assessment.id, assessment)

    // Add to session if sessionId provided
    if (assessment.sessionId) {
      const session = this.sessions.get(assessment.sessionId)
      if (session) {
        session.assessments.push(assessment)
        this.updateSessionActivity(assessment.sessionId)
      }
    }
  }

  getAssessment(assessmentId: string): AssessmentResult | null {
    return this.assessments.get(assessmentId) || null
  }

  getAssessmentsBySession(sessionId: string): AssessmentResult[] {
    const session = this.sessions.get(sessionId)
    return session ? session.assessments : []
  }

  getAssessmentHistory(sessionId: string): AssessmentHistory | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const assessments = session.assessments
    const riskTrends: AssessmentHistory["riskTrends"] = []

    // Group assessments by condition
    const conditionGroups = assessments.reduce(
      (groups, assessment) => {
        if (!groups[assessment.condition]) {
          groups[assessment.condition] = []
        }
        groups[assessment.condition].push({
          timestamp: assessment.timestamp,
          risk: assessment.risk,
          score: assessment.score,
        })
        return groups
      },
      {} as Record<ConditionKey, Array<{ timestamp: string; risk: any; score: number }>>,
    )

    // Convert to risk trends format
    Object.entries(conditionGroups).forEach(([condition, conditionAssessments]) => {
      riskTrends.push({
        condition: condition as ConditionKey,
        assessments: conditionAssessments.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
      })
    })

    return {
      sessionId,
      assessments,
      totalAssessments: assessments.length,
      lastAssessment: assessments.length > 0 ? assessments[assessments.length - 1].timestamp : "",
      riskTrends,
    }
  }

  // Analytics and statistics
  getGlobalStats() {
    const totalSessions = this.sessions.size
    const totalAssessments = this.assessments.size

    const assessmentsByCondition: Record<ConditionKey, number> = {
      mesothelioma: 0,
      chronickidneydisease: 0,
      coronaryheartdisease: 0,
      diabetesmelitus: 0,
      livercirrhosis: 0,
    }

    const riskDistribution = { low: 0, moderate: 0, high: 0 }

    this.assessments.forEach((assessment) => {
      assessmentsByCondition[assessment.condition]++
      riskDistribution[assessment.risk]++
    })

    return {
      totalSessions,
      totalAssessments,
      assessmentsByCondition,
      riskDistribution,
      averageAssessmentsPerSession: totalSessions > 0 ? totalAssessments / totalSessions : 0,
    }
  }

  // Cleanup old sessions (older than 24 hours)
  cleanupOldSessions(): number {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
    let cleanedCount = 0

    this.sessions.forEach((session, sessionId) => {
      if (new Date(session.lastActivity) < cutoffTime) {
        // Remove associated assessments
        session.assessments.forEach((assessment) => {
          this.assessments.delete(assessment.id)
        })

        this.sessions.delete(sessionId)
        cleanedCount++
      }
    })

    return cleanedCount
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const storage = new MemoryStorage()

// Utility functions
export function generateAssessmentId(): string {
  return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Auto-cleanup every hour
if (typeof window === "undefined") {
  // Server-side only
  setInterval(
    () => {
      const cleaned = storage.cleanupOldSessions()
      if (cleaned > 0) {
        console.log(`[Storage] Cleaned up ${cleaned} old sessions`)
      }
    },
    60 * 60 * 1000,
  ) // 1 hour
}
