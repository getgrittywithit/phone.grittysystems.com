const fs = require('fs');
const vCard = require('vcf');
const { createClient } = require('@supabase/supabase-js');

async function importVCFContacts() {
  const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the VCF file
    const vcfPath = '/Users/levismac/Code/Phone/Aaron A. - Boerne Office and 181 others.vcf';
    console.log('Reading VCF file:', vcfPath);
    
    const vcfContent = fs.readFileSync(vcfPath, 'utf8');
    console.log('VCF file size:', vcfContent.length, 'characters');
    
    // Parse the VCF content
    const parsedCards = vCard.parse(vcfContent);
    console.log('Found', parsedCards.length, 'contacts in VCF file');
    
    const contactsToImport = [];
    const skippedContacts = [];
    
    // Process each contact
    parsedCards.forEach((card, index) => {
      try {
        const name = card.get('fn') ? card.get('fn').valueOf() : `Contact ${index + 1}`;
        const phones = card.get('tel') || [];
        const emails = card.get('email') || [];
        const org = card.get('org') ? card.get('org').valueOf() : '';
        const title = card.get('title') ? card.get('title').valueOf() : '';
        const note = card.get('note') ? card.get('note').valueOf() : '';
        
        // Get the first phone number
        let primaryPhone = null;
        const phoneFields = Array.isArray(phones) ? phones : (phones ? [phones] : []);
        
        if (phoneFields.length > 0) {
          primaryPhone = phoneFields[0].valueOf ? phoneFields[0].valueOf() : phoneFields[0];
          
          // Clean phone number
          primaryPhone = primaryPhone.replace(/[^\d+]/g, '');
          if (!primaryPhone.startsWith('+')) {
            if (primaryPhone.length === 10) {
              primaryPhone = '+1' + primaryPhone;
            } else if (primaryPhone.length === 11 && primaryPhone.startsWith('1')) {
              primaryPhone = '+' + primaryPhone;
            }
          }
        }
        
        const emailFields = Array.isArray(emails) ? emails : (emails ? [emails] : []);
        const primaryEmail = emailFields.length > 0 ? (emailFields[0].valueOf ? emailFields[0].valueOf() : emailFields[0]) : null;
        
        // Skip contacts without phone numbers
        if (!primaryPhone) {
          skippedContacts.push({ name, reason: 'No phone number' });
          return;
        }
        
        // Determine brand based on organization or keywords
        let brandId = 'personal'; // default
        const orgLower = org.toLowerCase();
        const nameLower = name.toLowerCase();
        const noteLower = note.toLowerCase();
        
        // School-related keywords
        if (orgLower.includes('school') || orgLower.includes('elementary') || 
            orgLower.includes('isd') || orgLower.includes('education') ||
            nameLower.includes('teacher') || nameLower.includes('principal') ||
            noteLower.includes('school')) {
          brandId = 'school';
        }
        // Business/contractor keywords  
        else if (orgLower.includes('llc') || orgLower.includes('inc') || 
                 orgLower.includes('corp') || orgLower.includes('company') ||
                 orgLower.includes('electric') || orgLower.includes('plumb') ||
                 orgLower.includes('contractor') || orgLower.includes('service') ||
                 orgLower.includes('construction') || orgLower.includes('repair')) {
          brandId = 'triton';
        }
        
        // Generate tags based on content
        const tags = [];
        if (org) tags.push('business');
        if (orgLower.includes('school')) tags.push('school');
        if (orgLower.includes('electric')) tags.push('electrical');
        if (orgLower.includes('plumb')) tags.push('plumbing');
        if (title) tags.push('professional');
        
        const contact = {
          name: name.trim(),
          phone_number: primaryPhone,
          email: primaryEmail,
          company: org || null,
          job_title: title || null,
          notes: note || null,
          tags: tags,
          brand_id: brandId,
          contact_source: 'import',
          favorite: false
        };
        
        contactsToImport.push(contact);
        
      } catch (error) {
        console.log(`Error processing contact ${index + 1}:`, error.message);
        skippedContacts.push({ name: `Contact ${index + 1}`, reason: error.message });
      }
    });
    
    console.log('\n=== IMPORT SUMMARY ===');
    console.log('Total contacts parsed:', parsedCards.length);
    console.log('Contacts to import:', contactsToImport.length);
    console.log('Skipped contacts:', skippedContacts.length);
    
    // Show brand distribution
    const brandCounts = {};
    contactsToImport.forEach(c => {
      brandCounts[c.brand_id] = (brandCounts[c.brand_id] || 0) + 1;
    });
    console.log('Brand distribution:', brandCounts);
    
    if (skippedContacts.length > 0) {
      console.log('\nSkipped contacts:');
      skippedContacts.slice(0, 5).forEach(c => {
        console.log(`- ${c.name}: ${c.reason}`);
      });
      if (skippedContacts.length > 5) {
        console.log(`... and ${skippedContacts.length - 5} more`);
      }
    }
    
    // Show sample contacts to be imported
    console.log('\nSample contacts to import:');
    contactsToImport.slice(0, 5).forEach(c => {
      console.log(`- ${c.name} (${c.phone_number}) [${c.brand_id}] ${c.company || ''}`);
    });
    
    // Import in batches to avoid timeout
    console.log('\n=== IMPORTING TO SUPABASE ===');
    const batchSize = 50;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < contactsToImport.length; i += batchSize) {
      const batch = contactsToImport.slice(i, i + batchSize);
      console.log(`Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contactsToImport.length/batchSize)} (${batch.length} contacts)...`);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert(batch);
      
      if (error) {
        console.log('Batch error:', error.message);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Batch imported successfully`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log('Successfully imported:', imported, 'contacts');
    console.log('Errors:', errors, 'contacts');
    
    // Verify final count
    const { data: finalCount, error: countError } = await supabase
      .from('contacts')
      .select('id', { count: 'exact' });
      
    if (countError) {
      console.log('Could not verify final count:', countError.message);
    } else {
      console.log('Total contacts in database:', finalCount.length);
    }
    
  } catch (error) {
    console.error('Import error:', error.message);
    console.error('Stack:', error.stack);
  }
}

importVCFContacts();