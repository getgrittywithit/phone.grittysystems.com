const { createClient } = require('@supabase/supabase-js');

async function debugContacts() {
  const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODI0NDMsImV4cCI6MjA2Njk1ODQ0M30.Pyq00_qFaJUhl-Sldb7nSqR-kP3RREfiwOCGZ5NC-Pw';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('Testing frontend Supabase connection...');

    // Test the exact same query the frontend would make
    const { data: tritonContacts, error: tritonError } = await supabase
      .from('contacts')
      .select('*')
      .eq('brand_id', 'triton')
      .order('name');

    console.log('\n=== TRITON CONTACTS ===');
    if (tritonError) {
      console.log('❌ Error fetching Triton contacts:', tritonError);
    } else {
      console.log('✅ Found', tritonContacts?.length || 0, 'Triton contacts');
      tritonContacts?.slice(0, 3).forEach(c => {
        console.log(`  - ${c.name} (${c.phone_number})`);
      });
    }

    const { data: schoolContacts, error: schoolError } = await supabase
      .from('contacts')
      .select('*')
      .eq('brand_id', 'school')
      .order('name');

    console.log('\n=== SCHOOL CONTACTS ===');
    if (schoolError) {
      console.log('❌ Error fetching School contacts:', schoolError);
    } else {
      console.log('✅ Found', schoolContacts?.length || 0, 'School contacts');
      schoolContacts?.forEach(c => {
        console.log(`  - ${c.name} (${c.phone_number})`);
      });
    }

    const { data: personalContacts, error: personalError } = await supabase
      .from('contacts')
      .select('*')
      .eq('brand_id', 'personal')
      .order('name')
      .limit(5);

    console.log('\n=== PERSONAL CONTACTS (first 5) ===');
    if (personalError) {
      console.log('❌ Error fetching Personal contacts:', personalError);
    } else {
      console.log('✅ Found', personalContacts?.length || 0, 'Personal contacts (showing first 5)');
      personalContacts?.forEach(c => {
        console.log(`  - ${c.name} (${c.phone_number})`);
      });
    }

    // Test favorites
    const { data: favorites, error: favError } = await supabase
      .from('contacts')
      .select('*')
      .eq('favorite', true);

    console.log('\n=== FAVORITE CONTACTS ===');
    if (favError) {
      console.log('❌ Error fetching favorites:', favError);
    } else {
      console.log('✅ Found', favorites?.length || 0, 'favorite contacts');
    }

    // Test recent
    const { data: recent, error: recentError } = await supabase
      .from('contacts')
      .select('*')
      .not('last_contact', 'is', null)
      .order('last_contact', { ascending: false })
      .limit(5);

    console.log('\n=== RECENT CONTACTS ===');
    if (recentError) {
      console.log('❌ Error fetching recent:', recentError);
    } else {
      console.log('✅ Found', recent?.length || 0, 'recent contacts');
    }

    // Total count
    const { data: allContacts, error: allError } = await supabase
      .from('contacts')
      .select('id', { count: 'exact' });

    console.log('\n=== TOTAL COUNT ===');
    if (allError) {
      console.log('❌ Error getting total count:', allError);
    } else {
      console.log('✅ Total contacts in database:', allContacts?.length || 0);
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugContacts();