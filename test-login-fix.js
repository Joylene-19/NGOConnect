// Test login functionality
const API_BASE = "http://localhost:3001";

async function testLogin() {
  console.log("🧪 Testing login functionality...");
  
  try {
    // Test with sample volunteer account
    console.log("📝 Testing volunteer login...");
    const volunteerResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "sarah.johnson@email.com",
        password: "password123"
      }),
    });

    console.log(`📡 Volunteer login response status: ${volunteerResponse.status}`);
    
    if (!volunteerResponse.ok) {
      const errorText = await volunteerResponse.text();
      console.error(`❌ Volunteer login failed: ${errorText}`);
    } else {
      const volunteerData = await volunteerResponse.json();
      console.log("✅ Volunteer login successful:", {
        user: volunteerData.user.email,
        role: volunteerData.user.role,
        hasToken: !!volunteerData.token
      });
    }

    // Test with sample NGO account
    console.log("\n📝 Testing NGO login...");
    const ngoResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "contact@oceanguardians.org",
        password: "password123"
      }),
    });

    console.log(`📡 NGO login response status: ${ngoResponse.status}`);
    
    if (!ngoResponse.ok) {
      const errorText = await ngoResponse.text();
      console.error(`❌ NGO login failed: ${errorText}`);
    } else {
      const ngoData = await ngoResponse.json();
      console.log("✅ NGO login successful:", {
        user: ngoData.user.email,
        role: ngoData.user.role,
        hasToken: !!ngoData.token
      });
    }

    // Test with invalid credentials
    console.log("\n📝 Testing invalid login...");
    const invalidResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "invalid@example.com",
        password: "wrongpassword"
      }),
    });

    console.log(`📡 Invalid login response status: ${invalidResponse.status}`);
    
    if (invalidResponse.status === 401) {
      console.log("✅ Invalid login correctly rejected with 401");
    } else {
      console.error(`❌ Expected 401 for invalid login, got ${invalidResponse.status}`);
    }

  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

testLogin();
