const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseWithClient() {
  const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Checking Supabase with service role...');

    // Check if contacts table exists
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);

    console.log('\n=== CONTACTS TABLE CHECK ===');
    if (contactsError) {
      console.log('❌ Contacts table error:', contactsError.message);
      console.log('Error details:', contactsError);
    } else {
      console.log('✅ Contacts table exists!');
      console.log('Sample query returned:', contactsData?.length || 0, 'records');
    }

    // Try to get table schema using RPC
    console.log('\n=== CHECKING ALL TABLES ===');
    const { data: tables, error: tablesError } = await supabase.rpc('get_schema', {});
    
    if (tablesError) {
      console.log('Could not get schema via RPC:', tablesError.message);
      
      // Try alternative approach - check information_schema directly
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (schemaError) {
        console.log('Could not access information_schema:', schemaError.message);
      } else {
        console.log('Tables found:', schemaData);
      }
    } else {
      console.log('Schema info:', tables);
    }

    // List some other common tables that might exist
    const tablesToCheck = ['users', 'profiles', 'content', 'posts', 'articles'];
    
    console.log('\n=== CHECKING FOR COMMON TABLES ===');
    for (const tableName of tablesToCheck) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: exists with ${data?.length || 0} sample records`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSupabaseWithClient();