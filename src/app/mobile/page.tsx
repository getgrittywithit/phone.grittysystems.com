'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Users, Activity, ChevronDown, Plus, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { brands, Brand } from '@/types/brand'
import { CallButton } from '@/components/CallButton'
import { SMSDialog } from '@/components/SMSDialog'
import { ContactCard } from '@/components/ContactCard'
import { ContactService } from '@/lib/contacts'
import { Contact } from '@/types/contact'

export default function MobileApp() {
  const [activeBrand, setActiveBrand] = useState<Brand>(brands[0])
  const [activeTab, setActiveTab] = useState<'home' | 'keypad' | 'contacts' | 'activity'>('home')
  const [showBrandSwitcher, setShowBrandSwitcher] = useState(false)
  const [activeHomeTab, setActiveHomeTab] = useState<'all' | 'calls' | 'messages'>('all')
  
  // Contact state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load contacts when brand changes
  useEffect(() => {
    loadContacts()
  }, [activeBrand])

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[428px] mx-auto relative">
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
      <main className="flex-1 overflow-y-auto pb-16">
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

            {/* Empty State */}
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
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keypad' && (
          <div className="bg-white h-full p-4">
            <div className="max-w-sm mx-auto">
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full text-2xl font-light text-center py-4 mb-4 border-b border-gray-200 focus:outline-none"
              />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                  <button
                    key={digit}
                    className="h-16 text-2xl font-light bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200"
                  >
                    {digit}
                  </button>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <button
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 active:bg-green-700"
                >
                  <Phone className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="bg-white h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search contacts"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Favorites Section */}
                  {favoriteContacts.length > 0 && !searchQuery && (
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Favorites</h3>
                      <div className="space-y-3">
                        {favoriteContacts.map((contact) => (
                          <ContactCard
                            key={contact.id}
                            contact={contact}
                            onUpdate={handleContactUpdate}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Contacts */}
                  {recentContacts.length > 0 && !searchQuery && (
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Recent</h3>
                      <div className="space-y-3">
                        {recentContacts.map((contact) => (
                          <ContactCard
                            key={contact.id}
                            contact={contact}
                            onUpdate={handleContactUpdate}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Contacts */}
                  <div className="p-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                      {searchQuery ? 'Search Results' : 'All Contacts'}
                    </h3>
                    {contacts.length > 0 ? (
                      <div className="space-y-3">
                        {contacts.map((contact) => (
                          <ContactCard
                            key={contact.id}
                            contact={contact}
                            onUpdate={handleContactUpdate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-center">
                        <Users className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm">
                          {searchQuery ? 'No contacts found' : 'No contacts yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
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

      {/* Floating Action Button */}
      <button className="absolute bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 active:bg-blue-800 z-30">
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 absolute bottom-0 left-0 right-0 max-w-[428px] mx-auto">
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
              activeTab === 'contacts' ? 'text-blue-600' : 'text-gray-500'
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
    </div>
  )
}