'use client'

import { useState } from 'react'
import { Star, Calendar, MessageCircle, HeadphonesIcon, TrendingUp, Settings } from 'lucide-react'

interface UseCase {
  id: string
  name: string
  description: string
  icon: any
  color: string
  examples: string[]
  expectedCalls: string
}

interface UseCaseSelectorProps {
  selectedUseCase?: string
  description?: string
  onSelect: (useCase: string, description: string) => void
}

export function UseCaseSelector({ selectedUseCase, description, onSelect }: UseCaseSelectorProps) {
  const [customDescription, setCustomDescription] = useState(description || '')

  const useCases: UseCase[] = [
    {
      id: 'product-review',
      name: 'Product Reviews & Feedback',
      description: 'Collect customer feedback about your products or services',
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      examples: [
        'Post-purchase satisfaction surveys',
        'Product quality feedback',
        'Service experience reviews',
        'Feature requests and suggestions'
      ],
      expectedCalls: '50-200 calls/month'
    },
    {
      id: 'event-rsvp',
      name: 'Event RSVP & Info',
      description: 'Handle event registrations and answer questions',
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
      examples: [
        'Wedding RSVPs',
        'Conference registrations',
        'Party confirmations',
        'Event information requests'
      ],
      expectedCalls: '20-100 calls/month'
    },
    {
      id: 'survey',
      name: 'Surveys & Research',
      description: 'Conduct phone surveys and collect research data',
      icon: MessageCircle,
      color: 'from-green-400 to-green-600',
      examples: [
        'Market research surveys',
        'Customer satisfaction studies',
        'Political polling',
        'Academic research'
      ],
      expectedCalls: '100-500 calls/month'
    },
    {
      id: 'support',
      name: 'Customer Support',
      description: '24/7 customer support and basic troubleshooting',
      icon: HeadphonesIcon,
      color: 'from-purple-400 to-purple-600',
      examples: [
        'Basic troubleshooting',
        'Account questions',
        'Business hours information',
        'Appointment scheduling'
      ],
      expectedCalls: '200-1000 calls/month'
    },
    {
      id: 'lead-generation',
      name: 'Lead Generation',
      description: 'Qualify leads and collect contact information',
      icon: TrendingUp,
      color: 'from-red-400 to-red-600',
      examples: [
        'Real estate inquiries',
        'Service requests',
        'Quote requests',
        'Appointment booking'
      ],
      expectedCalls: '100-300 calls/month'
    },
    {
      id: 'custom',
      name: 'Custom Use Case',
      description: 'Tell us exactly what you need',
      icon: Settings,
      color: 'from-gray-400 to-gray-600',
      examples: [
        'Unique business needs',
        'Specialized workflows',
        'Custom integrations',
        'Specific industry requirements'
      ],
      expectedCalls: 'Variable'
    }
  ]

  const handleSelect = (useCase: UseCase) => {
    const desc = useCase.id === 'custom' ? customDescription : useCase.description
    onSelect(useCase.id, desc)
  }

  const selectedCase = useCases.find(uc => uc.id === selectedUseCase)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What will your hotline do?</h2>
        <p className="text-gray-600">
          Choose the use case that best matches your needs. This helps us configure your AI assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {useCases.map((useCase) => {
          const Icon = useCase.icon
          const isSelected = selectedUseCase === useCase.id
          
          return (
            <div
              key={useCase.id}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(useCase)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {useCase.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {useCase.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium">
                      Expected volume: {useCase.expectedCalls}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <div className="font-medium mb-1">Common uses:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {useCase.examples.slice(0, 2).map((example, idx) => (
                          <li key={idx}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedUseCase === 'custom' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your specific use case
          </label>
          <textarea
            rows={4}
            placeholder="Tell us exactly what you want your AI hotline to do..."
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Be as specific as possible. This helps us create the perfect AI personality for your needs.
          </p>
        </div>
      )}

      {selectedCase && selectedCase.id !== 'custom' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            What your AI will be great at:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {selectedCase.examples.map((example, idx) => (
              <li key={idx} className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}