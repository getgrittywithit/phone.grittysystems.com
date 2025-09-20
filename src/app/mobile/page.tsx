'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Users, Activity, ChevronDown, Plus, Home, Search, Filter, Check, PhoneCall, PhoneOff } from 'lucide-react'
import { useVoiceCalling } from '@/hooks/useVoiceCalling'
import { Button } from '@/components/ui/button'
import { brands, Brand } from '@/types/brand'
import { CallButton } from '@/components/CallButton'
import { SMSDialog } from '@/components/SMSDialog'
import { ContactCard } from '@/components/ContactCard'
import { ContactListItem } from '@/components/ContactListItem'
import { ContactDetail } from '@/components/ContactDetail'
import { ContactService } from '@/lib/contacts'
import { Contact } from '@/types/contact'
import { Message, Conversation } from '@/types/message'
import { MessageService } from '@/lib/messages'

export default function MobileApp() {
  const [activeBrand, setActiveBrand] = useState<Brand>(brands[0])
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'keypad' | 'contacts' | 'activity'>('home')
  const [showBrandSwitcher, setShowBrandSwitcher] = useState(false)
  const [activeHomeTab, setActiveHomeTab] = useState<'all' | 'calls' | 'messages'>('all')
  
  // Contact state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  
  // Keypad state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isDialing, setIsDialing] = useState(false)
  
  // UI state
  const [showAddContact, setShowAddContact] = useState(false)
  const [callMode, setCallMode] = useState<'browser' | 'server'>('browser')
  
  // Voice calling
  const { callState, makeCall, hangUp, mute, acceptCall, rejectCall } = useVoiceCalling('moses_family_user')
  
  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)

  // Load contacts and conversations when brand changes
  useEffect(() => {
    loadContacts()
    loadConversations()
  }, [activeBrand])

  // Refresh conversations when switching to home tab
  useEffect(() => {
    if (activeTab === 'home') {
      loadConversations()
    }
  }, [activeTab])

  const loadContacts = async () => {
    console.log(`[MobileApp] Loading ALL contacts (not filtered by brand)`)
    setIsLoading(true)
    try {
      const [allContacts, favorites, recent] = await Promise.all([
        ContactService.getAllContacts(),
        ContactService.getFavoriteContacts(), // Remove brand filter from favorites too
        ContactService.getRecentContacts() // Remove brand filter from recent too
      ])
      
      console.log(`[MobileApp] Loaded: ${allContacts.length} contacts, ${favorites.length} favorites, ${recent.length} recent`)
      setContacts(allContacts)
      setFavoriteContacts(favorites)
      setRecentContacts(recent)
    } catch (error) {
      console.error('[MobileApp] Error loading contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversations = async () => {
    console.log(`[MobileApp] Loading conversations for brand: ${activeBrand.id}`)
    setLoadingConversations(true)
    try {
      const conversationList = await MessageService.getConversations(activeBrand.id)
      console.log(`[MobileApp] Loaded ${conversationList.length} conversations`)
      setConversations(conversationList)
    } catch (error) {
      console.error('[MobileApp] Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const handleContactUpdate = (updatedContact: Contact) => {
    // Update contact in all relevant lists
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c))
    setFavoriteContacts(prev => 
      updatedContact.favorite 
        ? prev.some(c => c.id === updatedContact.id) 
          ? prev.map(c => c.id === updatedContact.id ? updatedContact : c)
          : [...prev, updatedContact]
        : prev.filter(c => c.id !== updatedContact.id)
    )
    setSelectedContact(updatedContact)
  }

  const handleContactDelete = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
    setFavoriteContacts(prev => prev.filter(c => c.id !== contactId))
    setRecentContacts(prev => prev.filter(c => c.id !== contactId))
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
  }

  const handleBackToContacts = () => {
    setSelectedContact(null)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await ContactService.searchContacts(query, activeBrand.id)
      setContacts(results)
    } else {
      loadContacts()
    }
  }

  // Keypad functions
  const handleKeypadPress = (digit: string | number) => {
    setPhoneNumber(prev => prev + digit.toString())
  }

  const handleKeypadDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1))
  }

  const handleKeypadClear = () => {
    setPhoneNumber('')
  }

  const handleKeypadCall = async () => {
    if (!phoneNumber.trim()) return
    
    setIsDialing(true)
    try {
      if (callMode === 'browser') {
        // Browser-based calling using Twilio Voice SDK
        await makeCall(phoneNumber, activeBrand.phoneNumber)
        console.log('Browser call initiated successfully')
      } else {
        // Server-based calling (original functionality)
        const response = await fetch('/api/calls/make', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            from: activeBrand.phoneNumber
          })
        })

        const result = await response.json()
        
        if (result.success) {
          console.log('Server call initiated successfully')
        } else {
          console.error('Call failed:', result.error)
        }
      }
    } catch (error) {
      console.error('Call failed:', error)
    } finally {
      setIsDialing(false)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-[428px] mx-auto relative overflow-hidden">
      {/* Header with Brand Switcher */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <button
          onClick={() => setShowBrandSwitcher(!showBrandSwitcher)}
          className="flex items-center justify-center space-x-2 mx-auto"
        >
          <span className="text-2xl">{activeBrand.icon}</span>
          <div className="text-left">
            <h1 className="font-semibold text-gray-900">{activeBrand.name}</h1>
            <p className="text-xs text-gray-500">{activeBrand.phoneNumber}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showBrandSwitcher ? 'rotate-180' : ''}`} />
        </button>
      </header>

      {/* Brand Switcher Dropdown */}
      {showBrandSwitcher && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50 max-w-[428px] mx-auto">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => {
                setActiveBrand(brand)
                setShowBrandSwitcher(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 ${
                activeBrand.id === brand.id ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-2xl">{brand.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{brand.name}</div>
                <div className="text-sm text-gray-500">{brand.phoneNumber}</div>
              </div>
              {activeBrand.id === brand.id && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          <div className="bg-white h-full">
            {/* Home Sub-tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveHomeTab('all')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeHomeTab === 'all' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveHomeTab('calls')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeHomeTab === 'calls' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500'
                }`}
              >
                Calls
              </button>
              <button
                onClick={() => setActiveHomeTab('messages')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeHomeTab === 'messages' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500'
                }`}
              >
                Messages
              </button>
            </div>

            {/* Conversations List or Loading/Empty State */}
            {loadingConversations ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {conversations
                  .filter(conv => {
                    // Filter by active home tab
                    if (activeHomeTab === 'calls') return conv.lastMessage?.content.includes('📞 Call')
                    if (activeHomeTab === 'messages') return !conv.lastMessage?.content.includes('📞 Call')
                    return true // 'all' shows everything
                  })
                  .map((conversation) => {
                    // Find contact info if available
                    const contact = contacts.find(c => c.phone_number === conversation.phoneNumber)
                    const displayName = contact ? contact.name : conversation.contactName || conversation.phoneNumber
                    
                    return (
                      <div key={conversation.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {displayName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {conversation.lastMessageAt.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage?.direction === 'outbound' && 'You: '}
                              {conversation.lastMessage?.content || 'No messages'}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center px-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4`}
                     style={{ backgroundColor: `${activeBrand.color}20` }}>
                  <MessageCircle className="w-8 h-8" style={{ color: activeBrand.color }} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Start a conversation by calling or texting
                </p>
                <div className="flex space-x-3">
                  <CallButton
                    toNumber={activeBrand.phoneNumber}
                    fromNumber={activeBrand.phoneNumber}
                    label="Test Call"
                  />
                  <SMSDialog
                    toNumber={activeBrand.phoneNumber}
                    fromNumber={activeBrand.phoneNumber}
                    onMessageSent={loadConversations}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'keypad' && (
          <div className="bg-white h-full p-4">
            <div className="max-w-sm mx-auto">
              {/* Call Mode Toggle */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setCallMode('browser')}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      callMode === 'browser' 
                        ? 'bg-white shadow-sm text-purple-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Browser Call
                  </button>
                  <button
                    onClick={() => setCallMode('server')}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      callMode === 'server' 
                        ? 'bg-white shadow-sm text-purple-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    AI Call
                  </button>
                </div>
              </div>

              {/* Device Status */}
              {callMode === 'browser' && (
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                    callState.deviceReady 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      callState.deviceReady ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>{callState.deviceReady ? 'Ready' : 'Connecting...'}</span>
                  </div>
                </div>
              )}

              {/* Active Call Interface */}
              {callState.activeCall && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-purple-600 mb-2">
                      {callState.isConnected ? 'Connected' : 'Calling...'}
                    </p>
                    <p className="font-medium text-gray-900 mb-4">{phoneNumber}</p>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={mute}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          callState.isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        🎙️
                      </button>
                      
                      <button
                        onClick={hangUp}
                        className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white"
                      >
                        <PhoneOff className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Number Display */}
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full text-2xl font-light text-center py-4 mb-4 border-b border-gray-200 focus:outline-none"
                />
                {phoneNumber && (
                  <button
                    onClick={handleKeypadClear}
                    className="absolute right-2 top-4 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Keypad */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-16 text-2xl font-light bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    {digit}
                  </button>
                ))}
              </div>
              
              {/* Call Button and Controls */}
              <div className="flex justify-center items-center space-x-6 mt-6">
                <button
                  onClick={handleKeypadDelete}
                  disabled={!phoneNumber}
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                
                <button
                  onClick={handleKeypadCall}
                  disabled={!phoneNumber.trim() || isDialing}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDialing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Phone className="w-6 h-6 text-white" />
                  )}
                </button>
                
                <div className="w-12 h-12"></div> {/* Spacer for alignment */}
              </div>
              
              {phoneNumber && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    {callMode === 'browser' ? 'Browser call from' : 'AI will call from'}: {activeBrand.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activeBrand.phoneNumber}
                  </p>
                  {callMode === 'browser' && (
                    <p className="text-xs text-purple-600 mt-1">
                      You'll speak directly to the person
                    </p>
                  )}
                  {callMode === 'server' && (
                    <p className="text-xs text-purple-600 mt-1">
                      AI will make the call for you
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && !selectedContact && (
          <div className="bg-white">
            {/* Contacts Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <button 
                onClick={() => console.log('Select contacts functionality coming soon')}
                className="text-purple-600 hover:text-purple-700"
                title="Select contacts"
              >
                <Check className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => console.log('Filter functionality coming soon')}
                  className="text-gray-600 hover:text-gray-700"
                  title="Filter contacts"
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    const searchInput = document.querySelector('input[placeholder="Search contacts"]') as HTMLInputElement
                    if (searchInput) {
                      searchInput.focus()
                    }
                  }}
                  className="text-gray-600 hover:text-gray-700"
                  title="Focus search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search contacts"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Contact List with Alphabetical Sections */}
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {contacts.length > 0 ? (
                    <div className="pb-4">
                      {(() => {
                        // Group contacts by first letter
                        const groupedContacts = contacts.reduce((acc, contact) => {
                          const firstLetter = contact.name.charAt(0).toUpperCase()
                          if (!acc[firstLetter]) {
                            acc[firstLetter] = []
                          }
                          acc[firstLetter].push(contact)
                          return acc
                        }, {} as Record<string, Contact[]>)

                        // Sort letters
                        const sortedLetters = Object.keys(groupedContacts).sort()

                        return sortedLetters.map(letter => (
                          <div key={letter} id={`section-${letter}`}>
                            {/* Section Header */}
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                              <h3 className="text-sm font-medium text-gray-700">
                                {letter} ({groupedContacts[letter].length})
                              </h3>
                            </div>
                            
                            {/* Contacts in this section */}
                            <div>
                              {groupedContacts[letter].map((contact) => (
                                <ContactListItem
                                  key={contact.id}
                                  contact={contact}
                                  onClick={() => handleContactClick(contact)}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
                      <p className="text-gray-500 text-sm mb-6">
                        Add contacts to get started
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Alphabetical Sidebar */}
            <div className="fixed right-2 top-48 bottom-24 flex flex-col justify-center space-y-1 bg-white/80 backdrop-blur-sm rounded-lg px-1 py-2 z-30">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'].map(letter => (
                <button
                  key={letter}
                  onClick={() => {
                    // Scroll to the section with this letter
                    const section = document.getElementById(`section-${letter}`)
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="text-xs font-medium text-purple-600 hover:bg-purple-100 rounded px-1 py-0.5 transition-colors"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact Details Modal */}
        {activeTab === 'contacts' && selectedContact && (
          <ContactDetail
            contact={selectedContact}
            onBack={handleBackToContacts}
            onUpdate={handleContactUpdate}
            onDelete={handleContactDelete}
          />
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white h-full flex flex-col">
            {/* Messages Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => console.log('Search messages')}
                  className="text-gray-600 hover:text-gray-700"
                  title="Search messages"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => console.log('Filter messages')}
                  className="text-gray-600 hover:text-gray-700"
                  title="Filter messages"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {/* Sample conversations - replace with real data */}
              <div className="divide-y divide-gray-100">
                {/* No conversations yet */}
                <div className="text-center py-20">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Send your first message to start a conversation
                  </p>
                  <button 
                    onClick={() => setActiveTab('contacts')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Message a Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="flex flex-col items-center justify-center h-96 text-center px-8">
              <Activity className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-500 text-sm">
                Your call and message history will appear here
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button - Only show on contacts tab */}
      {activeTab === 'contacts' && !selectedContact && (
        <button 
          onClick={() => setShowAddContact(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 active:bg-purple-800 z-40 transition-colors"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 fixed bottom-0 left-0 right-0 max-w-[428px] mx-auto z-50">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'messages' ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-xs">Messages</span>
          </button>
          
          <button
            onClick={() => setActiveTab('keypad')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'keypad' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Phone className="w-5 h-5 mb-1" />
            <span className="text-xs">Keypad</span>
          </button>
          
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'contacts' ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">Contacts</span>
          </button>
          
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'activity' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Activity className="w-5 h-5 mb-1" />
            <span className="text-xs">Activity</span>
          </button>
        </div>
      </nav>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Contact</h3>
              <button 
                onClick={() => setShowAddContact(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter contact name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Company name"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}