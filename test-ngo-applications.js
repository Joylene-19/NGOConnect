// Test NGO dashboard application display
const API_BASE = "http://localhost:3001";

async function testNGODashboardApplications() {
  console.log("🧪 Testing NGO dashboard applications display...");
  
  try {
    // First, login as NGO
    console.log("📝 Logging in as NGO...");
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "contact@oceanguardians.org",
        password: "password123"
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`NGO login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("✅ NGO login successful");

    // Fetch applications
    console.log("\n📝 Fetching task applications...");
    const appsResponse = await fetch(`${API_BASE}/api/my-task-applications`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!appsResponse.ok) {
      throw new Error(`Failed to fetch applications: ${appsResponse.status}`);
    }

    const applications = await appsResponse.json();
    console.log(`✅ Found ${applications.length} applications`);

    // Display each application in the new format
    applications.forEach((app, index) => {
      console.log(`\n📋 Application ${index + 1}:`);
      console.log(`   🙋 Volunteer Name: ${app.volunteer?.name || 'Unknown'}`);
      console.log(`   📝 Applied for: ${app.task?.title || 'Unknown Task'}`);
      console.log(`   📅 Task Date: ${app.task?.date ? new Date(app.task.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'No date set'}`);
      console.log(`   ⏰ Applied on: ${new Date(app.appliedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
      console.log(`   📊 Status: ${app.status}`);
      console.log(`   📧 Email: ${app.volunteer?.email || 'No email'}`);
      console.log(`   🏷️ Location: ${app.task?.location || 'No location'}`);
      console.log(`   📝 Motivation: ${app.motivation || 'No motivation provided'}`);
    });

    if (applications.length === 0) {
      console.log("ℹ️ No applications found. Consider having a volunteer apply to a task first.");
    }

  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

testNGODashboardApplications();
