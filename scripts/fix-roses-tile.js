#!/usr/bin/env node
/**
 * Download and verify roses.jpg for category tile
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, '../apps/web/public/categories');
const rosesPath = path.join(categoriesDir, 'roses.jpg');

// Try multiple URLs
const urls = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80&fit=crop&auto=format',
  'https://source.unsplash.com/cBe7BxnmmIw/1920x1080',
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading from: ${url.substring(0, 60)}...`);
    
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        if (stats.size > 10000) {
          console.log(`  ✅ Downloaded: ${stats.size} bytes`);
          resolve(true);
        } else {
          console.log(`  ⚠️  File too small: ${stats.size} bytes`);
          fs.unlinkSync(filepath);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

async function main() {
  console.log('🌹 Fixing roses.jpg for category tile...\n');
  
  // Ensure directory exists
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }
  
  // Remove existing file
  if (fs.existsSync(rosesPath)) {
    fs.unlinkSync(rosesPath);
    console.log('🗑️  Removed existing roses.jpg\n');
  }
  
  // Try each URL
  for (const url of urls) {
    try {
      const success = await downloadImage(url, rosesPath);
      if (success) {
        console.log('\n✅ Success! roses.jpg downloaded and verified.');
        console.log(`📁 Location: ${rosesPath}`);
        process.exit(0);
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ All download attempts failed.');
  console.log('\nPlease manually download from:');
  console.log('  https://unsplash.com/photos/pink-petaled-flower-cBe7BxnmmIw');
  console.log(`  Save as: ${rosesPath}`);
  process.exit(1);
}

main();

