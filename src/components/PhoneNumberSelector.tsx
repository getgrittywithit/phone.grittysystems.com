'use client'

import { useState, useEffect } from 'react'
import { Phone, Search, MapPin, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AvailableNumber {
  phoneNumber: string
  friendlyName: string
  locality: string
  region: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
}

interface PhoneNumberSelectorProps {
  onNumberSelected: (number: AvailableNumber) => void
  selectedUseCase?: string
  organizationId?: string
}

export function PhoneNumberSelector({ onNumberSelected, selectedUseCase }: PhoneNumberSelectorProps) {
  const [searchParams, setSearchParams] = useState({
    areaCode: '',
    contains: '',
    locality: '',
    type: 'local' as 'local' | 'toll-free'
  })
  
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const popularAreaCodes = [
    { code: '212', city: 'New York, NY' },
    { code: '310', city: 'Los Angeles, CA' },
    { code: '312', city: 'Chicago, IL' },
    { code: '713', city: 'Houston, TX' },
    { code: '404', city: 'Atlanta, GA' },
    { code: '617', city: 'Boston, MA' },
    { code: '415', city: 'San Francisco, CA' },
    { code: '305', city: 'Miami, FL' },
  ]

  const searchNumbers = async () => {
    if (!searchParams.areaCode && !searchParams.contains && searchParams.type === 'local') {
      setError('Please enter an area code or number pattern to search')
      return
    }

    setIsSearching(true)
    setError('')
    
    try {
      const response = await fetch('/api/phone-numbers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      })

      const result = await response.json()

      if (result.success) {
        setAvailableNumbers(result.numbers)
        setHasSearched(true)
        if (result.numbers.length === 0) {
          setError('No available numbers found. Try a different area code or search criteria.')
        }
      } else {
        setError(result.error || 'Failed to search numbers')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectNumber = (number: AvailableNumber) => {
    setSelectedNumber(number)
    onNumberSelected(number)
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phoneNumber
  }

  const getUseCaseExample = () => {
    switch (selectedUseCase) {
      case 'product-review':
        return 'Perfect for collecting customer feedback about your products'
      case 'event-rsvp':
        return 'Great for event attendees to quickly RSVP'
      case 'survey':
        return 'Ideal for conducting phone surveys and research'
      case 'support':
        return 'Excellent for providing 24/7 customer support'
      default:
        return 'Your AI assistant will handle calls professionally'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Phone Number</h2>
        <p className="text-gray-600">
          Select a phone number for your AI hotline. {getUseCaseExample()}.
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="local"
              name="numberType"
              checked={searchParams.type === 'local'}
              onChange={() => setSearchParams(prev => ({ ...prev, type: 'local' }))}
              className="text-blue-600"
            />
            <label htmlFor="local" className="text-sm font-medium">Local Number</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="toll-free"
              name="numberType"
              checked={searchParams.type === 'toll-free'}
              onChange={() => setSearchParams(prev => ({ ...prev, type: 'toll-free' }))}
              className="text-blue-600"
            />
            <label htmlFor="toll-free" className="text-sm font-medium">Toll-Free Number</label>
          </div>
        </div>

        {searchParams.type === 'local' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Code</label>
                <input
                  type="text"
                  placeholder="e.g. 415"
                  maxLength={3}
                  value={searchParams.areaCode}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, areaCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contains (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1234"
                  value={searchParams.contains}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, contains: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco"
                  value={searchParams.locality}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, locality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Popular Area Codes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Popular Area Codes</label>
              <div className="flex flex-wrap gap-2">
                {popularAreaCodes.map((area) => (
                  <button
                    key={area.code}
                    onClick={() => setSearchParams(prev => ({ ...prev, areaCode: area.code }))}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {area.code} - {area.city}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Button
          onClick={searchNumbers}
          disabled={isSearching}
          className="flex items-center space-x-2"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>{isSearching ? 'Searching...' : 'Search Available Numbers'}</span>
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {hasSearched && availableNumbers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Numbers</h3>
          
          <div className="space-y-3">
            {availableNumbers.map((number, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedNumber?.phoneNumber === number.phoneNumber
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => selectNumber(number)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {formatPhoneNumber(number.phoneNumber)}
                      </p>
                      {number.locality && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {number.locality}, {number.region}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${searchParams.type === 'toll-free' ? '2.00' : '1.00'}/month
                      </p>
                      <p className="text-xs text-gray-500">
                        {searchParams.type === 'toll-free' ? 'Toll-free' : 'Local number'}
                      </p>
                    </div>
                    
                    {selectedNumber?.phoneNumber === number.phoneNumber && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedNumber && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <Check className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Selected: {formatPhoneNumber(selectedNumber.phoneNumber)}
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                This number will be reserved for your AI hotline. You'll be charged ${searchParams.type === 'toll-free' ? '$2.00' : '$1.00'}/month plus usage.
              </p>
            </div>
          )}
        </div>
      )}

      {hasSearched && availableNumbers.length === 0 && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Numbers Available</h3>
          <p className="text-gray-600 mb-4">
            No numbers were found matching your criteria. Try searching with different parameters.
          </p>
          <Button variant="outline" onClick={() => setHasSearched(false)}>
            Search Again
          </Button>
        </div>
      )}
    </div>
  )
}