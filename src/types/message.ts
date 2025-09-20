export interface Message {
  id: string
  conversationId: string
  phoneNumber: string
  contactName?: string
  content: string
  direction: 'inbound' | 'outbound'
  timestamp: Date
  status: 'sent' | 'delivered' | 'read' | 'failed'
  brandId: string
}

export interface Conversation {
  id: string
  phoneNumber: string
  contactName?: string
  lastMessage?: Message
  lastMessageAt: Date
  unreadCount: number
  brandId: string
}

export interface SendMessageRequest {
  to: string
  from: string
  message: string
  brandId: string
}