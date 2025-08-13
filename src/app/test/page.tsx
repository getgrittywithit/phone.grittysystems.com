'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [envStatus, setEnvStatus] = useState<any>({})
  const [contacts, setContacts] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testEnvironment() {
      try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        setEnvStatus({
          url: supabaseUrl || 'MISSING',
          key: supabaseKey || 'MISSING',
          urlLength: supabaseUrl?.length || 0,
          keyLength: supabaseKey?.length || 0
        })

        if (!supabaseUrl || !supabaseKey) {
          setError('Environment variables not available in browser')
          setLoading(false)
          return
        }

        // Try to import and create supabase client
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        console.log('Testing Supabase connection...')
        
        // Test basic connection
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, phone_number, brand_id')
          .limit(10)

        console.log('Supabase response:', { data, error })

        if (error) {
          setError(`Supabase error: ${error.message}`)
        } else {
          setContacts(data || [])
        }
      } catch (err: any) {
        console.error('Test error:', err)
        setError(`Connection error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    testEnvironment()
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Debug Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Environment Variables Status:</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envStatus.url === 'MISSING' ? '❌ Missing' : `✅ Set (${envStatus.urlLength} chars)`}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envStatus.key === 'MISSING' ? '❌ Missing' : `✅ Set (${envStatus.keyLength} chars)`}</p>
        {envStatus.url !== 'MISSING' && (
          <p className="text-sm text-gray-600 mt-2">URL: {envStatus.url}</p>
        )}
      </div>

      {loading && (
        <div className="text-blue-600">Testing connection...</div>
      )}

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <h2 className="font-semibold mb-4">✅ Connection successful! Found {contacts.length} contacts:</h2>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-3 bg-white border rounded">
                <strong>{contact.name}</strong> - {contact.phone_number} [{contact.brand_id}]
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}