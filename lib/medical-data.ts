// Centralized medical data and condition management

import type { MedicalCondition, ConditionKey } from "./types"

export const medicalConditions: Record<ConditionKey, MedicalCondition> = {
  mesothelioma: {
    name: "Mesothelioma",
    description: "Cancer affecting the lining of lungs, abdomen, or heart",
    symptoms: [
      "Chest pain",
      "Shortness of breath",
      "Persistent cough",
      "Fatigue",
      "Weight loss",
      "Abdominal pain",
      "Abdominal swelling",
      "Difficulty swallowing",
      "Hoarse voice",
      "Night sweats",
    ],
    riskFactors: ["Asbestos exposure", "Age over 65", "Male gender", "Radiation exposure"],
  },
  chronickidneydisease: {
    name: "Chronic Kidney Disease",
    description: "Gradual loss of kidney function over time",
    symptoms: [
      "Fatigue",
      "Swelling in legs/feet",
      "Frequent urination",
      "Blood in urine",
      "Foamy urine",
      "High blood pressure",
      "Nausea",
      "Loss of appetite",
      "Muscle cramps",
      "Itchy skin",
    ],
    riskFactors: ["Diabetes", "High blood pressure", "Family history", "Age over 60"],
  },
  coronaryheartdisease: {
    name: "Coronary Heart Disease",
    description: "Narrowed or blocked coronary arteries",
    symptoms: [
      "Chest pain",
      "Chest pressure",
      "Shortness of breath",
      "Fatigue",
      "Heart palpitations",
      "Dizziness",
      "Nausea",
      "Cold sweats",
      "Pain in arms/shoulders",
      "Jaw pain",
    ],
    riskFactors: ["High cholesterol", "High blood pressure", "Smoking", "Diabetes"],
  },
  diabetesmelitus: {
    name: "Diabetes Mellitus",
    description: "High blood sugar due to insulin problems",
    symptoms: [
      "Frequent urination",
      "Excessive thirst",
      "Increased hunger",
      "Fatigue",
      "Blurred vision",
      "Slow healing wounds",
      "Frequent infections",
      "Weight loss",
      "Tingling in hands/feet",
      "Dry mouth",
    ],
    riskFactors: ["Family history", "Obesity", "Age over 45", "Sedentary lifestyle"],
  },
  livercirrhosis: {
    name: "Liver Cirrhosis",
    description: "Scarring and damage to the liver",
    symptoms: [
      "Fatigue",
      "Abdominal pain",
      "Abdominal swelling",
      "Jaundice",
      "Nausea",
      "Loss of appetite",
      "Weight loss",
      "Swelling in legs",
      "Easy bruising",
      "Dark urine",
      "Pale stools",
      "Confusion",
    ],
    riskFactors: ["Alcohol abuse", "Hepatitis B/C", "Fatty liver disease", "Autoimmune diseases"],
  },
}

export function getCondition(conditionKey: ConditionKey): MedicalCondition | null {
  return medicalConditions[conditionKey] || null
}

export function getAllConditions(): Record<ConditionKey, MedicalCondition> {
  return medicalConditions
}

export function getConditionKeys(): ConditionKey[] {
  return Object.keys(medicalConditions) as ConditionKey[]
}

export function searchSymptoms(query: string): Array<{ condition: ConditionKey; symptom: string }> {
  const results: Array<{ condition: ConditionKey; symptom: string }> = []
  const lowerQuery = query.toLowerCase()

  Object.entries(medicalConditions).forEach(([key, condition]) => {
    condition.symptoms.forEach((symptom) => {
      if (symptom.toLowerCase().includes(lowerQuery)) {
        results.push({
          condition: key as ConditionKey,
          symptom,
        })
      }
    })
  })

  return results
}

export function getCommonSymptoms(): string[] {
  const symptomCounts: Record<string, number> = {}

  Object.values(medicalConditions).forEach((condition) => {
    condition.symptoms.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
    })
  })

  return Object.entries(symptomCounts)
    .filter(([_, count]) => count > 1)
    .sort(([_, a], [__, b]) => b - a)
    .map(([symptom]) => symptom)
}
