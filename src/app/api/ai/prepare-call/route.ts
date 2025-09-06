import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

interface CallTodoItem {
  id: string
  task: string
  completed: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { messages, brandId } = await request.json()

    const brand = brands.find(b => b.id === brandId) || brands[0]

    const systemPrompt = `You are an AI assistant helping to prepare for a phone call. 
    
    The user is making a call on behalf of ${brand.name}${brand.type ? ` (${brand.type})` : ''}.
    ${brand.description}
    
    Your role is to:
    1. Understand the purpose and context of the call
    2. Ask clarifying questions if needed
    3. Generate a todo list of objectives for the call
    4. Create a context summary for the AI that will handle the actual call
    
    When generating the todo list, create specific, actionable items that the AI should accomplish during the call.
    
    Format your response as a JSON object with these fields:
    - response: Your conversational response to the user
    - todoList: Array of {id: string, task: string, completed: false}
    - callContext: A detailed context summary for the AI agent (only provide this when you have enough information)
    
    Example:
    {
      "response": "I understand you want to schedule a parent-teacher conference...",
      "todoList": [
        {"id": "1", "task": "Confirm available dates for the conference", "completed": false},
        {"id": "2", "task": "Ask about specific concerns to discuss", "completed": false}
      ],
      "callContext": "Calling to schedule a parent-teacher conference for [student name]..."
    }`

    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    const response = await ClaudeService.generateResponse(
      conversationHistory[conversationHistory.length - 1].content,
      {
        phoneNumber: brand.phoneNumber,
        contactName: 'User',
        conversationHistory: conversationHistory.slice(0, -1).map((msg: any) => msg.content),
        agentPersonality: brand.aiPersonality
      }
    )

    try {
      const parsedResponse = JSON.parse(response.response)
      
      return NextResponse.json({
        success: true,
        response: parsedResponse.response,
        todoList: parsedResponse.todoList || [],
        callContext: parsedResponse.callContext || ''
      })
    } catch (parseError) {
      return NextResponse.json({
        success: true,
        response: response.response,
        todoList: [],
        callContext: ''
      })
    }
  } catch (error) {
    console.error('Error preparing call:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to prepare call context' },
      { status: 500 }
    )
  }
}