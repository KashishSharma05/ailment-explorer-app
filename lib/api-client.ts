"use client"

import type { AssessmentRequest, AssessmentResult, UserSession, AssessmentHistory } from "./types"

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use the text as error message
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred")
    }
  }

  async createAssessment(assessment: AssessmentRequest): Promise<AssessmentResult> {
    return this.request<AssessmentResult>("/api/assessment", {
      method: "POST",
      body: JSON.stringify(assessment),
    })
  }

  async getAssessment(assessmentId: string): Promise<AssessmentResult> {
    return this.request<AssessmentResult>(`/api/assessments/${assessmentId}`)
  }

  async getConditions() {
    const response = await this.request<{ conditions: any; totalConditions: number }>("/api/assessment")
    return response.conditions
  }

  async getCondition(conditionId: string) {
    return this.request(`/api/conditions/${conditionId}`)
  }

  async searchSymptoms(query: string) {
    return this.request(`/api/symptoms/search?q=${encodeURIComponent(query)}`)
  }

  // Session management (if available)
  async createSession(): Promise<UserSession> {
    return this.request<UserSession>("/api/sessions", {
      method: "POST",
    })
  }

  async getSession(sessionId: string): Promise<UserSession> {
    return this.request<UserSession>(`/api/sessions/${sessionId}`)
  }

  async getAssessmentHistory(sessionId: string): Promise<AssessmentHistory> {
    return this.request<AssessmentHistory>(`/api/history/${sessionId}`)
  }

  // System health
  async getHealthStatus() {
    return this.request("/api/health")
  }

  async getAnalytics() {
    return this.request("/api/analytics")
  }
}

export const apiClient = new ApiClient()

import { useState, useEffect, useCallback } from "react"

export function useAssessmentHistory(sessionId: string | null) {
  const [history, setHistory] = useState<AssessmentHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAssessmentHistory(sessionId)
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history")
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    clearError: () => setError(null),
  }
}

export function useConditions() {
  const [conditions, setConditions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConditions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getConditions()
      setConditions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conditions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConditions()
  }, [fetchConditions])

  return {
    conditions,
    loading,
    error,
    refetch: fetchConditions,
    clearError: () => setError(null),
  }
}

export function useCreateAssessment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAssessment = useCallback(async (assessment: AssessmentRequest): Promise<AssessmentResult | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.createAssessment(assessment)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assessment")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createAssessment,
    loading,
    error,
    clearError: () => setError(null),
  }
}

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const newSession = await apiClient.createSession()
      setSession(newSession)
      // Store session ID in localStorage for persistence
      localStorage.setItem("medcheck_session_id", newSession.id)
      return newSession
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true)
      setError(null)
      const existingSession = await apiClient.getSession(sessionId)
      setSession(existingSession)
      return existingSession
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get session")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("medcheck_session_id")
    if (storedSessionId) {
      getSession(storedSessionId)
    } else {
      createSession()
    }
  }, [createSession, getSession])

  return {
    session,
    loading,
    error,
    createSession,
    getSession,
    clearError: () => setError(null),
  }
}
