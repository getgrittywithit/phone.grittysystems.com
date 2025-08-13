'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Voicemail, Settings, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallButton } from '@/components/CallButton'
import { SMSDialog } from '@/components/SMSDialog'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('calls')
  const router = useRouter()

  useEffect(() => {
    // Redirect to mobile view on small screens
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        router.push('/mobile')
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [router])

  const tabs = [
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'voicemails', label: 'Voicemails', icon: Voicemail },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phone Hub</h1>
            <p className="text-sm text-gray-600">Family Communication Center</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Number
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Phone Numbers */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Phone Numbers</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-green-900">Work - Main</p>
                    <p className="text-sm text-green-700">+1 (830) 500-5485</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-green-600">
                  AI Agent: Professional Assistant
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-blue-900">School - Kids</p>
                    <p className="text-sm text-blue-700">+1 (830) 500-5485</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="text-xs text-blue-600">
                  AI Agent: School Communication Helper
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-purple-900">Personal</p>
                    <p className="text-sm text-purple-700">+1 (830) 500-5485</p>
                  </div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <div className="text-xs text-purple-600">
                  AI Agent: Family Assistant
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h2>
            </div>
            
            <div className="p-6">
              {activeTab === 'calls' && (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-900 mb-3">Test Your Phone Hub</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Try calling or texting your Twilio number: <strong>+1 (830) 500-5485</strong>
                    </p>
                    <div className="flex space-x-4">
                      <CallButton
                        toNumber="+18305005485"
                        fromNumber="+18305005485"
                        label="Test Call"
                      />
                      <SMSDialog
                        toNumber="+18305005485"
                        fromNumber="+18305005485"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center py-12">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent calls</h3>
                    <p className="text-gray-500">Incoming and outgoing calls will appear here</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'messages' && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
                  <p className="text-gray-500">SMS and MMS messages will appear here</p>
                </div>
              )}
              
              {activeTab === 'voicemails' && (
                <div className="text-center py-12">
                  <Voicemail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No voicemails</h3>
                  <p className="text-gray-500">Voicemail recordings will appear here</p>
                </div>
              )}
              
              {activeTab === 'contacts' && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts</h3>
                  <p className="text-gray-500">Your saved contacts will appear here</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Account Settings</h4>
                      <p className="text-sm text-gray-600 mb-4">Manage your profile and preferences</p>
                      <Button variant="outline">Edit Profile</Button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Phone Numbers</h4>
                      <p className="text-sm text-gray-600 mb-4">Add, remove, or configure phone numbers</p>
                      <Button variant="outline">Manage Numbers</Button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">AI Agents</h4>
                      <p className="text-sm text-gray-600 mb-4">Configure AI voice agents for each number</p>
                      <Button variant="outline">Configure AI</Button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Integrations</h4>
                      <p className="text-sm text-gray-600 mb-4">Connect with Twilio and ElevenLabs</p>
                      <Button variant="outline">View Integrations</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
