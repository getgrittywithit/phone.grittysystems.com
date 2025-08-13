'use client'

import { useState } from 'react'
import { ArrowLeft, Phone, MessageCircle, Mail, MapPin, User, Edit, Trash2, Star, StarOff, Plus, Briefcase } from 'lucide-react'
import { Contact } from '@/types/contact'
import { ContactService } from '@/lib/contacts'
import { CallButton } from './CallButton'
import { SMSDialog } from './SMSDialog'
import { brands } from '@/types/brand'
import { Button } from './ui/button'

interface ContactDetailProps {
  contact: Contact
  onBack: () => void
  onUpdate: (contact: Contact) => void
  onDelete: (contactId: string) => void
}

export function ContactDetail({ contact, onBack, onUpdate, onDelete }: ContactDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSMSDialog, setShowSMSDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details')

  const brand = brands.find(b => b.id === contact.brand_id)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
    }
    return phone
  }

  const toggleFavorite = async () => {
    setIsUpdating(true)
    const updatedContact = await ContactService.toggleFavorite(contact.id)
    if (updatedContact) {
      onUpdate(updatedContact)
    }
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      setIsUpdating(true)
      const success = await ContactService.deleteContact(contact.id)
      if (success) {
        onDelete(contact.id)
        onBack()
      }
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFavorite}
            disabled={isUpdating}
            className="text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
          >
            {contact.favorite ? (
              <Star className="w-5 h-5 fill-current" />
            ) : (
              <StarOff className="w-5 h-5" />
            )}
          </button>
          
          <button className="text-gray-600 hover:text-gray-700">
            <Edit className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contact Avatar and Name */}
      <div className="text-center py-8 border-b border-gray-100">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center text-white font-medium text-2xl mx-auto mb-4 shadow-md"
          style={{ backgroundColor: '#8B5CF6' }}
        >
          {getInitials(contact.name)}
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{contact.name}</h1>
        
        {brand && (
          <p className="text-gray-500 text-sm">
            {brand.icon} {brand.name}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around py-6 border-b border-gray-100">
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/calls/make', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: contact.phone_number,
                  from: '+18305005485'
                })
              })
            } catch (error) {
              console.error('Call failed:', error)
            }
          }}
          className="flex flex-col items-center space-y-2"
        >
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 active:bg-green-700">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-600 font-medium">Call</span>
        </button>

        <button 
          onClick={() => setShowSMSDialog(true)}
          className="flex flex-col items-center space-y-2"
        >
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-600 font-medium">Message</span>
        </button>

        {contact.email && (
          <a 
            href={`mailto:${contact.email}`}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Email</span>
          </a>
        )}
        
        <button className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 bg-gray-500 rounded-full flex items-center justify-center shadow-lg">
            <Edit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-600 font-medium">More</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'details'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'notes'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' ? (
          <div className="space-y-1">
            {/* Company */}
            {contact.company && (
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{contact.company}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role */}
            {contact.company && (
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">-</p>
                  </div>
                </div>
              </div>
            )}

            {/* Phone - Mobile */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium text-gray-900">{formatPhoneNumber(contact.phone_number)}</p>
                </div>
              </div>
            </div>

            {/* Phone - Work */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Work</p>
                  <p className="font-medium text-gray-900">-</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{contact.email || '-'}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{contact.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="px-4 py-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Created by Claude Code</p>
              <p className="text-xs text-gray-500">Access: Owner</p>
            </div>

            {/* Add Property Button */}
            <div className="px-4 py-6">
              <button className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Property</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {contact.notes ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{contact.notes}</p>
                </div>
                <button className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Note</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Edit className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add notes about this contact
                </p>
                <button className="flex items-center space-x-2 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Note</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SMS Dialog */}
      {showSMSDialog && (
        <SMSDialog
          toNumber={contact.phone_number}
          fromNumber="+18305005485"
        />
      )}
    </div>
  )
}