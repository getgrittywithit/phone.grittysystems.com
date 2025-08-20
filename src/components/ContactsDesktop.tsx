'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Mail, Plus, Search, Filter, Edit, Trash2, Star, User, Building, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactService } from '@/lib/contacts'
import { Contact } from '@/types/contact'
import { CallButton } from './CallButton'
import { SMSDialog } from './SMSDialog'
import { brands } from '@/types/brand'

export function ContactsDesktop() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setIsLoading(true)
    try {
      const allContacts = await ContactService.getAllContacts()
      setContacts(allContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactUpdate = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c))
    setSelectedContact(updatedContact)
  }

  const handleContactDelete = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
    if (selectedContact?.id === contactId) {
      setSelectedContact(null)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await ContactService.searchContacts(query)
      setContacts(results)
    } else {
      loadContacts()
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone_number.includes(searchQuery) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
    }
    return phone
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getBrandColor = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId)
    return brand?.id === 'triton' ? '#1e3a8a' : 
           brand?.id === 'school' ? '#1e40af' : '#3b82f6'
  }

  const toggleFavorite = async (contact: Contact) => {
    const updatedContact = await ContactService.toggleFavorite(contact.id)
    if (updatedContact) {
      handleContactUpdate(updatedContact)
    }
  }

  return (
    <div className="h-full flex bg-[var(--background)]">
      {/* Contacts List Panel */}
      <div className="w-96 border-r border-[var(--border)] flex flex-col bg-[var(--card-bg)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Contacts</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[var(--text-muted)]">{filteredContacts.length}</span>
              <Button variant="outline" size="sm" className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] border-[var(--primary)]">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <button className="flex items-center text-sm text-[var(--foreground)] hover:bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              Source <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center text-sm text-[var(--foreground)] hover:bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              Creator <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center text-sm text-[var(--foreground)] hover:bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              Company <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[var(--text-muted)] bg-[var(--background)] px-1 rounded border border-[var(--border)]">⌘ K</span>
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-16 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : filteredContacts.length > 0 ? (
            <div>
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 hover:bg-[var(--background)] cursor-pointer border-b border-[var(--border)] transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-[var(--background)]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input type="checkbox" className="w-4 h-4 rounded border border-[var(--border)] mr-3" />
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0"
                      style={{ backgroundColor: getBrandColor(contact.brand_id || 'default') }}
                    >
                      {getInitials(contact.name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[var(--foreground)] truncate text-sm">{contact.name}</h4>
                        {contact.company && (
                          <span className="text-xs text-[var(--text-muted)] truncate ml-2">{contact.company}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-8">
              <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                {searchQuery ? 'No contacts found' : 'No contacts yet'}
              </h3>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Add contacts to get started'}
              </p>
              <Button 
                onClick={() => setShowAddContact(true)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details Panel */}
      <div className="flex-1 flex flex-col bg-[var(--card-bg)]">
        {selectedContact ? (
          <div className="h-full flex flex-col">
            {/* Contact Header */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={selectedContact.name}
                  className="text-2xl font-bold text-[var(--foreground)] bg-transparent border-none focus:outline-none"
                  readOnly
                />
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-[var(--foreground)]" />
                  </button>
                  <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                    <MessageCircle className="w-5 h-5 text-[var(--foreground)]" />
                  </button>
                  <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                    <Mail className="w-5 h-5 text-[var(--foreground)]" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Company</label>
                  <input
                    type="text"
                    value={selectedContact.company || 'Set a company'}
                    className="w-full text-sm text-[var(--foreground)] bg-transparent border-none focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Role</label>
                  <input
                    type="text"
                    placeholder="Set a role"
                    className="w-full text-sm text-[var(--foreground)] bg-transparent border-none focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Phone</label>
                  <input
                    type="text"
                    value={formatPhoneNumber(selectedContact.phone_number)}
                    className="w-full text-sm text-[var(--foreground)] bg-transparent border-none focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedContact.email || 'Set an email...'}
                    className="w-full text-sm text-[var(--foreground)] bg-transparent border-none focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Address</label>
                  <input
                    type="text"
                    value={selectedContact.address || 'Set an address...'}
                    className="w-full text-sm text-[var(--foreground)] bg-transparent border-none focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Access</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[var(--foreground)]">Everyone</span>
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Add a property
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Notes</label>
                  <span className="text-xs text-[var(--text-muted)]">0</span>
                </div>
                <div className="bg-[var(--background)] rounded-lg p-4 min-h-[200px] border border-[var(--border)]">
                  <textarea
                    placeholder="Write a note..."
                    className="w-full h-full bg-transparent border-none focus:outline-none text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] resize-none"
                    value={selectedContact.notes || ''}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">No contact selected</h3>
            <p className="text-[var(--text-muted)]">
              Choose a contact from the list to view their details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}