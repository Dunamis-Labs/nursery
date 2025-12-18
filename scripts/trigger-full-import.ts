#!/usr/bin/env tsx
/**
 * Trigger Full Import via API
 * 
 * This script triggers a full import job via the admin API endpoint.
 * It's useful for running imports from the command line.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

async function triggerImport() {
  const apiKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || apiKey === 'your-secure-api-key-here') {
    console.error('❌ ADMIN_API_KEY not set or still using placeholder value.');
    console.error('   Please set ADMIN_API_KEY in your .env file.');
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/admin/import-jobs`;

  console.log('🌱 Triggering full import from Plantmark Plant Finder...\n');
  console.log(`   API URL: ${apiUrl}\n`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        jobType: 'FULL',
        useApi: false, // Use scraping since API is not available
        maxProducts: undefined, // Import all products
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    
    console.log('✅ Import job started!\n');
    console.log('📊 Job Details:');
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}\n`);
    console.log('💡 Monitor progress:');
    console.log(`   - Dashboard: ${baseUrl}/admin/import`);
    console.log(`   - API: ${baseUrl}/api/admin/import-jobs/${result.jobId}\n`);

  } catch (error) {
    console.error('❌ Failed to trigger import:', error);
    process.exit(1);
  }
}

triggerImport();

