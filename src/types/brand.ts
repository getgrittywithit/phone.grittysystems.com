export interface Brand {
  id: string
  name: string
  icon: string
  phoneNumber: string
  phoneNumberSid?: string
  color: string
  description?: string
  aiPersonality: string
  
  // Multi-tenant support
  organizationId?: string
  type: 'personal' | 'hotline' | 'business'
  
  // Hotline-specific fields
  useCase?: 'product-review' | 'event-rsvp' | 'survey' | 'support' | 'lead-generation' | 'custom'
  isActive?: boolean
  createdAt?: Date
  
  // AI configuration
  welcomeMessage?: string
  transferNumber?: string
  
  // Analytics
  callCount?: number
  totalMinutes?: number
  lastCallAt?: Date
}

export const brands: Brand[] = [
  {
    id: 'school',
    name: 'Moses Family School',
    icon: '🎓',
    phoneNumber: '+18305005485',
    color: '#4169E1',
    description: "School communications for Levi and Lola Moses",
    aiPersonality: 'You are the school assistant for Levi and Lola Moses. You are professional, helpful, and focused on school-related matters. You take detailed notes about school communications, homework, events, and any concerns. Always confirm important information and ask for clarification when needed.',
    organizationId: 'owner',
    type: 'personal',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'triton',
    name: 'Triton Handyman',
    icon: '🔨',
    phoneNumber: '+18303577601',
    color: '#FF6B35',
    description: 'Professional handyman services',
    aiPersonality: 'Professional, helpful, and knowledgeable about home repairs and services. Always friendly and service-oriented.',
    organizationId: 'owner',
    type: 'business',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'personal',
    name: 'Moses Family',
    icon: '👤',
    phoneNumber: '+18305005487',
    color: '#9B59B6',
    description: 'Family and friends',
    aiPersonality: 'Warm, friendly, and personal. Like a helpful family assistant for the Moses family.',
    organizationId: 'owner',
    type: 'personal',
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
]