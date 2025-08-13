'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CallButtonProps {
  toNumber: string
  fromNumber: string
  label?: string
}

export function CallButton({ toNumber, fromNumber, label = "Call" }: CallButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const makeCall = async () => {
    setIsLoading(true)
    setStatus('Initiating call...')

    try {
      const response = await fetch('/api/calls/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toNumber,
          from: fromNumber,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus('Call initiated! Check your phone.')
        setTimeout(() => setStatus(''), 3000)
      } else {
        setStatus(`Error: ${result.error}`)
        setTimeout(() => setStatus(''), 5000)
      }
    } catch (error) {
      setStatus('Failed to make call')
      setTimeout(() => setStatus(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={makeCall}
        disabled={isLoading}
        variant="success"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Phone className="w-4 h-4" />
        <span>{isLoading ? 'Calling...' : label}</span>
      </Button>
      {status && (
        <p className={`text-xs ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </p>
      )}
    </div>
  )
}