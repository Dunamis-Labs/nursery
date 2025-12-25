// Ensure .next directory structure exists before Next.js starts
// This fixes Turbopack file system issues
const fs = require('fs');
const path = require('path');

const dirs = [
  '.next/dev/static/development',
  '.next/dev/server',
  '.next/dev/static/chunks',
  '.next/dev/static/css',
  '.next/dev/static/media',
];

// Remove .next to start fresh, then create directories
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors, might be in use
  }
}

// Create all required directories
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  try {
    fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 });
    // Verify it was created
    if (fs.existsSync(fullPath)) {
      console.log(`✓ Created directory: ${dir}`);
    } else {
      console.error(`✗ Failed to create directory: ${dir}`);
    }
  } catch (error) {
    console.error(`✗ Error creating ${dir}:`, error.message);
  }
});

// Also create a placeholder file to ensure the directory is writable
const testFile = path.join(__dirname, '.next/dev/static/development/.gitkeep');
try {
  fs.writeFileSync(testFile, '', { flag: 'w' });
  fs.unlinkSync(testFile); // Remove it immediately
} catch (error) {
  console.warn(`⚠ Could not write test file:`, error.message);
}

