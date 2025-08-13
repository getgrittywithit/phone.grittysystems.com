const { createClient } = require('@supabase/supabase-js');

async function createContactsTable() {
  const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Creating contacts table...');

    // Create the table using SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
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

        -- Enable Row Level Security
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

        -- Create policy for all operations (since we're not using auth yet)
        CREATE POLICY "Enable all operations for all users" ON contacts
            FOR ALL USING (true);
      `
    });

    if (error) {
      console.log('RPC error, trying direct SQL approach...');
      
      // Try alternative approach - execute statements one by one
      const createTableSQL = `
        CREATE TABLE contacts (
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
          contact_source TEXT DEFAULT 'manual',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      console.log('SQL to run in Supabase dashboard:');
      console.log('=====================================');
      console.log(createTableSQL);
      console.log('=====================================');
      
    } else {
      console.log('✅ Table creation successful!');
    }

    // Try to insert sample data
    console.log('\nInserting sample contacts...');
    
    const sampleContacts = [
      {
        name: 'John Smith',
        phone_number: '+15551234567',
        email: 'john@email.com',
        company: 'ABC Corp',
        brand_id: 'triton',
        tags: ['client', 'plumbing'],
        notes: 'Kitchen remodel project',
        contact_source: 'import'
      },
      {
        name: 'Jane Doe',
        phone_number: '+15559876543',
        email: 'jane@school.edu',
        company: 'Lincoln Elementary',
        brand_id: 'school',
        tags: ['teacher', 'math'],
        notes: "Emma's teacher",
        contact_source: 'import'
      },
      {
        name: 'Mike Johnson',
        phone_number: '+15555555555',
        email: 'mike@personal.com',
        company: '',
        brand_id: 'personal',
        tags: ['friend', 'neighbor'],
        notes: 'Lives next door',
        contact_source: 'import'
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert(sampleContacts);

    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('Table probably doesn\'t exist yet. Run the SQL above in Supabase dashboard first.');
    } else {
      console.log('✅ Sample contacts inserted successfully!');
    }

    // Verify the table exists and has data
    const { data: verifyData, error: verifyError } = await supabase
      .from('contacts')
      .select('*')
      .limit(3);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Verification successful! Found', verifyData?.length || 0, 'contacts');
      verifyData?.forEach(contact => {
        console.log(`  - ${contact.name} (${contact.phone_number}) [${contact.brand_id}]`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createContactsTable();