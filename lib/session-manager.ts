"use client"

// Client-side session management utilities

import type { UserSession, ApiResponse } from "./types"

class SessionManager {
  private sessionId: string | null = null
  private session: UserSession | null = null

  constructor() {
    // Initialize session from localStorage if available
    if (typeof window !== "undefined") {
      this.sessionId = localStorage.getItem("medcheck_session_id")
    }
  }

  async getOrCreateSession(): Promise<UserSession> {
    // If we have a session ID, try to fetch the session
    if (this.sessionId) {
      try {
        const response = await fetch(`/api/sessions/${this.sessionId}`)
        const result: ApiResponse<UserSession> = await response.json()

        if (result.success && result.data) {
          this.session = result.data
          return result.data
        }
      } catch (error) {
        console.warn("Failed to fetch existing session:", error)
      }
    }

    // Create new session
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result: ApiResponse<UserSession> = await response.json()

      if (result.success && result.data) {
        this.session = result.data
        this.sessionId = result.data.id

        // Store session ID in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("medcheck_session_id", this.sessionId)
        }

        return result.data
      } else {
        throw new Error(result.error || "Failed to create session")
      }
    } catch (error) {
      console.error("Failed to create session:", error)
      throw error
    }
  }

  async updateActivity(): Promise<void> {
    if (!this.sessionId) return

    try {
      await fetch(`/api/sessions/${this.sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.warn("Failed to update session activity:", error)
    }
  }

  getCurrentSessionId(): string | null {
    return this.sessionId
  }

  getCurrentSession(): UserSession | null {
    return this.session
  }

  clearSession(): void {
    this.sessionId = null
    this.session = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("medcheck_session_id")
    }
  }

  // Auto-update activity every 5 minutes
  startActivityTracking(): void {
    if (typeof window === "undefined") return

    const interval = setInterval(
      () => {
        this.updateActivity()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    // Clear interval when page unloads
    window.addEventListener("beforeunload", () => {
      clearInterval(interval)
    })
  }
}

// Singleton instance
export const sessionManager = new SessionManager()

// React hook for session management
export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true)
        const sessionData = await sessionManager.getOrCreateSession()
        setSession(sessionData)
        setError(null)

        // Start activity tracking
        sessionManager.startActivityTracking()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize session")
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [])

  return {
    session,
    sessionId: session?.id || null,
    loading,
    error,
    updateActivity: () => sessionManager.updateActivity(),
    clearSession: () => {
      sessionManager.clearSession()
      setSession(null)
    },
  }
}

// Import React hooks
import { useState, useEffect } from "react"
