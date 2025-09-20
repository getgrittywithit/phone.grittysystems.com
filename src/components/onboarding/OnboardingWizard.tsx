'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Phone, MessageSquare, Target, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UseCaseSelector } from './UseCaseSelector'
import { PhoneNumberSelector } from '../PhoneNumberSelector'
import { AIPersonalityBuilder } from './AIPersonalityBuilder'
import { PlanSelector } from './PlanSelector'

interface OnboardingData {
  companyName: string
  useCase: string
  useCaseDescription: string
  aiPersonality: string
  welcomeMessage: string
  phoneNumber: string
  plan: string
  billingInfo: any
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<Partial<OnboardingData>>({})

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to AI Hotlines',
      description: 'Let\'s set up your first AI-powered phone line',
      icon: MessageSquare
    },
    {
      id: 'use-case',
      title: 'Choose Your Use Case',
      description: 'What will your hotline be used for?',
      icon: Target
    },
    {
      id: 'phone-number',
      title: 'Select Phone Number',
      description: 'Choose a phone number for your hotline',
      icon: Phone
    },
    {
      id: 'ai-setup',
      title: 'Configure AI Assistant',
      description: 'Customize how your AI will interact with callers',
      icon: MessageSquare
    },
    {
      id: 'plan',
      title: 'Choose Your Plan',
      description: 'Select a plan that fits your needs',
      icon: CreditCard
    }
  ]

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return data.companyName && data.companyName.length > 0
      case 'use-case':
        return data.useCase && data.useCaseDescription
      case 'phone-number':
        return data.phoneNumber
      case 'ai-setup':
        return data.aiPersonality && data.welcomeMessage
      case 'plan':
        return data.plan
      default:
        return true
    }
  }

  const handleComplete = () => {
    if (data as OnboardingData) {
      onComplete(data as OnboardingData)
    }
  }

  const renderStep = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AI Hotlines</h2>
              <p className="text-gray-600 mb-6">
                Transform how you handle phone calls with AI that never sleeps. 
                Let's get your first hotline set up in just a few minutes.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What should we call your organization?
              </label>
              <input
                type="text"
                placeholder="Your Company Name"
                value={data.companyName || ''}
                onChange={(e) => updateData({ companyName: e.target.value })}
                className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )

      case 'use-case':
        return (
          <UseCaseSelector
            selectedUseCase={data.useCase}
            description={data.useCaseDescription}
            onSelect={(useCase, description) => updateData({ useCase, useCaseDescription: description })}
          />
        )

      case 'phone-number':
        return (
          <PhoneNumberSelector
            selectedUseCase={data.useCase}
            onNumberSelected={(number) => updateData({ phoneNumber: number.phoneNumber })}
          />
        )

      case 'ai-setup':
        return (
          <AIPersonalityBuilder
            useCase={data.useCase}
            companyName={data.companyName}
            personality={data.aiPersonality}
            welcomeMessage={data.welcomeMessage}
            onUpdate={(personality, welcomeMessage) => 
              updateData({ aiPersonality: personality, welcomeMessage })
            }
          />
        )

      case 'plan':
        return (
          <PlanSelector
            selectedPlan={data.plan}
            estimatedUsage={data.useCase}
            onSelect={(plan, billing) => updateData({ plan, billingInfo: billing })}
          />
        )

      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Setup Your Hotline</h1>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-gray-200 mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
            >
              <span>Complete Setup</span>
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}