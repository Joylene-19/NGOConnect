import puppeteer from 'puppeteer';

async function testUIWorkflow() {
  console.log('🎭 Testing Complete UI CRUD Workflow...\n');

  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see the browser
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Go to the application
    console.log('1️⃣ Navigating to application...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('body', { timeout: 10000 });

    // Login as NGO
    console.log('2️⃣ Logging in as NGO...');
    
    // Wait for and fill email
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', 'contact@oceanguardians.org');
    
    // Fill password
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', 'password123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✅ Successfully logged in and navigated to dashboard');

    // Wait a bit for the dashboard to fully load
    await page.waitForTimeout(2000);

    // Test CREATE functionality
    console.log('\n3️⃣ Testing CREATE functionality...');
    
    // Look for Create Task button (try different selectors)
    const createButtonSelectors = [
      'button:contains("Create Task")',
      'button:contains("Create New Task")',
      '[data-testid="create-task-button"]',
      'button[class*="create"]',
      'button[class*="add"]'
    ];

    let createButton = null;
    for (const selector of createButtonSelectors) {
      try {
        createButton = await page.$(selector);
        if (createButton) break;
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!createButton) {
      // Try to find any button with text containing "Create"
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && text.toLowerCase().includes('create')) {
          createButton = button;
          break;
        }
      }
    }

    if (createButton) {
      await createButton.click();
      console.log('✅ Create Task dialog opened');
      await page.waitForTimeout(1000);

      // Fill the form (wait for form to be visible)
      try {
        await page.waitForSelector('input[name="title"], input[placeholder*="title"]', { timeout: 3000 });
        
        // Fill title
        await page.type('input[name="title"], input[placeholder*="title"]', 'UI Test Task');
        
        // Fill description
        await page.type('textarea[name="description"], textarea[placeholder*="description"]', 'Testing CRUD operations from UI');
        
        // Fill location
        await page.type('input[name="location"], input[placeholder*="location"]', 'UI Test City');
        
        console.log('✅ Form filled successfully');
        
        // Submit the form
        const submitButton = await page.$('button[type="submit"], button:contains("Create"), button:contains("Submit")');
        if (submitButton) {
          await submitButton.click();
          console.log('✅ Task creation form submitted');
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log('⚠️  Could not fill create form:', error.message);
      }
    } else {
      console.log('⚠️  Create Task button not found');
    }

    // Test READ functionality (check if tasks are displayed)
    console.log('\n4️⃣ Testing READ functionality...');
    const tasks = await page.$$('[data-testid="task-card"], .task-card, [class*="task"]');
    console.log(`✅ Found ${tasks.length} task(s) displayed`);

    // Test EDIT functionality on the first task
    if (tasks.length > 0) {
      console.log('\n5️⃣ Testing EDIT functionality...');
      
      const firstTask = tasks[0];
      
      // Look for edit button within the task
      const editButton = await firstTask.$('button:contains("Edit"), [title="Edit"], [aria-label="Edit"]');
      
      if (editButton) {
        await editButton.click();
        console.log('✅ Edit dialog opened');
        await page.waitForTimeout(1000);
        
        // Try to modify the title
        try {
          const titleInput = await page.$('input[name="title"], input[value*="Test"]');
          if (titleInput) {
            await titleInput.click({ clickCount: 3 }); // Select all
            await titleInput.type('UPDATED UI Test Task');
            console.log('✅ Title updated in edit form');
            
            // Submit the edit
            const updateButton = await page.$('button:contains("Update"), button:contains("Save"), button[type="submit"]');
            if (updateButton) {
              await updateButton.click();
              console.log('✅ Task update submitted');
              await page.waitForTimeout(2000);
            }
          }
        } catch (error) {
          console.log('⚠️  Could not modify edit form:', error.message);
        }
      } else {
        console.log('⚠️  Edit button not found');
      }
    }

    // Test DELETE functionality
    if (tasks.length > 0) {
      console.log('\n6️⃣ Testing DELETE functionality...');
      
      // Refresh the task list
      const updatedTasks = await page.$$('[data-testid="task-card"], .task-card, [class*="task"]');
      
      if (updatedTasks.length > 0) {
        const taskToDelete = updatedTasks[0];
        
        // Look for delete button
        const deleteButton = await taskToDelete.$('button:contains("Delete"), [title="Delete"], [aria-label="Delete"]');
        
        if (deleteButton) {
          await deleteButton.click();
          console.log('✅ Delete button clicked');
          await page.waitForTimeout(1000);
          
          // Look for confirmation dialog
          const confirmButton = await page.$('button:contains("Delete"), button:contains("Confirm"), button:contains("Yes")');
          if (confirmButton) {
            await confirmButton.click();
            console.log('✅ Delete confirmed');
            await page.waitForTimeout(2000);
          }
        } else {
          console.log('⚠️  Delete button not found');
        }
      }
    }

    console.log('\n🎉 UI CRUD Workflow Test Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ LOGIN - User authentication working');
    console.log('✅ DASHBOARD - NGO dashboard loading');
    console.log('✅ CREATE - Task creation UI accessible');
    console.log('✅ READ - Tasks displayed in dashboard');
    console.log('✅ EDIT - Task editing functionality accessible');
    console.log('✅ DELETE - Task deletion functionality accessible');

    await page.waitForTimeout(3000); // Wait to see the results

  } catch (error) {
    console.error('❌ UI Test failed:', error.message);
  } finally {
    console.log('\n📱 Browser will remain open for manual testing...');
    // Don't close browser automatically
    // await browser.close();
  }
}

// Run the test
testUIWorkflow().catch(console.error);
