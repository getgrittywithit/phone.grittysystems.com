'use client'

import { useState } from 'react'
import { Check, Phone, Clock, Zap, Crown, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLAN_PRICING } from '@/types/organization'

interface Plan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    annual: number
  }
  features: string[]
  limits: {
    phoneNumbers: number
    monthlyMinutes: number
    hotlines: number
  }
  icon: any
  color: string
  popular?: boolean
  recommended?: boolean
}

interface PlanSelectorProps {
  selectedPlan?: string
  estimatedUsage?: string
  onSelect: (plan: string, billingInfo: any) => void
}

export function PlanSelector({ selectedPlan, estimatedUsage, onSelect }: PlanSelectorProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [showCalculator, setShowCalculator] = useState(false)

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses and personal projects',
      price: PLAN_PRICING.starter,
      features: [
        '1 AI hotline number',
        '200 minutes included',
        'Basic AI responses',
        'Call analytics dashboard',
        'Email summaries',
        'Custom greetings'
      ],
      limits: {
        phoneNumbers: 1,
        monthlyMinutes: 200,
        hotlines: 1
      },
      icon: Phone,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Great for growing companies with multiple needs',
      price: PLAN_PRICING.business,
      features: [
        '3 AI hotline numbers',
        '800 minutes included',
        'Advanced AI with custom training',
        'Real-time dashboard',
        'Webhook integrations',
        'Custom greetings & flows',
        'Priority support',
        'Call forwarding'
      ],
      limits: {
        phoneNumbers: 3,
        monthlyMinutes: 800,
        hotlines: 3
      },
      icon: Zap,
      color: 'from-purple-400 to-purple-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with complex requirements',
      price: PLAN_PRICING.enterprise,
      features: [
        'Unlimited hotlines',
        '2,000 minutes included',
        'White-label solution',
        'API access',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated success manager',
        'SLA guarantees'
      ],
      limits: {
        phoneNumbers: -1,
        monthlyMinutes: 2000,
        hotlines: -1
      },
      icon: Crown,
      color: 'from-gold-400 to-gold-600'
    }
  ]

  const getRecommendedPlan = () => {
    const usageMap = {
      'product-review': 'starter', // 50-200 calls
      'event-rsvp': 'starter',     // 20-100 calls  
      'survey': 'business',        // 100-500 calls
      'support': 'business',       // 200-1000 calls
      'lead-generation': 'business' // 100-300 calls
    }
    
    return usageMap[estimatedUsage as keyof typeof usageMap] || 'starter'
  }

  const recommendedPlanId = getRecommendedPlan()

  const handleSelectPlan = (plan: Plan) => {
    const billingInfo = {
      planId: plan.id,
      billingCycle,
      price: plan.price[billingCycle],
      limits: plan.limits
    }
    
    onSelect(plan.id, billingInfo)
  }

  const getSavingsPercentage = (plan: Plan) => {
    const monthly = plan.price.monthly * 12
    const annual = plan.price.annual
    return Math.round((monthly - annual) / monthly * 100)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">
          Select a plan that fits your expected call volume. You can change or cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all relative ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annual
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.id
          const isRecommended = plan.id === recommendedPlanId
          const price = plan.price[billingCycle]
          const savings = getSavingsPercentage(plan)
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg border-2 p-6 transition-all ${
                isSelected
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isRecommended ? 'ring-2 ring-blue-200' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              {isRecommended && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} mx-auto mb-4 flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">${price}</span>
                  <span className="text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                
                {billingCycle === 'annual' && savings > 0 && (
                  <div className="text-green-600 text-sm font-medium">
                    Save {savings}% vs monthly
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">Includes:</div>
                  <div className="space-y-1">
                    <div>• {plan.limits.phoneNumbers === -1 ? 'Unlimited' : plan.limits.phoneNumbers} phone number{plan.limits.phoneNumbers !== 1 ? 's' : ''}</div>
                    <div>• {plan.limits.monthlyMinutes.toLocaleString()} minutes/month</div>
                    <div>• {plan.limits.hotlines === -1 ? 'Unlimited' : plan.limits.hotlines} hotline{plan.limits.hotlines !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full ${
                  isSelected
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isSelected ? 'Selected' : 'Choose Plan'}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Usage Calculator */}
      <div className="text-center">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center mx-auto"
        >
          <Calculator className="w-4 h-4 mr-1" />
          Calculate my estimated costs
        </button>
      </div>

      {showCalculator && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Expected calls per month:</label>
              <input
                type="number"
                placeholder="e.g. 100"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Average call length (minutes):</label>
              <input
                type="number"
                placeholder="e.g. 3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
            <div className="text-sm text-gray-600">
              <div>Estimated monthly minutes: <span className="font-medium">300</span></div>
              <div>Recommended plan: <span className="font-medium text-blue-600">Business</span></div>
              <div>Overage cost: <span className="font-medium">$5.00</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center text-green-800">
            <Check className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {plans.find(p => p.id === selectedPlan)?.name} Plan Selected
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            You'll be charged ${plans.find(p => p.id === selectedPlan)?.price[billingCycle]} {billingCycle === 'annual' ? 'per year' : 'per month'}.
            You can cancel or change your plan anytime.
          </p>
        </div>
      )}
    </div>
  )
}