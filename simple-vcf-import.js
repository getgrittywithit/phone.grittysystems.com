const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function simpleVCFImport() {
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
    
    // Simple text parsing approach
    const vcardBlocks = vcfContent.split('BEGIN:VCARD');
    console.log('Found', vcardBlocks.length - 1, 'potential vCard blocks');
    
    const contactsToImport = [];
    const skippedContacts = [];
    
    // Process each vCard block
    for (let i = 1; i < vcardBlocks.length; i++) {
      const block = 'BEGIN:VCARD' + vcardBlocks[i];
      
      try {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        
        let name = `Contact ${i}`;
        let phone = null;
        let email = null;
        let org = '';
        let title = '';
        let note = '';
        
        lines.forEach(line => {
          if (line.startsWith('FN:')) {
            name = line.substring(3).trim();
          } else if (line.startsWith('TEL:') || line.includes('TEL;')) {
            if (!phone) { // Take first phone number
              phone = line.split(':').pop().trim();
            }
          } else if (line.startsWith('EMAIL:') || line.includes('EMAIL;')) {
            if (!email) { // Take first email
              email = line.split(':').pop().trim();
            }
          } else if (line.startsWith('ORG:')) {
            org = line.substring(4).trim();
          } else if (line.startsWith('TITLE:')) {
            title = line.substring(6).trim();
          } else if (line.startsWith('NOTE:')) {
            note = line.substring(5).trim();
          }
        });
        
        // Clean phone number
        if (phone) {
          phone = phone.replace(/[^\d+]/g, '');
          if (!phone.startsWith('+')) {
            if (phone.length === 10) {
              phone = '+1' + phone;
            } else if (phone.length === 11 && phone.startsWith('1')) {
              phone = '+' + phone;
            }
          }
        }
        
        // Skip contacts without phone numbers
        if (!phone) {
          skippedContacts.push({ name, reason: 'No phone number' });
          continue;
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
                 orgLower.includes('construction') || orgLower.includes('repair') ||
                 orgLower.includes('handyman') || orgLower.includes('triton')) {
          brandId = 'triton';
        }
        
        // Generate tags based on content
        const tags = [];
        if (org) tags.push('business');
        if (orgLower.includes('school')) tags.push('school');
        if (orgLower.includes('electric')) tags.push('electrical');
        if (orgLower.includes('plumb')) tags.push('plumbing');
        if (title) tags.push('professional');
        if (orgLower.includes('contractor')) tags.push('contractor');
        
        const contact = {
          name: name.trim(),
          phone_number: phone,
          email: email || null,
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
        console.log(`Error processing contact ${i}:`, error.message);
        skippedContacts.push({ name: `Contact ${i}`, reason: error.message });
      }
    }
    
    console.log('\n=== IMPORT SUMMARY ===');
    console.log('Total vCard blocks:', vcardBlocks.length - 1);
    console.log('Contacts to import:', contactsToImport.length);
    console.log('Skipped contacts:', skippedContacts.length);
    
    // Show brand distribution
    const brandCounts = {};
    contactsToImport.forEach(c => {
      brandCounts[c.brand_id] = (brandCounts[c.brand_id] || 0) + 1;
    });
    console.log('Brand distribution:', brandCounts);
    
    if (skippedContacts.length > 0) {
      console.log('\nFirst few skipped contacts:');
      skippedContacts.slice(0, 5).forEach(c => {
        console.log(`- ${c.name}: ${c.reason}`);
      });
    }
    
    // Show sample contacts to be imported
    console.log('\nSample contacts to import:');
    contactsToImport.slice(0, 10).forEach(c => {
      console.log(`- ${c.name} (${c.phone_number}) [${c.brand_id}] ${c.company || ''}`);
    });
    
    if (contactsToImport.length === 0) {
      console.log('No contacts to import!');
      return;
    }
    
    // Ask for confirmation
    console.log(`\nReady to import ${contactsToImport.length} contacts to Supabase.`);
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Import in batches to avoid timeout
    console.log('\n=== IMPORTING TO SUPABASE ===');
    const batchSize = 25;
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
        console.log('Error details:', error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Batch imported successfully`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log('Successfully imported:', imported, 'contacts');
    console.log('Errors:', errors, 'contacts');
    
    // Verify final count
    const { data: allContacts, error: countError } = await supabase
      .from('contacts')
      .select('name, phone_number, brand_id');
      
    if (countError) {
      console.log('Could not verify final count:', countError.message);
    } else {
      console.log('Total contacts in database:', allContacts.length);
      
      // Show brand breakdown
      const finalBrandCounts = {};
      allContacts.forEach(c => {
        finalBrandCounts[c.brand_id] = (finalBrandCounts[c.brand_id] || 0) + 1;
      });
      console.log('Final brand distribution:', finalBrandCounts);
    }
    
  } catch (error) {
    console.error('Import error:', error.message);
    console.error('Stack:', error.stack);
  }
}

simpleVCFImport();