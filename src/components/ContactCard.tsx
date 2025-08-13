'use client'

import { useState } from 'react'
import { Phone, MessageCircle, Star, StarOff, User, Building, Mail } from 'lucide-react'
import { Contact } from '@/types/contact'
import { ContactService } from '@/lib/contacts'
import { CallButton } from './CallButton'
import { SMSDialog } from './SMSDialog'

interface ContactCardProps {
  contact: Contact
  onUpdate: (contact: Contact) => void
}

export function ContactCard({ contact, onUpdate }: ContactCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleFavorite = async () => {
    setIsUpdating(true)
    const updatedContact = await ContactService.toggleFavorite(contact.id)
    if (updatedContact) {
      onUpdate(updatedContact)
    }
    setIsUpdating(false)
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
    }
    return phone
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium text-gray-900">{contact.name}</h3>
            <button
              onClick={toggleFavorite}
              disabled={isUpdating}
              className="text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
            >
              {contact.favorite ? (
                <Star className="w-4 h-4 fill-current" />
              ) : (
                <StarOff className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-3 h-3" />
              <span>{formatPhoneNumber(contact.phone_number)}</span>
            </div>
            
            {contact.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3" />
                <span>{contact.email}</span>
              </div>
            )}
            
            {contact.company && (
              <div className="flex items-center space-x-2">
                <Building className="w-3 h-3" />
                <span>{contact.company}</span>
              </div>
            )}
          </div>
          
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {contact.notes && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {contact.notes}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2 pt-3 border-t border-gray-100">
        <CallButton
          toNumber={contact.phone_number}
          fromNumber="+18305005485" // Your Twilio number
          label="Call"
        />
        <SMSDialog
          toNumber={contact.phone_number}
          fromNumber="+18305005485"
        />
      </div>
    </div>
  )
}