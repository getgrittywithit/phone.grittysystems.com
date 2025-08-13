export interface Brand {
  id: string
  name: string
  icon: string
  phoneNumber: string
  color: string
  description?: string
  aiPersonality: string
}

export const brands: Brand[] = [
  {
    id: 'triton',
    name: 'Triton Handyman',
    icon: '🔨',
    phoneNumber: '+18305005485',
    color: '#FF6B35',
    description: 'Professional handyman services',
    aiPersonality: 'Professional, helpful, and knowledgeable about home repairs and services. Always friendly and service-oriented.'
  },
  {
    id: 'school',
    name: 'School Contact',
    icon: '🎓',
    phoneNumber: '+18305005485',
    color: '#4169E1',
    description: "Kids' school communications",
    aiPersonality: 'Professional and informative about school matters. Parent-friendly and focused on student well-being.'
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: '👤',
    phoneNumber: '+18305005485',
    color: '#9B59B6',
    description: 'Family and friends',
    aiPersonality: 'Warm, friendly, and personal. Like a helpful family assistant.'
  }
]