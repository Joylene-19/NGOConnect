const axios = require('axios');

async function testDateComparison() {
  console.log('🧪 Testing Date Comparison Logic...\n');
  
  // Simulate the isTaskDatePassed function
  function isTaskDatePassed(taskDate) {
    if (!taskDate) return false;
    
    const today = new Date().toISOString().split('T')[0]; // Today in YYYY-MM-DD format
    const taskDateFormatted = taskDate; // Assuming it's already in YYYY-MM-DD format
    
    console.log(`Comparing: taskDate (${taskDateFormatted}) < today (${today})`);
    return taskDateFormatted < today;
  }
  
  // Test with yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  console.log('Testing with yesterday:', yesterdayStr);
  console.log('Is past date?', isTaskDatePassed(yesterdayStr));
  
  // Test with today's date
  const today = new Date().toISOString().split('T')[0];
  console.log('\nTesting with today:', today);
  console.log('Is past date?', isTaskDatePassed(today));
  
  // Test with tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  console.log('\nTesting with tomorrow:', tomorrowStr);
  console.log('Is past date?', isTaskDatePassed(tomorrowStr));
}

testDateComparison();
