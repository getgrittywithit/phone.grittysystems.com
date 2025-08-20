'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Voicemail, Settings, Users, Plus, Search, Activity, Bell, HelpCircle, ChevronRight, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallButton } from '@/components/CallButton'
import { SMSDialog } from '@/components/SMSDialog'
import { ContactsDesktop } from '@/components/ContactsDesktop'
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
    <div className="min-h-screen bg-[var(--sidebar-bg)] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col h-screen">
        {/* User Profile Section */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">LM</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[var(--foreground)]">Levi Moses</h3>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                activeTab === 'activity'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--foreground)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <Activity className="w-4 h-4 mr-3" />
              Activity
            </button>
            
            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--foreground)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <Users className="w-4 h-4 mr-3" />
              Contacts
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--foreground)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <Activity className="w-4 h-4 mr-3" />
              Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('sona')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors group ${
                activeTab === 'sona'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--foreground)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <div className="w-4 h-4 mr-3 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
              Sona
              <span className="ml-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded group-hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300">Try for free</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--foreground)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </button>
          </div>

          {/* Inboxes Section */}
          <div className="mt-8 mb-4">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Inboxes</h3>
            <div className="space-y-1">
              <div className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] cursor-pointer group">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-400 to-gray-600 mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">GC</span>
                </div>
                <span className="text-[var(--foreground)]">Grit Collective</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">+1 (830) 331-5566</span>
              </div>
              
              <div className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] cursor-pointer group">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-400 to-orange-600 mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">T</span>
                </div>
                <span className="text-[var(--foreground)]">Triton - Main</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">+1 (830) 448-3333</span>
                <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
              </div>
              
              <div className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] cursor-pointer group">
                <ChevronRight className="w-4 h-4 mr-1 text-[var(--text-muted)]" />
                <span className="text-[var(--foreground)] text-sm">Dont Answer</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">+1 (830) 510-1630</span>
                <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
              </div>
            </div>
          </div>
          
          {/* Your Team Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Your team</h3>
            <div className="space-y-1">
              <div className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">LM</span>
                </div>
                <span className="text-[var(--foreground)]">Levi Moses</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">You</span>
              </div>
              
              <button className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] text-[var(--primary)]">
                <Plus className="w-4 h-4 mr-3" />
                Invite your team
              </button>
            </div>
          </div>
        </nav>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-[var(--border)]">
          <button className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] text-[var(--foreground)]">
            <span className="mr-3">🔗</span>
            Refer and earn
          </button>
          <button className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-bg)] text-[var(--foreground)]">
            <HelpCircle className="w-4 h-4 mr-3" />
            Help and support
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[var(--background)]">
        {/* Top Header */}
        <header className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-[var(--foreground)] capitalize">
                {activeTab === 'activity' ? 'Chats' : activeTab}
              </h1>
              <button className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center">
                Calls
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-[var(--foreground)]" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-[var(--foreground)]" />
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex">
          {activeTab === 'activity' && (
            <div className="flex flex-1">
              {/* Chat List */}
              <div className="w-96 bg-[var(--card-bg)] border-r border-[var(--border)]">
                {/* Filter Bar */}
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center text-sm text-[var(--foreground)] hover:bg-[var(--background)] px-3 py-1.5 rounded-lg">
                      Open <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    <button className="flex items-center text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]">
                      Unread
                    </button>
                    <button className="flex items-center text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]">
                      Unresponded
                    </button>
                    <button className="ml-auto p-1.5 hover:bg-[var(--background)] rounded-lg">
                      <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>
                
                {/* Sample Chat Items */}
                <div className="divide-y divide-[var(--border)]">
                  <div className="p-4 hover:bg-[var(--background)] cursor-pointer transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">MC</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-[var(--foreground)] truncate">MELISSA CURD-Gilded Peacock</h4>
                          <span className="text-xs text-[var(--text-muted)]">Aug 16</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] truncate">Ok 👍</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-[var(--text-muted)]">✓ Called you</span>
                          <div className="w-1 h-1 bg-[var(--text-muted)] rounded-full mx-2"></div>
                          <span className="text-xs text-[var(--primary)]">+1 (830) 777-7633</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 hover:bg-[var(--background)] cursor-pointer transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">?</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-[var(--foreground)] truncate">(726) 200-4200</h4>
                          <span className="text-xs text-[var(--text-muted)]">3:58 PM</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] truncate">Hello, My name is Thomas Taylor, and ...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1 flex flex-col bg-[var(--card-bg)]">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Select a conversation</h3>
                    <p className="text-[var(--text-muted)]">Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'contacts' && (
            <div className="flex-1">
              <ContactsDesktop />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Analytics</h2>
                  <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors">
                    Export CSV
                  </button>
                </div>
                <p className="text-[var(--text-muted)]">Have an in-depth look at all the metrics within your workspace</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--text-muted)]">Messages</span>
                    <span className="text-xs text-[var(--text-muted)]">↑</span>
                  </div>
                  <p className="text-3xl font-bold text-[var(--foreground)]">78</p>
                </div>
                
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--text-muted)]">Calls</span>
                    <span className="text-xs text-[var(--text-muted)]">↑</span>
                  </div>
                  <p className="text-3xl font-bold text-[var(--foreground)]">33</p>
                </div>
              </div>
              
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Analytics Dashboard</h3>
                <p className="text-[var(--text-muted)]">Detailed metrics and insights will appear here</p>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="flex-1 bg-[var(--card-bg)]">
              <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Workspace</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="border border-[var(--border)] rounded-lg p-6">
                    <h3 className="font-medium text-[var(--foreground)] mb-4">Allowed email domains</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      Anyone with an email address at these domains can sign up for this workspace
                    </p>
                    <button className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]">
                      Add a domain
                    </button>
                  </div>
                  
                  <div className="border border-[var(--border)] rounded-lg p-6">
                    <h3 className="font-medium text-[var(--foreground)] mb-4">Members</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      Manage all members in your workspace
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <span className="text-white text-sm font-medium">LM</span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">Levi Moses</p>
                          <p className="text-sm text-[var(--text-muted)]">levimoses2008@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">Owner</span>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors">
                      Invite your team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'sona' && (
            <div className="flex-1 flex items-center justify-center bg-[var(--card-bg)]">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Sona AI Assistant</h3>
                <p className="text-[var(--text-muted)] mb-6">Your intelligent voice assistant for handling calls</p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                  Try Sona for Free
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
