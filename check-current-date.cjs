// Check what date the system considers "today"
const today = new Date();
console.log('🗓️ Current system date information:');
console.log('Full date object:', today);
console.log('ISO string:', today.toISOString());
console.log('Date only (YYYY-MM-DD):', today.toISOString().split('T')[0]);
console.log('Local date string:', today.toLocaleDateString());

// Test what tomorrow would be
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
console.log('\n📅 Tomorrow would be:', tomorrow.toISOString().split('T')[0]);

// Test what yesterday was
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
console.log('📅 Yesterday was:', yesterday.toISOString().split('T')[0]);
