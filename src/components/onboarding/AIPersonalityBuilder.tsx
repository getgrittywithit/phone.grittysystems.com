'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Volume2, Wand2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIPersonalityBuilderProps {
  useCase?: string
  companyName?: string
  personality?: string
  welcomeMessage?: string
  onUpdate: (personality: string, welcomeMessage: string) => void
}

export function AIPersonalityBuilder({ 
  useCase, 
  companyName, 
  personality: initialPersonality, 
  welcomeMessage: initialWelcomeMessage, 
  onUpdate 
}: AIPersonalityBuilderProps) {
  const [personality, setPersonality] = useState(initialPersonality || '')
  const [welcomeMessage, setWelcomeMessage] = useState(initialWelcomeMessage || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [tone, setTone] = useState('professional')
  const [style, setStyle] = useState('helpful')

  const toneOptions = [
    { id: 'professional', name: 'Professional', description: 'Business-like and formal' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
    { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic and positive' }
  ]

  const styleOptions = [
    { id: 'helpful', name: 'Helpful', description: 'Focuses on solving problems' },
    { id: 'informative', name: 'Informative', description: 'Provides detailed information' },
    { id: 'concise', name: 'Concise', description: 'Gets straight to the point' },
    { id: 'patient', name: 'Patient', description: 'Takes time to understand' }
  ]

  const generatePersonality = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCase,
          companyName,
          tone,
          style
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setPersonality(result.personality)
        setWelcomeMessage(result.welcomeMessage)
        onUpdate(result.personality, result.welcomeMessage)
      }
    } catch (error) {
      console.error('Error generating personality:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (!personality && useCase && companyName) {
      generatePersonality()
    }
  }, [useCase, companyName])

  useEffect(() => {
    onUpdate(personality, welcomeMessage)
  }, [personality, welcomeMessage])

  const getUseCaseExamples = () => {
    const examples = {
      'product-review': [
        'Thank you for calling our feedback line. I\'d love to hear about your experience with our product.',
        'Hi! I\'m here to collect your valuable feedback about our service. How was your experience?',
        'Thanks for calling! Your opinion matters to us. What would you like to share about your recent purchase?'
      ],
      'event-rsvp': [
        'Hello! I\'m here to help with your event RSVP. Will you be able to join us?',
        'Hi there! Calling to confirm your attendance at our upcoming event?',
        'Thanks for calling! I can help you RSVP and answer any questions about the event.'
      ],
      'survey': [
        'Hello! Thank you for participating in our survey. This will only take a few minutes.',
        'Hi! I\'m conducting a brief survey and would appreciate your input.',
        'Thanks for your time! I have a few quick questions for our research study.'
      ],
      'support': [
        'Hello! I\'m here to help with any questions or issues you might have.',
        'Hi! How can I assist you today? I\'m here to help solve any problems.',
        'Thanks for calling our support line. What can I help you with?'
      ],
      'lead-generation': [
        'Hello! I understand you\'re interested in our services. I\'d love to learn more about your needs.',
        'Hi there! I\'m here to help you find the perfect solution for your requirements.',
        'Thanks for your interest! I can provide information and help you get started.'
      ]
    }
    
    return examples[useCase as keyof typeof examples] || []
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your AI Assistant</h2>
        <p className="text-gray-600">
          Customize how your AI will sound and behave when talking to callers.
        </p>
      </div>

      {/* Tone and Style Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tone of Voice
          </label>
          <div className="space-y-2">
            {toneOptions.map((option) => (
              <label
                key={option.id}
                className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                  tone === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={option.id}
                  checked={tone === option.id}
                  onChange={(e) => setTone(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  {tone === option.id && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Communication Style
          </label>
          <div className="space-y-2">
            {styleOptions.map((option) => (
              <label
                key={option.id}
                className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                  style === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={option.id}
                  checked={style === option.id}
                  onChange={(e) => setStyle(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  {style === option.id && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={generatePersonality}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          <span>{isGenerating ? 'Generating...' : 'Generate AI Personality'}</span>
        </Button>
      </div>

      {/* Welcome Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Welcome Message
        </label>
        <textarea
          rows={3}
          placeholder="What should your AI say when someone calls?"
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {getUseCaseExamples().length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-2">Example messages for your use case:</div>
            <div className="space-y-1">
              {getUseCaseExamples().slice(0, 2).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setWelcomeMessage(example)}
                  className="block text-left text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded w-full transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Personality Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Personality & Instructions
        </label>
        <textarea
          rows={6}
          placeholder="Detailed instructions for how your AI should behave..."
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          These instructions tell your AI how to behave, what information to collect, and how to respond to different situations.
        </p>
      </div>

      {/* Preview */}
      {welcomeMessage && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Volume2 className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Preview</span>
          </div>
          <div className="bg-white border border-gray-200 rounded p-3">
            <p className="text-sm text-gray-900 italic">"{welcomeMessage}"</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This is what callers will hear when they first call your hotline.
          </p>
        </div>
      )}
    </div>
  )
}