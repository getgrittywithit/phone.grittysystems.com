'use client'

import { useState } from 'react'
import { Phone, Send, MessageSquare, CheckSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CallTodoItem {
  id: string
  task: string
  completed: boolean
}

interface AIPhoneCallAssistantProps {
  toNumber: string
  fromNumber: string
  brandId?: string
}

export function AIPhoneCallAssistant({ toNumber, fromNumber, brandId }: AIPhoneCallAssistantProps) {
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [todoList, setTodoList] = useState<CallTodoItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [callContext, setCallContext] = useState('')
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState('')

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setConversation(prev => [...prev, { role: 'user', content: userMessage }])
    setIsProcessing(true)

    try {
      const response = await fetch('/api/ai/prepare-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...conversation, { role: 'user', content: userMessage }],
          brandId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConversation(prev => [...prev, { role: 'assistant', content: result.response }])
        
        if (result.todoList && result.todoList.length > 0) {
          setTodoList(result.todoList)
        }
        
        if (result.callContext) {
          setCallContext(result.callContext)
        }
      }
    } catch (error) {
      console.error('Error processing message:', error)
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const makeCall = async () => {
    setIsCallActive(true)
    setCallStatus('Initiating call...')

    try {
      const response = await fetch('/api/calls/make-with-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toNumber,
          from: fromNumber,
          context: callContext,
          todoList: todoList,
          brandId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCallStatus('Call initiated! The AI will handle the conversation based on your briefing.')
      } else {
        setCallStatus(`Error: ${result.error}`)
      }
    } catch (error) {
      setCallStatus('Failed to make call')
    }
  }

  const toggleTodoItem = (id: string) => {
    setTodoList(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto p-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Pre-Call Briefing
        </h3>
        
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {conversation.length === 0 && (
            <p className="text-gray-500 italic">
              Tell me about the call you want to make. What's the purpose, who are you calling, and what do you need to accomplish?
            </p>
          )}
          
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-100 ml-8' 
                  : 'bg-white border border-gray-200 mr-8'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex items-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Describe your call..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <Button
            onClick={sendMessage}
            disabled={isProcessing || !currentMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {todoList.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2" />
            Call Objectives
          </h3>
          
          <ul className="space-y-2">
            {todoList.map((item) => (
              <li
                key={item.id}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => toggleTodoItem(item.id)}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="rounded"
                />
                <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                  {item.task}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={makeCall}
          disabled={!callContext || isCallActive}
          variant="success"
          size="lg"
          className="flex items-center space-x-2"
        >
          <Phone className="w-5 h-5" />
          <span>{isCallActive ? 'Call in Progress...' : 'Make AI Call'}</span>
        </Button>
        
        {callStatus && (
          <p className={`text-sm ${callStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {callStatus}
          </p>
        )}
        
        <p className="text-xs text-gray-500">
          Calling: {toNumber}
        </p>
      </div>
    </div>
  )
}