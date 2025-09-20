import { supabase } from '@/lib/supabase'
import { Conversation, Message } from '@/types/message'

export class MessageService {
  
  static async getConversations(brandId: string): Promise<Conversation[]> {
    try {
      // Get SMS conversations with their latest message
      const { data: conversations, error } = await supabase
        .from('sms_conversations')
        .select(`
          id,
          phone_number,
          contact_name,
          brand_id,
          last_message_at,
          unread_count,
          created_at,
          updated_at
        `)
        .eq('brand_id', brandId)
        .order('last_message_at', { ascending: false })

      if (error) {
        console.error('Error fetching SMS conversations:', error)
        return []
      }

      // Get the latest message for each conversation
      const conversationsWithMessages: Conversation[] = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: latestMessage } = await supabase
            .from('sms_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            id: conv.id,
            phoneNumber: conv.phone_number,
            contactName: conv.contact_name,
            lastMessage: latestMessage ? {
              id: latestMessage.id,
              conversationId: latestMessage.conversation_id,
              phoneNumber: latestMessage.phone_number,
              contactName: latestMessage.contact_name,
              content: latestMessage.content,
              direction: latestMessage.direction as 'inbound' | 'outbound',
              timestamp: new Date(latestMessage.created_at),
              status: latestMessage.status as 'sent' | 'delivered' | 'read' | 'failed',
              brandId: latestMessage.brand_id
            } : undefined,
            lastMessageAt: new Date(conv.last_message_at),
            unreadCount: conv.unread_count,
            brandId: conv.brand_id
          }
        })
      )

      return conversationsWithMessages
    } catch (error) {
      console.error('Error in getConversations:', error)
      return []
    }
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching SMS messages:', error)
        return []
      }

      return (messages || []).map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        phoneNumber: msg.phone_number,
        contactName: msg.contact_name,
        content: msg.content,
        direction: msg.direction as 'inbound' | 'outbound',
        timestamp: new Date(msg.created_at),
        status: msg.status as 'sent' | 'delivered' | 'read' | 'failed',
        brandId: msg.brand_id
      }))
    } catch (error) {
      console.error('Error in getMessages:', error)
      return []
    }
  }

  static async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await supabase
        .from('sms_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)
    } catch (error) {
      console.error('Error marking SMS conversation as read:', error)
    }
  }
}