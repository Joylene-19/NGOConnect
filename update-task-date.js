// Update task with proper date
const API_BASE = "http://localhost:3001";

async function updateTaskWithDate() {
  console.log("🔧 Updating task with proper date...");
  
  try {
    // Login as NGO
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

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Get tasks
    const tasksResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const tasks = await tasksResponse.json();
    console.log(`Found ${tasks.length} tasks`);

    if (tasks.length > 0) {
      const task = tasks[0];
      console.log(`Updating task: ${task.title}`);

      // Update the task with a proper date
      const updateResponse = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          location: task.location,
          date: "2025-08-15", // Set a future date
          duration: task.duration || "3 hours",
          hours: task.hours || 3,
          maxVolunteers: task.maxVolunteers || 10,
          category: task.category || "Environmental",
          urgency: task.urgency || "medium",
          requiredSkills: task.requiredSkills || ["Teamwork"]
        })
      });

      if (updateResponse.ok) {
        console.log("✅ Task updated successfully with date: 2025-08-15");
      } else {
        console.error("❌ Failed to update task");
      }
    }

  } catch (error) {
    console.error("💥 Error:", error);
  }
}

updateTaskWithDate();
