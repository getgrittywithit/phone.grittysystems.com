'use client'

import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SMSDialogProps {
  toNumber: string
  fromNumber: string
  onMessageSent?: () => void
}

export function SMSDialog({ toNumber, fromNumber, onMessageSent }: SMSDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const sendSMS = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    setStatus('Sending...')

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toNumber,
          from: fromNumber,
          message: message.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus('Message sent!')
        setMessage('')
        onMessageSent?.() // Call the callback to refresh conversations
        setTimeout(() => {
          setStatus('')
          setIsOpen(false)
        }, 2000)
      } else {
        setStatus(`Error: ${result.error}`)
        setTimeout(() => setStatus(''), 5000)
      }
    } catch (error) {
      setStatus('Failed to send message')
      setTimeout(() => setStatus(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Text</span>
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Send SMS</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            To: {toNumber}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            From: {fromNumber}
          </p>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {message.length}/160 characters
          </p>
        </div>

        {status && (
          <p className={`text-sm mb-4 ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {status}
          </p>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={sendSMS}
            disabled={isLoading || !message.trim()}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Sending...' : 'Send'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}