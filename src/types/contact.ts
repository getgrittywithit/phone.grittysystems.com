export interface Contact {
  id: string
  name: string
  phone_number: string
  email?: string
  company?: string
  job_title?: string
  address?: string
  notes?: string
  tags: string[]
  favorite: boolean
  brand_id: string
  last_contact?: string
  contact_source: 'manual' | 'call' | 'sms' | 'import'
  created_at: string
  updated_at: string
}

export interface ContactInsert {
  name: string
  phone_number: string
  email?: string
  company?: string
  job_title?: string
  address?: string
  notes?: string
  tags?: string[]
  favorite?: boolean
  brand_id: string
  contact_source?: 'manual' | 'call' | 'sms' | 'import'
}

export interface ContactUpdate {
  name?: string
  phone_number?: string
  email?: string
  company?: string
  job_title?: string
  address?: string
  notes?: string
  tags?: string[]
  favorite?: boolean
  brand_id?: string
  last_contact?: string
}