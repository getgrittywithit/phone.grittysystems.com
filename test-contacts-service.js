// Test ContactService functionality
const { createClient } = require('@supabase/supabase-js');

// Use the same fallback logic as our service
const getSupabaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl && envUrl !== 'https://placeholder.supabase.co') {
    return envUrl;
  }
  return 'https://jvzqtyzblkvkrihtequd.supabase.co';
};

const getSupabaseAnonKey = () => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envKey && envKey !== 'placeholder-key') {
    return envKey;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODI0NDMsImV4cCI6MjA2Njk1ODQ0M30.Pyq00_qFaJUhl-Sldb7nSqR-kP3RREfiwOCGZ5NC-Pw';
};

async function testContactService() {
  console.log('Testing ContactService logic...');
  
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key length:', supabaseAnonKey.length);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });

  try {
    // Test getContactsByBrand like our service
    console.log('\n=== Testing getContactsByBrand(triton) ===');
    const { data: tritonContacts, error: tritonError } = await supabase
      .from('contacts')
      .select('*')
      .eq('brand_id', 'triton')
      .order('name');

    if (tritonError) {
      console.error('Error fetching triton contacts:', tritonError);
    } else {
      console.log('✅ Found', tritonContacts?.length || 0, 'triton contacts');
      tritonContacts?.forEach(c => console.log(`  - ${c.name} (${c.phone_number})`));
    }

    console.log('\n=== Testing getFavoriteContacts(triton) ===');
    const { data: favorites, error: favError } = await supabase
      .from('contacts')
      .select('*')
      .eq('favorite', true)
      .eq('brand_id', 'triton')
      .order('name');

    if (favError) {
      console.error('Error fetching favorites:', favError);
    } else {
      console.log('✅ Found', favorites?.length || 0, 'favorite contacts for triton');
    }

    console.log('\n=== Testing getRecentContacts(triton) ===');
    const { data: recent, error: recentError } = await supabase
      .from('contacts')
      .select('*')
      .not('last_contact', 'is', null)
      .eq('brand_id', 'triton')
      .order('last_contact', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent contacts:', recentError);
    } else {
      console.log('✅ Found', recent?.length || 0, 'recent contacts for triton');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testContactService();