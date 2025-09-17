"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Clock, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoredAssessment {
  id: string
  condition: string
  conditionName: string
  score: number
  risk: "low" | "moderate" | "high"
  matches: number
  totalSymptoms: number
  selectedSymptoms: string[]
  recommendations: string[]
  timestamp: string
}

interface AssessmentHistoryProps {
  className?: string
}

export default function AssessmentHistory({ className }: AssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<StoredAssessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<StoredAssessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("medcheck_assessments")
      if (stored) {
        const parsedAssessments = JSON.parse(stored)
        setAssessments(
          parsedAssessments.sort(
            (a: StoredAssessment, b: StoredAssessment) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ),
        )
      }
    } catch (error) {
      console.error("Error loading assessment history:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveAssessment = (assessment: StoredAssessment) => {
    try {
      const existing = localStorage.getItem("medcheck_assessments")
      const assessments = existing ? JSON.parse(existing) : []
      assessments.push(assessment)
      localStorage.setItem("medcheck_assessments", JSON.stringify(assessments))
      setAssessments((prev) => [assessment, ...prev])
    } catch (error) {
      console.error("Error saving assessment:", error)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem("medcheck_assessments")
    setAssessments([])
  }

  const getRiskColor = (risk: "low" | "moderate" | "high") => {
    switch (risk) {
      case "high":
        return "text-red-600"
      case "moderate":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskBadgeVariant = (risk: "low" | "moderate" | "high") => {
    switch (risk) {
      case "high":
        return "destructive"
      case "moderate":
        return "secondary"
      case "low":
        return "default"
      default:
        return "outline"
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-600" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getConditionTrends = () => {
    const grouped = assessments.reduce(
      (acc, assessment) => {
        if (!acc[assessment.condition]) {
          acc[assessment.condition] = []
        }
        acc[assessment.condition].push(assessment)
        return acc
      },
      {} as Record<string, StoredAssessment[]>,
    )

    return Object.entries(grouped).map(([condition, conditionAssessments]) => ({
      condition,
      conditionName: conditionAssessments[0].conditionName,
      assessments: conditionAssessments.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    }))
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Loading assessment history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (assessments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <History className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">No assessment history yet</p>
            <p className="text-xs text-gray-500">Complete an assessment to see your history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const conditionTrends = getConditionTrends()

  return (
    <div className={cn("space-y-6", className)}>
      {/* History Overview */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <History className="w-5 h-5" />
              Assessment History
            </CardTitle>
            {assessments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
              <p className="text-sm text-gray-600">Total Assessments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{conditionTrends.length}</div>
              <p className="text-sm text-gray-600">Conditions Assessed</p>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Last Assessment</div>
              <p className="font-medium text-gray-900">
                {assessments.length > 0 ? new Date(assessments[0].timestamp).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Trends by Condition */}
      {conditionTrends.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Risk Trends by Condition</h3>
          {conditionTrends.map((trend) => (
            <Card key={trend.condition} className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-base text-gray-900">{trend.conditionName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trend.assessments.map((assessment, index) => {
                    const previousAssessment = trend.assessments[index - 1]
                    return (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(assessment.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(assessment.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{assessment.score}%</div>
                            <Badge variant={getRiskBadgeVariant(assessment.risk)} className="text-xs">
                              {assessment.risk}
                            </Badge>
                          </div>
                          {previousAssessment && getTrendIcon(assessment.score, previousAssessment.score)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Assessments */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessments.slice(0, 5).map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{assessment.conditionName}</h4>
                    <Badge variant={getRiskBadgeVariant(assessment.risk)}>{assessment.risk}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{new Date(assessment.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{assessment.score}%</div>
                  <p className="text-xs text-gray-500">
                    {assessment.matches}/{assessment.totalSymptoms} symptoms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">{selectedAssessment.conditionName} Assessment</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedAssessment(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{selectedAssessment.score}%</div>
                  <p className="text-sm text-gray-600">Match Score</p>
                </div>
                <div className="text-center">
                  <Badge variant={getRiskBadgeVariant(selectedAssessment.risk)} className="text-lg px-4 py-1">
                    {selectedAssessment.risk}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Risk Level</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900">
                    {selectedAssessment.matches}/{selectedAssessment.totalSymptoms}
                  </div>
                  <p className="text-sm text-gray-600">Symptoms Matched</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-gray-900">Selected Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAssessment.selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="outline">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-gray-900">Recommendations</h4>
                <ul className="space-y-1">
                  {selectedAssessment.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-500">
                Assessment completed on {new Date(selectedAssessment.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export const saveAssessmentToHistory = (assessment: Omit<StoredAssessment, "id" | "timestamp">) => {
  const fullAssessment: StoredAssessment = {
    ...assessment,
    id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  try {
    const existing = localStorage.getItem("medcheck_assessments")
    const assessments = existing ? JSON.parse(existing) : []
    assessments.push(fullAssessment)
    localStorage.setItem("medcheck_assessments", JSON.stringify(assessments))
    return fullAssessment
  } catch (error) {
    console.error("Error saving assessment:", error)
    return null
  }
}
