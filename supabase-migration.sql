-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  company TEXT,
  job_title TEXT,
  address TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT FALSE,
  brand_id TEXT NOT NULL,
  last_contact TIMESTAMPTZ,
  contact_source TEXT DEFAULT 'manual' CHECK (contact_source IN ('manual', 'call', 'sms', 'import')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_brand_id ON contacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(favorite);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (you can modify this based on your auth setup)
CREATE POLICY "Enable all operations for authenticated users" ON contacts
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Insert sample contacts for testing
INSERT INTO contacts (name, phone_number, email, company, brand_id, tags, notes, contact_source) VALUES
('John Smith', '+15551234567', 'john@email.com', 'ABC Corp', 'triton', ARRAY['client', 'plumbing'], 'Kitchen remodel project', 'import'),
('Jane Doe', '+15559876543', 'jane@school.edu', 'Lincoln Elementary', 'school', ARRAY['teacher', 'math'], 'Emma''s teacher', 'import'),
('Mike Johnson', '+15555555555', 'mike@personal.com', '', 'personal', ARRAY['friend', 'neighbor'], 'Lives next door', 'import'),
('Sarah Wilson', '+15551111111', 'sarah@contractwork.com', 'Wilson Electric', 'triton', ARRAY['contractor', 'electrical'], 'Reliable electrician', 'import'),
('Principal Davis', '+15552222222', 'principal@school.edu', 'Lincoln Elementary', 'school', ARRAY['admin', 'principal'], 'School principal', 'import');