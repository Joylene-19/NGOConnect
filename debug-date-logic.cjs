const axios = require('axios');

async function debugDateLogic() {
  console.log('🐛 Debugging Date Logic...\n');
  
  const today = new Date();
  console.log('Current date object:', today);
  console.log('Today ISO string:', today.toISOString());
  console.log('Today formatted (YYYY-MM-DD):', today.toISOString().split('T')[0]);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  console.log('Yesterday ISO string:', yesterday.toISOString());
  console.log('Yesterday formatted (YYYY-MM-DD):', yesterday.toISOString().split('T')[0]);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log('Tomorrow ISO string:', tomorrow.toISOString());
  console.log('Tomorrow formatted (YYYY-MM-DD):', tomorrow.toISOString().split('T')[0]);
  
  // Test the comparison logic
  const todayFormatted = today.toISOString().split('T')[0];
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  
  console.log('\nComparison test:');
  console.log(`Yesterday (${yesterdayFormatted}) < Today (${todayFormatted}):`, yesterdayFormatted < todayFormatted);
  console.log(`Today (${todayFormatted}) < Today (${todayFormatted}):`, todayFormatted < todayFormatted);
}

debugDateLogic();
