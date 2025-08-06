// Create a fresh volunteer application
const API_BASE = "http://localhost:3001";

async function createFreshApplication() {
  console.log("🧪 Creating a fresh volunteer application...");
  
  try {
    // Login as volunteer
    console.log("📝 Logging in as volunteer...");
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "sarah.johnson@email.com",
        password: "password123"
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Volunteer login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("✅ Volunteer login successful");

    // Get available tasks
    console.log("📝 Fetching available tasks...");
    const tasksResponse = await fetch(`${API_BASE}/api/tasks/available`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const tasks = await tasksResponse.json();
    console.log(`Found ${tasks.length} available tasks`);

    if (tasks.length > 0) {
      const task = tasks[0]; // Get the first available task
      console.log(`Applying to task: ${task.title} (Date: ${task.date || 'No date'})`);

      // Apply to the task
      const applyResponse = await fetch(`${API_BASE}/api/tasks/${task.id}/apply`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          motivation: "I'm excited to participate in this environmental task and contribute to making a positive impact!"
        })
      });

      if (applyResponse.ok) {
        console.log("✅ Application submitted successfully!");
        
        // Now test the NGO dashboard view
        console.log("\n📝 Testing NGO dashboard view...");
        
        // Login as NGO
        const ngoLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "contact@oceanguardians.org",
            password: "password123"
          }),
        });

        const ngoLoginData = await ngoLoginResponse.json();
        const ngoToken = ngoLoginData.token;

        // Fetch applications
        const appsResponse = await fetch(`${API_BASE}/api/my-task-applications`, {
          headers: {
            "Authorization": `Bearer ${ngoToken}`,
            "Content-Type": "application/json"
          }
        });

        const applications = await appsResponse.json();
        console.log(`\n✅ Found ${applications.length} applications in NGO dashboard:`);

        // Display the most recent application
        if (applications.length > 0) {
          const latestApp = applications[applications.length - 1];
          console.log(`\n📋 Latest Application:`);
          console.log(`   🙋 Volunteer Name: ${latestApp.volunteer?.name || 'Unknown'}`);
          console.log(`   📝 Applied for: ${latestApp.task?.title || 'Unknown Task'}`);
          console.log(`   📅 Task Date: ${latestApp.task?.date ? new Date(latestApp.task.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'No date set'}`);
          console.log(`   ⏰ Applied on: ${new Date(latestApp.appliedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`);
          console.log(`   📊 Status: ${latestApp.status}`);
          console.log(`   📧 Email: ${latestApp.volunteer?.email || 'No email'}`);
          console.log(`   🏷️ Location: ${latestApp.task?.location || 'No location'}`);
          console.log(`   📝 Motivation: ${latestApp.motivation || 'No motivation provided'}`);
        }
        
      } else {
        const errorText = await applyResponse.text();
        console.error(`❌ Failed to apply: ${errorText}`);
      }
    } else {
      console.log("ℹ️ No available tasks found");
    }

  } catch (error) {
    console.error("💥 Error:", error);
  }
}

createFreshApplication();
