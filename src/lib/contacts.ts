import { supabase, supabaseAdmin } from './supabase'
import { Contact, ContactInsert, ContactUpdate } from '@/types/contact'

export class ContactService {
  // Get all contacts (regardless of brand)
  static async getAllContacts(): Promise<Contact[]> {
    console.log(`[ContactService] Fetching ALL contacts`)
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name')

      if (error) {
        console.error('[ContactService] Error fetching all contacts:', error)
        return []
      }

      console.log(`[ContactService] Found ${data?.length || 0} total contacts`)
      return data || []
    } catch (error) {
      console.error('[ContactService] Exception:', error)
      return []
    }
  }

  // Get all contacts for a specific brand
  static async getContactsByBrand(brandId: string): Promise<Contact[]> {
    console.log(`[ContactService] Fetching contacts for brand: ${brandId}`)
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('brand_id', brandId)
        .order('name')

      if (error) {
        console.error('[ContactService] Error fetching contacts:', error)
        return []
      }

      console.log(`[ContactService] Found ${data?.length || 0} contacts for brand ${brandId}`)
      return data || []
    } catch (error) {
      console.error('[ContactService] Exception:', error)
      return []
    }
  }

  // Search contacts
  static async searchContacts(query: string, brandId?: string): Promise<Contact[]> {
    try {
      let queryBuilder = supabase
        .from('contacts')
        .select('*')
        .or(`name.ilike.%${query}%, phone_number.ilike.%${query}%, company.ilike.%${query}%`)

      if (brandId) {
        queryBuilder = queryBuilder.eq('brand_id', brandId)
      }

      const { data, error } = await queryBuilder.order('name')

      if (error) {
        console.error('Error searching contacts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('ContactService search error:', error)
      return []
    }
  }

  // Get favorite contacts
  static async getFavoriteContacts(brandId?: string): Promise<Contact[]> {
    console.log(`[ContactService] Fetching favorite contacts${brandId ? ` for brand: ${brandId}` : ' (all brands)'}`)
    try {
      let queryBuilder = supabase
        .from('contacts')
        .select('*')
        .eq('favorite', true)

      if (brandId) {
        queryBuilder = queryBuilder.eq('brand_id', brandId)
      }

      const { data, error } = await queryBuilder.order('name')

      if (error) {
        console.error('[ContactService] Error fetching favorite contacts:', error)
        return []
      }

      console.log(`[ContactService] Found ${data?.length || 0} favorite contacts`)
      return data || []
    } catch (error) {
      console.error('[ContactService] Favorite contacts error:', error)
      return []
    }
  }

  // Get recent contacts (based on last_contact)
  static async getRecentContacts(brandId?: string, limit: number = 10): Promise<Contact[]> {
    console.log(`[ContactService] Fetching recent contacts${brandId ? ` for brand: ${brandId}` : ' (all brands)'}`)
    try {
      let queryBuilder = supabase
        .from('contacts')
        .select('*')
        .not('last_contact', 'is', null)

      if (brandId) {
        queryBuilder = queryBuilder.eq('brand_id', brandId)
      }

      const { data, error } = await queryBuilder
        .order('last_contact', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[ContactService] Error fetching recent contacts:', error)
        return []
      }

      console.log(`[ContactService] Found ${data?.length || 0} recent contacts`)
      return data || []
    } catch (error) {
      console.error('[ContactService] Recent contacts error:', error)
      return []
    }
  }

  // Find contact by phone number
  static async findContactByPhone(phoneNumber: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single()

      if (error) {
        console.error('Error finding contact by phone:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('ContactService find by phone error:', error)
      return null
    }
  }

  // Create a new contact
  static async createContact(contact: ContactInsert): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single()

      if (error) {
        console.error('Error creating contact:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('ContactService create error:', error)
      return null
    }
  }

  // Update a contact
  static async updateContact(id: string, updates: ContactUpdate): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating contact:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('ContactService update error:', error)
      return null
    }
  }

  // Delete a contact
  static async deleteContact(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting contact:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('ContactService delete error:', error)
      return false
    }
  }

  // Toggle favorite status
  static async toggleFavorite(id: string): Promise<Contact | null> {
    try {
      // First get the current favorite status
      const { data: currentContact } = await supabase
        .from('contacts')
        .select('favorite')
        .eq('id', id)
        .single()

      if (!currentContact) return null

      // Toggle the favorite status
      const { data, error } = await supabase
        .from('contacts')
        .update({ favorite: !currentContact.favorite })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling favorite:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('ContactService toggle favorite error:', error)
      return null
    }
  }

  // Update last contact time (when call/sms happens)
  static async updateLastContact(phoneNumber: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ last_contact: new Date().toISOString() })
        .eq('phone_number', phoneNumber)

      if (error) {
        console.error('Error updating last contact:', error)
      }
    } catch (error) {
      console.error('ContactService update last contact error:', error)
    }
  }

  // Bulk import contacts (admin function)
  static async bulkImportContacts(contacts: ContactInsert[]): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('contacts')
        .insert(contacts)

      if (error) {
        console.error('Error bulk importing contacts:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('ContactService bulk import error:', error)
      return false
    }
  }

  // Auto-create contact from incoming call/SMS if not exists
  static async autoCreateContact(phoneNumber: string, brandId: string, source: 'call' | 'sms'): Promise<Contact | null> {
    try {
      // Check if contact already exists
      const existingContact = await this.findContactByPhone(phoneNumber)
      if (existingContact) {
        // Update last contact time
        await this.updateLastContact(phoneNumber)
        return existingContact
      }

      // Create new contact
      const newContact: ContactInsert = {
        name: `Unknown (${phoneNumber})`,
        phone_number: phoneNumber,
        brand_id: brandId,
        contact_source: source
      }

      const contact = await this.createContact(newContact)
      if (contact) {
        await this.updateLastContact(phoneNumber)
      }

      return contact
    } catch (error) {
      console.error('ContactService auto-create error:', error)
      return null
    }
  }
}