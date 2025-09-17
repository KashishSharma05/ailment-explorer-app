"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Stethoscope, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { saveAssessmentToHistory } from "./AssessmentHistory"

interface AssessmentRequest {
  condition: string
  symptoms: string[]
  riskFactors?: string[]
  userInfo?: {
    age?: number
    gender?: string
    medicalHistory?: string[]
  }
}

interface AssessmentResult {
  id: string
  condition: string
  conditionName: string
  score: number
  risk: "low" | "moderate" | "high"
  matches: number
  totalSymptoms: number
  selectedSymptoms: string[]
  riskFactorScore?: number
  recommendations: string[]
  timestamp: string
}

interface MedicalCondition {
  name: string
  description: string
  symptoms: string[]
  riskFactors: string[]
}

interface SymptomCheckerProps {
  className?: string
}

export default function SymptomChecker({ className }: SymptomCheckerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null)
  const [conditions, setConditions] = useState<Record<string, MedicalCondition>>({})
  const [loading, setLoading] = useState(false)
  const [conditionsLoaded, setConditionsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const steps = ["Select Condition", "Choose Symptoms", "Assessment"]

  const fetchConditions = async () => {
    if (conditionsLoaded) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/assessment", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch conditions: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.conditions) {
        throw new Error("Invalid response format: missing conditions data")
      }

      setConditions(data.conditions)
      setConditionsLoaded(true)
    } catch (error) {
      console.error("Error fetching conditions:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load medical conditions"
      setError(errorMessage)
      toast({
        title: "Error Loading Conditions",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConditions()
  }, [])

  const handleConditionSelect = (condition: string) => {
    setSelectedCondition(condition)
    setCurrentStep(1)
    setError(null)
  }

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const calculateAssessment = async () => {
    if (!selectedCondition) {
      toast({
        title: "Error",
        description: "Please select a condition first.",
        variant: "destructive",
      })
      return
    }

    if (selectedSymptoms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one symptom.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const requestData: AssessmentRequest = {
        condition: selectedCondition,
        symptoms: selectedSymptoms,
      }

      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Assessment failed: ${response.status} ${response.statusText}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const result: AssessmentResult = await response.json()

      if (!result.id || !result.conditionName || typeof result.score !== "number") {
        throw new Error("Invalid assessment response format")
      }

      setAssessment(result)
      setCurrentStep(2)

      saveAssessmentToHistory({
        condition: result.condition,
        conditionName: result.conditionName,
        score: result.score,
        risk: result.risk,
        matches: result.matches,
        totalSymptoms: result.totalSymptoms,
        selectedSymptoms: result.selectedSymptoms,
        recommendations: result.recommendations,
      })

      toast({
        title: "Assessment Complete",
        description: `Generated assessment for ${result.conditionName}`,
      })
    } catch (error) {
      console.error("Error generating assessment:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate assessment"
      setError(errorMessage)
      toast({
        title: "Assessment Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetChecker = () => {
    setCurrentStep(0)
    setSelectedCondition(null)
    setSelectedSymptoms([])
    setAssessment(null)
    setError(null)
  }

  const retryOperation = () => {
    setError(null)
    if (!conditionsLoaded) {
      fetchConditions()
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  if (error && !conditionsLoaded) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-red-800">Failed to Load Medical Conditions</h3>
              <p className="text-sm text-red-600 max-w-md">{error}</p>
            </div>
            <Button onClick={retryOperation} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!conditionsLoaded && loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-700">Loading medical conditions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {error && conditionsLoaded && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-auto">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                Medical Symptom Assessment
              </h2>
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-gray-600">{steps[currentStep]}</p>
          </div>
        </CardContent>
      </Card>

      {currentStep === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(conditions).map(([key, condition]) => (
            <Card
              key={key}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
              onClick={() => handleConditionSelect(key)}
            >
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">{condition.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{condition.description}</p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  Click to assess <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentStep === 1 && selectedCondition && conditions[selectedCondition] && (
        <div className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">
                {conditions[selectedCondition].name} - Symptom Assessment
              </CardTitle>
              <p className="text-gray-600">Select all symptoms you are currently experiencing:</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {conditions[selectedCondition].symptoms.map((symptom) => (
                  <div
                    key={symptom}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200",
                      "border-2 hover:shadow-md",
                      selectedSymptoms.includes(symptom)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300",
                    )}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedSymptoms.includes(symptom) ? "border-blue-600 bg-blue-600" : "border-gray-400",
                      )}
                    >
                      {selectedSymptoms.includes(symptom) && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium text-gray-900">{symptom}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={calculateAssessment}
                  disabled={selectedSymptoms.length === 0 || loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Assessment
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && assessment && (
        <div className="space-y-6">
          <Card
            className={cn(
              "shadow-lg",
              assessment.risk === "high"
                ? "border-red-500"
                : assessment.risk === "moderate"
                  ? "border-yellow-500"
                  : "border-green-500",
            )}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle
                  className={cn(
                    "w-6 h-6",
                    assessment.risk === "high"
                      ? "text-red-500"
                      : assessment.risk === "moderate"
                        ? "text-yellow-500"
                        : "text-green-500",
                  )}
                />
                <CardTitle className="text-xl text-gray-900">Assessment Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-blue-600">{assessment.score}%</div>
                <p className="text-lg text-gray-900">Symptom Match for {assessment.conditionName}</p>
                <Badge
                  variant={
                    assessment.risk === "high"
                      ? "destructive"
                      : assessment.risk === "moderate"
                        ? "secondary"
                        : "default"
                  }
                  className="text-sm px-4 py-1"
                >
                  {assessment.risk.charAt(0).toUpperCase() + assessment.risk.slice(1)} Risk Level
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2 text-gray-900">Summary:</p>
                <p className="text-sm text-gray-600">
                  You selected {assessment.selectedSymptoms.length} symptoms, with {assessment.matches} matching common{" "}
                  {assessment.conditionName.toLowerCase()} symptoms out of {assessment.totalSymptoms} total symptoms.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-800 mb-2">Recommendations:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {assessment.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetChecker} variant="outline" className="flex-1 bg-transparent">
                  New Assessment
                </Button>
                <Button
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Check Another Condition
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
