const { createClient } = require('@supabase/supabase-js');

async function fixRLS() {
  const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Fixing RLS policies...');

    // Execute SQL to fix RLS
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable all operations" ON contacts;
        DROP POLICY IF EXISTS "Enable all operations for all users" ON contacts;
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON contacts;

        -- Create new policy that allows anonymous access
        CREATE POLICY "Enable read access for all users" ON contacts
            FOR SELECT USING (true);

        CREATE POLICY "Enable write access for all users" ON contacts
            FOR ALL USING (true);
      `
    });

    if (error) {
      console.log('RPC failed, trying alternative approach...');
      
      // Try using raw SQL execution
      console.log('Please run this SQL in your Supabase dashboard:');
      console.log('==========================================');
      console.log(`
-- Fix RLS policies for contacts table
DROP POLICY IF EXISTS "Enable all operations" ON contacts;
DROP POLICY IF EXISTS "Enable all operations for all users" ON contacts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON contacts;

-- Allow anonymous read/write access
CREATE POLICY "Allow anonymous access" ON contacts
    FOR ALL USING (true);
      `);
      console.log('==========================================');
    } else {
      console.log('✅ RLS policies updated successfully');
    }

  } catch (error) {
    console.error('Error fixing RLS:', error.message);
  }
}

fixRLS();