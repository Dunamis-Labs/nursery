"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PlantFinderResults } from "@/components/plant-finder-results"

interface FlowState {
  light: string
  careEffort: string
  petSafe: string
  space: string
  goals: string[]
}

export function PlantFinderFlow() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [answers, setAnswers] = useState<FlowState>({
    light: "",
    careEffort: "",
    petSafe: "",
    space: "",
    goals: [],
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  if (!started) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-6">
            Find the Right Plant for Your Space
          </h1>
          <p className="text-lg text-[#6b7280] leading-relaxed max-w-2xl mx-auto">
            Answer a few simple questions and we will recommend plants that are most likely to thrive in your home or
            garden.
          </p>
        </div>

        <Card className="p-8 border-[#e5e7eb] mb-8 bg-[#faf9f6]">
          <h2 className="font-serif text-2xl font-bold text-[#2c2c2c] mb-4">How the Plant Finder Works</h2>
          <div className="space-y-3 text-[#2c2c2c] leading-relaxed">
            <p>
              The Plant Finder recommends plants based on the conditions they are most likely to thrive in. We consider
              light availability, care effort, safety for pets or children, available space, and your desired outcome to
              surface plants that succeed in real homes and gardens.
            </p>
            <p>
              Our recommendations prioritize real-world survivability over ideal greenhouse conditions. Plants are
              selected for their ability to adapt to typical indoor environments, tolerate occasional care lapses, and
              perform consistently across a range of home conditions.
            </p>
            <p>
              Each recommendation includes an explanation of why the plant fits your space, helping you make an informed
              decision based on how the plant actually grows, not how it is marketed.
            </p>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white px-8 py-6 text-lg"
            onClick={() => setStarted(true)}
          >
            Start Plant Finder
          </Button>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <PlantFinderResults
        answers={answers}
        onRestart={() => {
          setShowResults(false)
          setCurrentStep(1)
          setAnswers({
            light: "",
            careEffort: "",
            petSafe: "",
            space: "",
            goals: [],
          })
          setStarted(false)
        }}
      />
    )
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return answers.light !== ""
      case 2:
        return answers.careEffort !== ""
      case 3:
        return answers.petSafe !== ""
      case 4:
        return answers.space !== ""
      case 5:
        return answers.goals.length > 0
      default:
        return false
    }
  }

  const toggleGoal = (goal: string) => {
    setAnswers({
      ...answers,
      goals: answers.goals.includes(goal) ? answers.goals.filter((g) => g !== goal) : [...answers.goals, goal],
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6b7280]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-[#6b7280]">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-8 border-[#e5e7eb]">
        {currentStep === 1 && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#2c2c2c] mb-6">
              How much natural light does your space get?
            </h2>
            <RadioGroup value={answers.light} onValueChange={(value) => setAnswers({ ...answers, light: value })}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="bright-direct" id="bright-direct" />
                  <Label htmlFor="bright-direct" className="flex-1 cursor-pointer text-base">
                    Bright direct light (sunlight hits the plant)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="bright-indirect" id="bright-indirect" />
                  <Label htmlFor="bright-indirect" className="flex-1 cursor-pointer text-base">
                    Bright indirect light
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="flex-1 cursor-pointer text-base">
                    Medium light
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="flex-1 cursor-pointer text-base">
                    Low light
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#2c2c2c] mb-6">
              How much effort do you want to put into plant care?
            </h2>
            <RadioGroup
              value={answers.careEffort}
              onValueChange={(value) => setAnswers({ ...answers, careEffort: value })}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="easiest" id="easiest" />
                  <Label htmlFor="easiest" className="flex-1 cursor-pointer text-base">
                    I want the easiest possible plant
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="basic" id="basic" />
                  <Label htmlFor="basic" className="flex-1 cursor-pointer text-base">
                    I am happy with basic care
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="hobby" id="hobby" />
                  <Label htmlFor="hobby" className="flex-1 cursor-pointer text-base">
                    I enjoy plant care as a hobby
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#2c2c2c] mb-6">Do you have pets or small children?</h2>
            <RadioGroup value={answers.petSafe} onValueChange={(value) => setAnswers({ ...answers, petSafe: value })}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="yes" id="yes-pets" />
                  <Label htmlFor="yes-pets" className="flex-1 cursor-pointer text-base">
                    Yes — pet-safe plants only
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="no" id="no-pets" />
                  <Label htmlFor="no-pets" className="flex-1 cursor-pointer text-base">
                    No — not a concern
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#2c2c2c] mb-6">
              How much space do you have for this plant?
            </h2>
            <RadioGroup value={answers.space} onValueChange={(value) => setAnswers({ ...answers, space: value })}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="flex-1 cursor-pointer text-base">
                    Small (desk, shelf, windowsill)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="medium" id="medium-space" />
                  <Label htmlFor="medium-space" className="flex-1 cursor-pointer text-base">
                    Medium (floor plant)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="flex-1 cursor-pointer text-base">
                    Large (statement plant)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#2c2c2c] mb-6">What do you want this plant to do?</h2>
            <p className="text-sm text-[#6b7280] mb-6">Select all that apply</p>
            <div className="space-y-3">
              {[
                { id: "alive", label: "Make the space feel more alive" },
                { id: "minimal", label: "Add greenery with minimal maintenance" },
                { id: "air-quality", label: "Improve air quality" },
                { id: "privacy", label: "Add height or privacy" },
                { id: "texture", label: "Add texture or visual interest" },
                { id: "edible", label: "Grow something edible" },
              ].map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#87a96b]/5 transition-colors cursor-pointer"
                  onClick={() => toggleGoal(goal.id)}
                >
                  <Checkbox
                    id={goal.id}
                    checked={answers.goals.includes(goal.id)}
                    onCheckedChange={() => toggleGoal(goal.id)}
                  />
                  <Label htmlFor={goal.id} className="flex-1 cursor-pointer text-base">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="border-[#e5e7eb] hover:bg-[#87a96b]/10 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()} className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white">
          {currentStep === totalSteps ? "View Results" : "Continue"}
          {currentStep !== totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
