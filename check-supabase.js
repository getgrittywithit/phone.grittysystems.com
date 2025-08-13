const { Client } = require('pg');

async function checkSupabaseTables() {
  const client = new Client({
    host: 'aws-0-us-east-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.jvzqtyzblkvkrihtequd',
    password: '$kSfqdgVM9jMf3!Y',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase successfully!');

    // Check what tables exist
    const tablesResult = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n=== EXISTING TABLES ===');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in public schema');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name} (schema: ${row.table_schema})`);
      });
    }

    // Check specifically for contacts table
    const contactsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contacts' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('\n=== CONTACTS TABLE STRUCTURE ===');
    if (contactsCheck.rows.length === 0) {
      console.log('Contacts table does not exist');
    } else {
      console.log('Contacts table exists with these columns:');
      contactsCheck.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
      });

      // Check if there's any data
      const dataCount = await client.query('SELECT COUNT(*) FROM contacts');
      console.log(`\nContacts table has ${dataCount.rows[0].count} records`);

      // Show first few records if any exist
      if (parseInt(dataCount.rows[0].count) > 0) {
        const sampleData = await client.query('SELECT id, name, phone_number, brand_id FROM contacts LIMIT 5');
        console.log('\nSample contacts:');
        sampleData.rows.forEach(row => {
          console.log(`- ${row.name} (${row.phone_number}) [${row.brand_id}]`);
        });
      }
    }

  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
  } finally {
    await client.end();
  }
}

checkSupabaseTables();