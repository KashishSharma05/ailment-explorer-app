"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SymptomChecker from "@/components/SymptomChecker"
import AssessmentHistory from "@/components/AssessmentHistory"
import { Brain, Shield, Users, Clock, Activity, Microscope, Zap, TrendingUp } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [currentView, setCurrentView] = useState<"home" | "assessment" | "history">("home")

  const handleStartAssessment = () => {
    setCurrentView("assessment")
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleViewHistory = () => {
    setCurrentView("history")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-xl flex items-center justify-center pulse-glow">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  HealthScope AI
                </h1>
                <p className="text-xs text-gray-600">Advanced Medical Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="hidden md:flex bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 border-0"
              >
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Diagnostics
              </Badge>
              <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent" onClick={handleBackToHome}>
                Home
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent" onClick={handleViewHistory}>
                History
              </Button>
            </div>
          </div>
        </div>
      </header>

      {currentView === "home" && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 md:py-28">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
            <div className="container mx-auto px-4 relative">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <Badge className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white border-0 px-4 py-2">
                      <Brain className="w-4 h-4 mr-2" />
                      Next-Generation Medical AI
                    </Badge>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                        Intelligent
                      </span>
                      <br />
                      <span className="text-gray-900">Health Assessment</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                      Revolutionary AI-powered platform for comprehensive medical symptom analysis, risk assessment, and
                      personalized health insights with real-time diagnostic support.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                      <Shield className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium">FDA Guidelines</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                      <Users className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium">Clinical Grade</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                      <Clock className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium">Real-time Analysis</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium">Predictive Insights</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg"
                      onClick={handleStartAssessment}
                    >
                      <Activity className="w-5 h-5 mr-2" />
                      Start AI Assessment
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-blue-200 hover:bg-blue-50 px-8 py-4 text-lg bg-transparent"
                      onClick={handleViewHistory}
                    >
                      View History
                    </Button>
                  </div>
                </div>

                {/* Existing code */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-3xl opacity-20 blur-3xl float-animation"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="flex items-center justify-center w-full h-80">
                      <div className="relative">
                        <Microscope className="w-40 h-40 text-blue-600" />
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                      <p className="text-gray-600">
                        Advanced machine learning algorithms for precise medical assessment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Medical Conditions Overview */}
          <section className="py-20 bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white border-0 mb-4">
                  Advanced Diagnostics
                </Badge>
                <h3 className="text-4xl font-bold mb-6 text-gray-900">AI-Enhanced Condition Analysis</h3>
                <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                  Our advanced AI system provides comprehensive analysis for complex medical conditions using machine
                  learning algorithms trained on extensive medical datasets.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    name: "Mesothelioma",
                    description: "Rare cancer affecting mesothelial tissue with AI-powered early detection",
                    symptoms: "15+ AI-analyzed symptoms",
                    color: "bg-red-50 border-red-200 text-red-800",
                    accuracy: "94.2%",
                  },
                  {
                    name: "Chronic Kidney Disease",
                    description: "Progressive kidney function decline with predictive modeling",
                    symptoms: "12+ biomarker indicators",
                    color: "bg-blue-50 border-blue-200 text-blue-800",
                    accuracy: "91.8%",
                  },
                  {
                    name: "Coronary Heart Disease",
                    description: "Cardiovascular risk assessment with ML algorithms",
                    symptoms: "18+ cardiac indicators",
                    color: "bg-purple-50 border-purple-200 text-purple-800",
                    accuracy: "96.1%",
                  },
                  {
                    name: "Diabetes Mellitus",
                    description: "Metabolic disorder analysis with glucose pattern recognition",
                    symptoms: "14+ metabolic markers",
                    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
                    accuracy: "93.7%",
                  },
                  {
                    name: "Liver Cirrhosis",
                    description: "Hepatic function assessment with advanced imaging analysis",
                    symptoms: "16+ hepatic indicators",
                    color: "bg-orange-50 border-orange-200 text-orange-800",
                    accuracy: "89.4%",
                  },
                ].map((condition, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-2 hover:border-blue-200"
                  >
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border-2 ${condition.color}`}
                          >
                            {condition.name}
                          </div>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                            {condition.accuracy}
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium text-lg">{condition.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{condition.symptoms}</span>
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Brain className="w-4 h-4" />
                            <span className="font-medium">AI Enhanced</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="md:col-span-2 lg:col-span-1 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white border-0">
                  <CardContent className="p-8 text-center">
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                        <Brain className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold">Neural Network Analysis</h4>
                      <p className="text-white/90 leading-relaxed">
                        Our deep learning models analyze complex symptom patterns and medical history to provide
                        unprecedented diagnostic accuracy and personalized recommendations.
                      </p>
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Zap className="w-3 h-3 mr-1" />
                        Real-time Processing
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Enhanced Disclaimer */}
          <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="container mx-auto px-4">
              <Card className="border-2 border-amber-200 bg-white/90 backdrop-blur-sm shadow-xl">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-amber-600" />
                  </div>
                  <h4 className="text-2xl font-bold mb-6 text-amber-800">Important Medical Disclaimer</h4>
                  <p className="text-gray-700 leading-relaxed max-w-5xl mx-auto text-lg">
                    HealthScope AI is an advanced diagnostic support tool designed for educational and informational
                    purposes. While our AI algorithms are trained on extensive medical datasets and provide high
                    accuracy rates, this platform should never replace professional medical consultation, diagnosis, or
                    treatment. Always consult qualified healthcare providers for medical concerns. In case of medical
                    emergencies, contact emergency services immediately.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      Educational Use Only
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      Not a Medical Device
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      Consult Healthcare Providers
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {currentView === "assessment" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white border-0 mb-4">
                Interactive Assessment
              </Badge>
              <h3 className="text-4xl font-bold mb-6 text-gray-900">AI-Powered Symptom Analysis</h3>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                Experience our revolutionary AI-driven assessment platform that adapts to your responses and provides
                personalized medical insights in real-time.
              </p>
              <Button variant="outline" onClick={handleBackToHome} className="mt-4 bg-transparent">
                ← Back to Home
              </Button>
            </div>

            <SymptomChecker />
          </div>
        </section>
      )}

      {currentView === "history" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0 mb-4">
                Health Tracking
              </Badge>
              <h3 className="text-4xl font-bold mb-6 text-gray-900">Intelligent Health Timeline</h3>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                Track your health journey with AI-powered trend analysis and personalized insights that help you
                understand your health patterns over time.
              </p>
              <Button variant="outline" onClick={handleBackToHome} className="mt-4 bg-transparent">
                ← Back to Home
              </Button>
            </div>

            <AssessmentHistory />
          </div>
        </section>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  HealthScope AI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced AI-powered medical assessment platform providing intelligent health insights and diagnostic
                support for healthcare professionals and patients.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-white">Platform</h5>
              <ul className="space-y-2 text-gray-400">
                <li>AI Assessment</li>
                <li>Health Analytics</li>
                <li>Medical Database</li>
                <li>Research Tools</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-white">Resources</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Medical Guidelines</li>
                <li>Research Papers</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-white">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center">
              © 2024 HealthScope AI. Advanced medical intelligence platform • Educational purposes only
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-gray-600 text-gray-400">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-400">
                <Shield className="w-3 h-3 mr-1" />
                Secure
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
