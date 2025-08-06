// Test email service environment variables directly through the server
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('=== Environment Variables Debug ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env file content length:', envContent.length);
  console.log('Contains EMAIL_USER:', envContent.includes('EMAIL_USER'));
  console.log('Contains EMAIL_PASS:', envContent.includes('EMAIL_PASS'));
}
