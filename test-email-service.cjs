const axios = require('axios');

async function testEmailService() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testing Email Service and Forgot Password Functionality\n');

    // Test email configuration
    console.log('📧 Checking email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not configured');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configured (hidden)' : 'Not configured');

    console.log('\n📋 Testing forgot password with existing user email...');
    
    // Test with a known email (Sarah Johnson - volunteer)
    const testEmail = 'sarah.johnson@email.com';
    console.log(`Testing with email: ${testEmail}`);

    const response = await axios.post(`${baseURL}/auth/forgot-password`, {
      email: testEmail
    });

    console.log('\n✅ Server Response:');
    console.log('Status:', response.status);
    console.log('Message:', response.data.message);
    
    if (response.data.resetToken) {
      console.log('Reset Token (DEV only):', response.data.resetToken);
      console.log('Reset Link (DEV only):', response.data.resetLink);
    }

    console.log('\n📬 Check server logs for email sending details...');
    console.log('If email sending failed, you should see error messages in the server console.');

    // Test with non-existent email
    console.log('\n🔍 Testing with non-existent email...');
    const nonExistentEmail = 'nonexistent@example.com';
    
    const response2 = await axios.post(`${baseURL}/auth/forgot-password`, {
      email: nonExistentEmail
    });

    console.log('Non-existent email response:', response2.data.message);

    console.log('\n📋 Email Testing Summary:');
    console.log('1. If server shows "📧 Sending email to: ..." - email service is working');
    console.log('2. If server shows "✅ Email sent successfully!" - email was delivered');
    console.log('3. If server shows "❌ Email sending failed:" - check Gmail configuration');
    console.log('4. Check your Gmail inbox for the password reset email');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

// Also test direct email configuration
function checkEmailConfig() {
  console.log('🔧 Email Configuration Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.log('\n❌ EMAIL_USER not configured properly');
    console.log('💡 Add EMAIL_USER=your-gmail@gmail.com to .env file');
  }
  
  if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
    console.log('\n❌ EMAIL_PASS not configured properly');
    console.log('💡 Generate Gmail App Password:');
    console.log('   1. Enable 2FA: https://myaccount.google.com/security');
    console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
    console.log('   3. Add EMAIL_PASS=your-16-char-app-password to .env file');
  }
}

console.log('Starting email service test...\n');
checkEmailConfig();
console.log('\n');
testEmailService();
