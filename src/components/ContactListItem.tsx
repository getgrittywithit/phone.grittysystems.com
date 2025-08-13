'use client'

import { Contact } from '@/types/contact'
import { brands } from '@/types/brand'

interface ContactListItemProps {
  contact: Contact
  onClick: () => void
}

export function ContactListItem({ contact, onClick }: ContactListItemProps) {
  // Generate letter icon from contact name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Get brand info for color
  const brand = brands.find(b => b.id === contact.brand_id)
  const brandColor = brand?.id === 'triton' ? '#FF6B35' : 
                     brand?.id === 'school' ? '#3B82F6' : '#6B7280'

  return (
    <div 
      onClick={onClick}
      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      {/* Letter icon */}
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3 flex-shrink-0"
        style={{ backgroundColor: brandColor }}
      >
        {getInitials(contact.name)}
      </div>
      
      {/* Contact info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
          {/* Small brand badge */}
          {brand && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {brand.icon}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{contact.phone_number}</p>
      </div>
    </div>
  )
}