import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./mongoStorage";
import { User, Task, TaskApplication, Review, Contact, Attendance, Certificate } from "./models";
import { insertProjectSchema, insertServerStatusSchema, insertProjectStatsSchema, loginSchema, signupSchema, mongoTaskSchema, insertTaskApplicationSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { emailService } from "./emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here-please-change-in-production";

// Utility function to format dates consistently as YYYY-MM-DD
function formatDateToISO(date: any): string {
  if (!date) return new Date().toISOString().split('T')[0];
  
  // If it's already a valid ISO date string (YYYY-MM-DD), return it
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's a Date object, format it to local date string in ISO format
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's a parseable date string, convert it properly
  const dateObj = new Date(date);
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Fallback to current date
  return new Date().toISOString().split('T')[0];
}

// Utility function to check if a task date has passed
function isTaskDatePassed(taskDate: any): boolean {
  if (!taskDate) return false;
  
  // Get today's date in UTC to avoid timezone issues
  const today = new Date();
  const todayUTC = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const todayFormatted = todayUTC.toISOString().split('T')[0]; // Today in YYYY-MM-DD format
  
  const taskDateFormatted = formatDateToISO(taskDate);
  
  console.log(`[AUTO-CLOSE] Comparing: taskDate (${taskDateFormatted}) <= today (${todayFormatted})`);
  return taskDateFormatted <= todayFormatted; // Include tasks on the same date
}

// Utility function to auto-update task status based on date
async function updateTaskStatusIfNeeded(task: any): Promise<any> {
  const isDatePassed = isTaskDatePassed(task.date);
  
  console.log(`[AUTO-CLOSE] Task ${task.id} (${task.title}): date=${formatDateToISO(task.date)}, status=${task.status}, isPassed=${isDatePassed}`);
  
  // If task date has passed and status is still 'open', update it to 'closed'
  if (isDatePassed && task.status === 'open') {
    console.log(`[AUTO-CLOSE] Auto-closing task ${task.id} as date has passed`);
    try {
      const updatedTask = await storage.updateTask(task.id, { 
        status: 'closed',
        taskStatus: 'Closed'
      });
      console.log(`[AUTO-CLOSE] Successfully updated task ${task.id} to closed status`);
      return updatedTask || { ...task, status: 'closed', taskStatus: 'Closed' };
    } catch (error) {
      console.error(`[AUTO-CLOSE] Error auto-updating task ${task.id}:`, error);
      // Return task with updated status even if DB update fails
      return { ...task, status: 'closed', taskStatus: 'Closed' };
    }
  }
  
  return task;
}

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Test MongoDB connection and data insertion
  app.get("/api/test-db", async (req, res) => {
    try {
      // Test creating a sample user
      const testUser = new User({
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "testpassword123", // Add required password field
        role: "volunteer"
      });
      
      const savedUser = await testUser.save();
      
      res.json({
        message: "✅ MongoDB connection and data insertion successful!",
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        },
        database: "ngoconnect",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({
        message: "❌ Database test failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { name, email, password, role } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists with this email" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return user info and token (password is not included in SelectUser)
      res.status(201).json({
        user: user,
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { email, password } = validation.data;

      // Find user by email (with password for authentication)
      const user = await storage.getUserByEmailWithPassword(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return user info and token (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Forgot password route
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists
        return res.json({ message: "If the email exists, reset instructions have been sent" });
      }

      // Generate reset token (in production, use crypto.randomBytes)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store reset token (you'd typically save this to database)
      // For now, we'll just log it - in production, save to user record
      console.log(`Password reset token for ${email}: ${resetToken}`);
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;
      console.log(`Reset link: ${resetLink}`);

      // Send password reset email
      const emailSent = await emailService.sendPasswordReset(email, resetToken, resetLink);
      
      if (!emailSent) {
        console.error("Failed to send password reset email");
        // Don't reveal to user that email failed for security reasons
      }

      res.json({ 
        message: "If the email exists, reset instructions have been sent",
        // For development only - remove in production
        developmentInfo: {
          resetToken,
          resetLink,
          emailSent
        }
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Reset password route
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: "Email, token, and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // In production, verify token from database
      // For now, we'll accept any token for development
      console.log(`Password reset attempt for ${email} with token ${token}`);

      // Check if user exists
      const user = await storage.getUserByEmailWithPassword(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid reset token" });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password in database
      const passwordUpdated = await storage.updateUserPassword(user.id, hashedPassword);
      
      if (!passwordUpdated) {
        return res.status(500).json({ error: "Failed to update password" });
      }

      console.log(`✅ Password successfully updated for user ${user.id} (${email})`);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Task routes
  app.get("/api/tasks", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { skills, location, status } = req.query;
      let tasks;

      if (role === "ngo") {
        // NGOs see only their own tasks
        tasks = await storage.getTasksByNgo(userId);
      } else if (role === "volunteer") {
        // Volunteers see all available tasks (not completed/cancelled/closed)
        tasks = await storage.getTasks();
        
        // Auto-update task statuses first
        const updatedTasks = await Promise.all(tasks.map(task => updateTaskStatusIfNeeded(task)));
        
        // Filter by status - only show open and in-progress tasks for volunteers
        tasks = updatedTasks.filter((task: any) => 
          task.status === 'open' || task.status === 'in-progress'
        );
        
        // Filter by skills if provided
        if (skills) {
          const skillsArray = Array.isArray(skills) ? skills : [skills];
          tasks = tasks.filter((task: any) => 
            task.skillsRequired.some((skill: string) => 
              skillsArray.some((userSkill: string) => 
                skill.toLowerCase().includes(userSkill.toLowerCase())
              )
            )
          );
        }
        
        // Filter by location if provided
        if (location) {
          tasks = tasks.filter((task: any) => 
            task.location.toLowerCase().includes(location.toLowerCase())
          );
        }
      } else {
        // Admin sees all tasks
        tasks = await storage.getTasks();
      }

      // Get NGO information and application counts for each task
      const transformedTasks = await Promise.all(tasks.map(async (task: any) => {
        // Auto-update task status if date has passed
        const updatedTask = await updateTaskStatusIfNeeded(task);
        
        // Get NGO name
        const ngo = await storage.getUser(updatedTask.ngoId);
        
        // Get application count
        const applications = await storage.getApplicationsByTask(updatedTask.id);
        const approvedApplications = applications.filter(app => app.status === 'approved');
        
        return {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          organization: ngo ? ngo.username : 'Organization',
          location: updatedTask.location,
          date: formatDateToISO(updatedTask.date),
          duration: updatedTask.timeCommitment,
          volunteers: approvedApplications.length,
          maxVolunteers: 10, // TODO: Add to schema
          skills: updatedTask.skillsRequired || [],
          urgency: 'medium', // TODO: Add to schema
          category: updatedTask.category || 'General',
          postedBy: updatedTask.ngoId,
          status: updatedTask.status,
          taskStatus: updatedTask.status === 'open' ? 'Not Started' : 
                     updatedTask.status === 'in-progress' ? 'In Progress' : 
                     updatedTask.status === 'completed' ? 'Completed' :
                     updatedTask.status === 'closed' ? 'Closed' : 'Not Started',
          createdAt: updatedTask.createdAt,
          updatedAt: updatedTask.updatedAt,
          appliedVolunteers: applications.map(app => app.volunteerId),
          approvedVolunteers: approvedApplications.map(app => app.volunteerId)
        };
      }));

      res.json(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can create tasks" });
      }

      // Add postedBy to the request body before validation
      const taskDataWithUser = { 
        ...req.body, 
        postedBy: userId 
      };

      const validation = mongoTaskSchema.safeParse(taskDataWithUser);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      // Prepare task data with default values
      const taskData = { 
        ...validation.data,
        status: 'open',
        taskStatus: 'Not Started',
        appliedVolunteers: [],
        approvedVolunteers: [],
        // Ensure required fields have defaults if not provided
        category: validation.data.category || 'General',
        hours: validation.data.hours || 4,
        urgency: 'medium' // Add default urgency
      };

      const task = await storage.createTask(taskData);
      
      // Get NGO information for response
      const ngo = await storage.getUser(userId);
      
      // Return enriched task data
      const response = {
        id: task.id,
        title: task.title,
        description: task.description,
        organization: ngo ? ngo.username : 'Organization',
        location: task.location,
        date: formatDateToISO(task.date),
        duration: task.timeCommitment,
        volunteers: 0,
        maxVolunteers: 10,
        skills: task.skillsRequired || [],
        urgency: 'medium',
        category: task.category || 'General',
        postedBy: task.ngoId,
        status: task.status,
        taskStatus: 'Not Started',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        appliedVolunteers: [],
        approvedVolunteers: []
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ 
        error: "Failed to create task",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/tasks/:id", verifyToken, async (req: any, res) => {
    try {
      const taskId = req.params.id; // Keep as string for MongoDB
      const { role, userId } = req.user;

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Check permissions - only the NGO that created the task can update it
      if (role === "ngo" && task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only update your own tasks" });
      }

      // Admin can update any task
      if (role !== "ngo" && role !== "admin") {
        return res.status(403).json({ error: "Only NGOs and admins can update tasks" });
      }

      const updates = req.body;
      
      // Handle date format conversion if date is being updated
      if (updates.date) {
        // Convert the date to proper Date object for MongoDB without timezone issues
        if (typeof updates.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(updates.date)) {
          const dateParts = updates.date.split('-');
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
          const day = parseInt(dateParts[2]);
          updates.date = new Date(year, month, day, 12, 0, 0); // Noon local time
        } else {
          updates.date = new Date(updates.date);
        }
      }
      
      // Validate status updates
      if (updates.status && !['open', 'in-progress', 'completed', 'cancelled', 'closed'].includes(updates.status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      if (updates.taskStatus && !['Not Started', 'In Progress', 'Completed', 'Closed'].includes(updates.taskStatus)) {
        return res.status(400).json({ error: "Invalid task status value" });
      }

      const updatedTask = await storage.updateTask(taskId, updates);
      
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found after update" });
      }

      // Get NGO information for response
      const ngo = await storage.getUser(updatedTask.ngoId);
      const applications = await storage.getApplicationsByTask(taskId);
      const approvedApplications = applications.filter(app => app.status === 'approved');
      
      const response = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        organization: ngo ? ngo.username : 'Organization',
        location: updatedTask.location,
        date: formatDateToISO(updatedTask.date),
        duration: updatedTask.timeCommitment,
        volunteers: approvedApplications.length,
        maxVolunteers: 10,
        skills: updatedTask.skillsRequired || [],
        urgency: 'medium',
        category: updatedTask.category || 'General',
        postedBy: updatedTask.ngoId,
        status: updatedTask.status,
        taskStatus: updatedTask.status === 'open' ? 'Not Started' : 
                   updatedTask.status === 'in-progress' ? 'In Progress' : 'Completed',
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
        appliedVolunteers: applications.map(app => app.volunteerId),
        approvedVolunteers: approvedApplications.map(app => app.volunteerId)
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE /api/tasks/:id - Delete a task
  app.delete("/api/tasks/:id", verifyToken, async (req: any, res) => {
    try {
      const taskId = req.params.id;
      const { role, userId } = req.user;

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Check permissions - only the NGO that created the task can delete it
      if (role === "ngo" && task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only delete your own tasks" });
      }

      // Admin can delete any task
      if (role !== "ngo" && role !== "admin") {
        return res.status(403).json({ error: "Only NGOs and admins can delete tasks" });
      }

      const deleted = await storage.deleteTask(taskId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Task not found or could not be deleted" });
      }

      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get available tasks for volunteers with advanced filtering
  app.get("/api/tasks/available", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      
      if (role !== "volunteer") {
        return res.status(403).json({ error: "This endpoint is for volunteers only" });
      }

      const { skills, location, category, urgency } = req.query;
      
      // Get all open tasks
      let tasks = await storage.getTasks();
      
      // Auto-update task statuses and then filter for open tasks only
      const updatedTasks = await Promise.all(tasks.map(task => updateTaskStatusIfNeeded(task)));
      tasks = updatedTasks.filter((task: any) => task.status === 'open');
      
      // Apply filters
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
        tasks = tasks.filter((task: any) => 
          task.skillsRequired.some((skill: string) => 
            skillsArray.some((userSkill: string) => 
              skill.toLowerCase().includes(userSkill.toLowerCase().trim())
            )
          )
        );
      }
      
      if (location) {
        tasks = tasks.filter((task: any) => 
          task.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      if (category) {
        tasks = tasks.filter((task: any) => 
          task.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Transform tasks and add application status for this volunteer
      const transformedTasks = await Promise.all(tasks.map(async (task: any) => {
        const ngo = await storage.getUser(task.ngoId);
        const applications = await storage.getApplicationsByTask(task.id);
        const userApplication = applications.find(app => app.volunteerId === userId);
        const approvedApplications = applications.filter(app => app.status === 'approved');
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          organization: ngo ? ngo.username : 'Organization',
          location: task.location,
          date: formatDateToISO(task.date),
          duration: task.timeCommitment,
          volunteers: approvedApplications.length,
          maxVolunteers: 10,
          skills: task.skillsRequired || [],
          urgency: 'medium',
          category: task.category || 'General',
          postedBy: task.ngoId,
          status: task.status,
          taskStatus: 'Not Started',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          // Additional info for volunteers
          hasApplied: !!userApplication,
          applicationStatus: userApplication ? userApplication.status : null,
          applicationId: userApplication ? userApplication.id : null
        };
      }));

      res.json(transformedTasks);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
      res.status(500).json({ error: "Failed to fetch available tasks" });
    }
  });

  // Task application routes
  app.post("/api/tasks/:id/apply", verifyToken, async (req: any, res) => {
    try {
      const taskId = req.params.id;
      const { role, userId } = req.user;
      const { motivation } = req.body;

      if (role !== "volunteer") {
        return res.status(403).json({ error: "Only volunteers can apply to tasks" });
      }

      // Check if task exists and is available
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Auto-update task status if date has passed
      const updatedTask = await updateTaskStatusIfNeeded(task);

      if (updatedTask.status !== 'open') {
        const statusMessage = updatedTask.status === 'closed' 
          ? "This task is closed as the date has passed" 
          : "This task is no longer accepting applications";
        return res.status(400).json({ error: statusMessage });
      }

      // Check if volunteer has already applied
      const existingApplications = await storage.getApplicationsByTask(taskId);
      const existingApplication = existingApplications.find(app => app.volunteerId === userId);
      
      if (existingApplication) {
        return res.status(409).json({ 
          error: "You have already applied to this task", 
          applicationId: existingApplication.id,
          status: existingApplication.status
        });
      }

      const application = await storage.createTaskApplication({
        taskId,
        volunteerId: userId,
        motivation: motivation || '', // Optional motivation message
        status: "pending"
      });

      // Get task and user details for response and email
      const volunteer = await storage.getUser(userId);
      const ngo = await storage.getUser(updatedTask.ngoId);
      
      const response = {
        id: application.id,
        taskId: application.taskId,
        volunteerId: application.volunteerId,
        status: application.status,
        motivation: application.message,
        appliedAt: application.createdAt,
        task: {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          location: updatedTask.location,
          organization: ngo ? ngo.username : 'Organization'
        },
        volunteer: {
          id: volunteer?.id,
          name: volunteer?.username,
          email: volunteer?.email
        }
      };

      // Send email notification to NGO (async, don't wait for it)
      if (ngo && volunteer) {
        emailService.sendApplicationNotification(
          ngo.email,
          ngo.username,
          volunteer.username,
          updatedTask.title,
          motivation || ''
        ).catch(error => {
          console.error('Failed to send application notification email:', error);
        });
      }

      res.status(201).json(response);
    } catch (error) {
      console.error("Error applying to task:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to apply to task" 
      });
    }
  });

  app.get("/api/my-applications", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;

      if (role !== "volunteer") {
        return res.status(403).json({ error: "Only volunteers can view applications" });
      }

      const applications = await storage.getApplicationsByVolunteer(userId);
      
      // Get detailed information for each application
      const transformedApplications = await Promise.all(applications.map(async (app: any) => {
        const task = await storage.getTask(app.taskId);
        const ngo = task ? await storage.getUser(task.ngoId) : null;
        
        return {
          id: app.id,
          taskId: app.taskId,
          volunteerId: app.volunteerId,
          status: app.status,
          appliedAt: app.createdAt,
          motivation: app.message || '',
          task: task ? {
            id: task.id,
            title: task.title,
            description: task.description,
            location: task.location,
            date: formatDateToISO(task.date),
            duration: task.timeCommitment || task.duration || '4 hours',
            skills: task.skillsRequired || task.requiredSkills || [],
            category: task.category || 'General',
            status: task.status,
            organization: ngo ? ngo.username : 'Organization'
          } : null
        };
      }));

      // Filter out applications where task was deleted
      const validApplications = transformedApplications.filter(app => app.task !== null);

      res.json(validApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.put("/api/applications/:id", verifyToken, async (req: any, res) => {
    try {
      const applicationId = req.params.id;
      const { status } = req.body;
      const { role, userId } = req.user;

      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'pending', 'approved', or 'rejected'" });
      }

      // Get the application to check permissions
      const application = await storage.getTaskApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Get the task to verify the NGO owns it
      const task = await storage.getTask(application.taskId);
      if (!task) {
        return res.status(404).json({ error: "Associated task not found" });
      }

      // Check permissions - only the NGO that posted the task can approve/reject
      if (role === "ngo" && task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only manage applications for your own tasks" });
      }

      if (role !== "ngo" && role !== "admin") {
        return res.status(403).json({ error: "Only NGOs and admins can update applications" });
      }

      const updatedApplication = await storage.updateTaskApplication(applicationId, { 
        status,
        approvedAt: status === 'approved' ? new Date() : null
      });

      if (!updatedApplication) {
        return res.status(404).json({ error: "Application not found after update" });
      }

      // Get additional details for response
      const volunteer = await storage.getUser(updatedApplication.volunteerId);
      const ngo = await storage.getUser(task.ngoId);

      const response = {
        id: updatedApplication.id,
        taskId: updatedApplication.taskId,
        volunteerId: updatedApplication.volunteerId,
        status: updatedApplication.status,
        appliedAt: updatedApplication.createdAt,
        motivation: updatedApplication.message,
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          location: task.location,
          organization: ngo ? ngo.username : 'Organization'
        },
        volunteer: {
          id: volunteer?.id,
          name: volunteer?.username,
          email: volunteer?.email
        }
      };

      // Send email notification to volunteer (async, don't wait for it)
      if (volunteer && ngo && (status === 'approved' || status === 'rejected')) {
        emailService.sendApplicationStatusNotification(
          volunteer.email,
          volunteer.username,
          task.title,
          ngo.username,
          status as 'approved' | 'rejected'
        ).catch(error => {
          console.error('Failed to send application status notification email:', error);
        });
      }

      res.json(response);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Approve application endpoint
  app.post("/api/applications/:applicationId/approve", verifyToken, async (req: any, res) => {
    try {
      const applicationId = req.params.applicationId;
      const { role, userId } = req.user;

      // Get the application to check permissions
      const application = await storage.getTaskApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Get the task to verify the NGO owns it
      const task = await storage.getTask(application.taskId);
      if (!task) {
        return res.status(404).json({ error: "Associated task not found" });
      }

      // Check permissions - only the NGO that posted the task can approve
      if (role !== "ngo" || task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only approve applications for your own tasks" });
      }

      // Update application status to approved
      const updatedApplication = await storage.updateTaskApplication(applicationId, { 
        status: 'approved',
        approvedAt: new Date()
      });

      if (!updatedApplication) {
        return res.status(404).json({ error: "Application not found after update" });
      }

      // Get additional details for response
      const volunteer = await storage.getUser(updatedApplication.volunteerId);
      const ngo = await storage.getUser(task.ngoId);

      // Send email notification to volunteer (async, don't wait for it)
      if (volunteer && ngo) {
        emailService.sendApplicationStatusNotification(
          volunteer.email,
          volunteer.username,
          task.title,
          ngo.username,
          'approved'
        ).catch(error => {
          console.error('Failed to send application approval notification email:', error);
        });
      }

      res.json({
        success: true,
        message: "Application approved successfully",
        application: {
          id: updatedApplication.id,
          taskId: updatedApplication.taskId,
          volunteerId: updatedApplication.volunteerId,
          status: updatedApplication.status,
          approvedAt: updatedApplication.approvedAt
        }
      });
    } catch (error) {
      console.error("Error approving application:", error);
      res.status(500).json({ error: "Failed to approve application" });
    }
  });

  // Reject application endpoint
  app.post("/api/applications/:applicationId/reject", verifyToken, async (req: any, res) => {
    try {
      const applicationId = req.params.applicationId;
      const { role, userId } = req.user;

      // Get the application to check permissions
      const application = await storage.getTaskApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Get the task to verify the NGO owns it
      const task = await storage.getTask(application.taskId);
      if (!task) {
        return res.status(404).json({ error: "Associated task not found" });
      }

      // Check permissions - only the NGO that posted the task can reject
      if (role !== "ngo" || task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only reject applications for your own tasks" });
      }

      // Update application status to rejected
      const updatedApplication = await storage.updateTaskApplication(applicationId, { 
        status: 'rejected',
        rejectedAt: new Date()
      });

      if (!updatedApplication) {
        return res.status(404).json({ error: "Application not found after update" });
      }

      // Get additional details for response
      const volunteer = await storage.getUser(updatedApplication.volunteerId);
      const ngo = await storage.getUser(task.ngoId);

      // Send email notification to volunteer (async, don't wait for it)
      if (volunteer && ngo) {
        emailService.sendApplicationStatusNotification(
          volunteer.email,
          volunteer.username,
          task.title,
          ngo.username,
          'rejected'
        ).catch(error => {
          console.error('Failed to send application rejection notification email:', error);
        });
      }

      res.json({
        success: true,
        message: "Application rejected successfully",
        application: {
          id: updatedApplication.id,
          taskId: updatedApplication.taskId,
          volunteerId: updatedApplication.volunteerId,
          status: updatedApplication.status,
          rejectedAt: updatedApplication.rejectedAt
        }
      });
    } catch (error) {
      console.error("Error rejecting application:", error);
      res.status(500).json({ error: "Failed to reject application" });
    }
  });

  // Get applications for NGO's tasks
  app.get("/api/my-task-applications", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;

      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can view task applications" });
      }

      // Get all tasks posted by this NGO
      const ngoTasks = await storage.getTasksByNgo(userId);
      
      // Get applications for all these tasks
      const allApplications = await Promise.all(
        ngoTasks.map(task => storage.getApplicationsByTask(task.id))
      );
      
      // Flatten the array and add task details
      const applications = allApplications.flat();
      
      const transformedApplications = await Promise.all(applications.map(async (app: any) => {
        const task = await storage.getTask(app.taskId);
        const volunteer = await storage.getUser(app.volunteerId);
        
        return {
          id: app.id,
          taskId: app.taskId,
          volunteerId: app.volunteerId,
          status: app.status,
          appliedAt: app.createdAt,
          motivation: app.message || '',
          task: task ? {
            id: task.id,
            title: task.title,
            description: task.description,
            location: task.location,
            category: task.category || 'General',
            status: task.status,
            date: formatDateToISO(task.date)
          } : null,
          volunteer: volunteer ? {
            id: volunteer.id,
            name: volunteer.username,
            email: volunteer.email
          } : null
        };
      }));

      res.json(transformedApplications);
    } catch (error) {
      console.error("Error fetching task applications:", error);
      res.status(500).json({ error: "Failed to fetch task applications" });
    }
  });

  // Review routes - Feedback and Rating System
  app.post("/api/reviews", verifyToken, async (req: any, res) => {
    try {
      const { userId } = req.user;
      
      // Create a MongoDB-compatible review schema
      const reviewSchema = z.object({
        taskId: z.string().min(1, "Task ID is required"),
        revieweeId: z.string().min(1, "Reviewee ID is required"),
        rating: z.number().min(1).max(5),
        comment: z.string().optional()
      });
      
      const validation = reviewSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { taskId, revieweeId, rating, comment } = validation.data;

      // Verify task exists and is completed
      const task = await Task.findById(taskId).lean();
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.status !== 'completed' && task.taskStatus !== 'Completed') {
        return res.status(400).json({ error: "Reviews can only be submitted for completed tasks" });
      }

      // Check if reviewer is involved in the task
      const applications = await storage.getApplicationsByTask(taskId);
      const isNgoOwner = task.postedBy.toString() === userId;
      const isApprovedVolunteer = applications.some(app => 
        app.volunteerId === userId && app.status === 'approved'
      );

      if (!isNgoOwner && !isApprovedVolunteer) {
        return res.status(403).json({ error: "You can only review tasks you're involved with" });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        taskId,
        reviewerId: userId,
        revieweeId
      });

      if (existingReview) {
        return res.status(409).json({ error: "You have already reviewed this person for this task" });
      }

      const reviewData = {
        taskId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment: comment || ''
      };

      const review = await storage.createReview(reviewData);
      
      // Get additional details for response
      const reviewer = await storage.getUser(userId);
      const reviewee = await storage.getUser(revieweeId);
      
      const response = {
        ...review,
        reviewer: {
          id: reviewer?.id,
          name: reviewer?.username,
          role: reviewer?.role
        },
        reviewee: {
          id: reviewee?.id,
          name: reviewee?.username,
          role: reviewee?.role
        },
        task: {
          id: task._id.toString(),
          title: task.title
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Get reviews for a user (to display on profile)
  app.get("/api/users/:id/reviews", verifyToken, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      const reviews = await storage.getReviewsByUser(userId);
      const averageRating = await storage.getUserAverageRating(userId);
      
      res.json({
        reviews: reviews,
        averageRating: averageRating,
        totalReviews: reviews.length
      });
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Get reviews for a specific task
  app.get("/api/tasks/:id/reviews", verifyToken, async (req: any, res) => {
    try {
      const taskId = req.params.id;
      const { role, userId } = req.user;
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Check permissions
      const applications = await storage.getApplicationsByTask(taskId);
      const isNgoOwner = task.ngoId === userId;
      const isApprovedVolunteer = applications.some(app => 
        app.volunteerId === userId && app.status === 'approved'
      );

      if (!isNgoOwner && !isApprovedVolunteer && role !== 'admin') {
        return res.status(403).json({ error: "You can only view reviews for tasks you're involved with" });
      }

      const reviews = await storage.getReviewsByTask(taskId);
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching task reviews:", error);
      res.status(500).json({ error: "Failed to fetch task reviews" });
    }
  });

  // Get pending reviews (tasks completed but not yet reviewed)
  app.get("/api/my-pending-reviews", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      
      let pendingReviews = [];

      if (role === 'ngo') {
        // Get completed tasks owned by NGO
        const tasks = await storage.getTasksByNgo(userId);
        const completedTasks = tasks.filter(task => task.status === 'completed');
        
        for (const task of completedTasks) {
          const applications = await storage.getApplicationsByTask(task.id);
          const approvedVolunteers = applications.filter(app => app.status === 'approved');
          
          for (const app of approvedVolunteers) {
            // Check if NGO has already reviewed this volunteer
            const existingReview = await Review.findOne({
              taskId: task.id,
              reviewerId: userId,
              revieweeId: app.volunteerId
            });
            
            if (!existingReview) {
              const volunteer = await storage.getUser(app.volunteerId);
              pendingReviews.push({
                taskId: task.id,
                taskTitle: task.title,
                revieweeId: app.volunteerId,
                revieweeName: volunteer?.username || 'Unknown',
                revieweeRole: 'volunteer',
                canReview: true
              });
            }
          }
        }
      } else if (role === 'volunteer') {
        // Get tasks where volunteer was approved and task is completed
        const applications = await storage.getApplicationsByVolunteer(userId);
        const approvedApplications = applications.filter(app => app.status === 'approved');
        
        for (const app of approvedApplications) {
          const task = await storage.getTask(app.taskId);
          if (task && task.status === 'completed') {
            // Check if volunteer has already reviewed the NGO
            const existingReview = await Review.findOne({
              taskId: app.taskId,
              reviewerId: userId,
              revieweeId: task.ngoId
            });
            
            if (!existingReview) {
              const ngo = await storage.getUser(task.ngoId);
              pendingReviews.push({
                taskId: app.taskId,
                taskTitle: task.title,
                revieweeId: task.ngoId,
                revieweeName: ngo?.username || 'Unknown',
                revieweeRole: 'ngo',
                canReview: true
              });
            }
          }
        }
      }
      
      res.json(pendingReviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ error: "Failed to fetch pending reviews" });
    }
  });

  // Certificate generation route with Puppeteer
  app.post("/api/certificates/generate", verifyToken, async (req: any, res) => {
    try {
      const { taskId, volunteerId } = req.body;
      const { role, userId } = req.user;

      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can generate certificates" });
      }

      // Verify task is completed
      const task = await Task.findById(taskId).populate('postedBy').lean();
      const volunteer = await storage.getUser(volunteerId);
      const ngo = await storage.getUser(userId);

      if (!task || !volunteer || !ngo) {
        return res.status(404).json({ error: "Task, volunteer, or NGO not found" });
      }

      // Check if NGO owns the task
      if (task.postedBy._id.toString() !== userId) {
        return res.status(403).json({ error: "You can only generate certificates for your own tasks" });
      }

      // Check if task is completed
      if (task.status !== 'completed' && task.taskStatus !== 'Completed') {
        return res.status(400).json({ error: "Certificates can only be generated for completed tasks" });
      }

      // Check if volunteer was approved for this task
      const applications = await storage.getApplicationsByTask(taskId);
      const approvedApplication = applications.find(app => 
        app.volunteerId === volunteerId && app.status === 'approved'
      );

      if (!approvedApplication) {
        return res.status(400).json({ error: "Volunteer was not approved for this task" });
      }

      // Generate certificate HTML
      const certificateHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .certificate-container {
              background: white;
              width: 800px;
              height: 600px;
              position: relative;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              border-radius: 10px;
              overflow: hidden;
            }
            
            .certificate-border {
              position: absolute;
              inset: 20px;
              border: 3px solid #0ea5e9;
              border-radius: 8px;
              background: linear-gradient(45deg, #f8fafc, #ffffff);
            }
            
            .certificate-content {
              position: absolute;
              inset: 40px;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #0ea5e9, #0284c7);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
              box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
            }
            
            .logo svg {
              width: 40px;
              height: 40px;
              fill: white;
            }
            
            .title {
              font-family: 'Playfair Display', serif;
              font-size: 36px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 8px;
              letter-spacing: 2px;
            }
            
            .subtitle {
              font-size: 16px;
              color: #64748b;
              margin-bottom: 30px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .recipient {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              color: #0ea5e9;
              margin-bottom: 20px;
              text-decoration: underline;
              text-decoration-color: #0ea5e9;
              text-underline-offset: 8px;
              text-decoration-thickness: 2px;
            }
            
            .achievement {
              font-size: 18px;
              color: #334155;
              margin-bottom: 25px;
              line-height: 1.6;
              max-width: 500px;
            }
            
            .task-title {
              font-weight: 600;
              color: #0f172a;
              font-size: 20px;
            }
            
            .organization {
              font-weight: 600;
              color: #0ea5e9;
            }
            
            .details {
              display: flex;
              justify-content: space-between;
              width: 100%;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
            }
            
            .detail-item {
              text-align: center;
            }
            
            .detail-label {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            
            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
            }
            
            .signature-line {
              border-bottom: 2px solid #1e293b;
              width: 200px;
              margin-bottom: 5px;
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: rgba(14, 165, 233, 0.05);
              font-weight: 700;
              z-index: 0;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="watermark">VERIFIED</div>
            <div class="certificate-border">
              <div class="certificate-content">
                <div class="logo">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                
                <h1 class="title">CERTIFICATE OF APPRECIATION</h1>
                <p class="subtitle">This is to certify that</p>
                
                <div class="recipient">${volunteer.username}</div>
                
                <div class="achievement">
                  has successfully completed the volunteer service<br>
                  <span class="task-title">"${task.title}"</span><br>
                  organized by <span class="organization">${ngo.username}</span>
                </div>
                
                <div class="details">
                  <div class="detail-item">
                    <div class="detail-label">Date Completed</div>
                    <div class="detail-value">${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${task.hours || 4} hours</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${task.location}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Authorized by</div>
                    <div class="signature-line"></div>
                    <div class="detail-value">${ngo.username}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(certificateHtml, { waitUntil: 'networkidle0' });
      
      const pdfFileName = `certificate_${taskId}_${volunteerId}_${Date.now()}.pdf`;
      const pdfPath = path.join(process.cwd(), 'server', 'certificates', pdfFileName);
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      await browser.close();

      // Store certificate record in database
      const certificate = {
        taskId,
        volunteerId,
        ngoId: userId,
        certificateUrl: `/api/certificates/download/${pdfFileName}`,
        issuedAt: new Date()
      };

      // TODO: Add certificate storage method to mongoStorage
      // const savedCertificate = await storage.createCertificate(certificate);

      // Send email notification to volunteer (async, don't wait for it)
      emailService.sendCertificateNotification(
        volunteer.email,
        volunteer.username,
        task.title,
        ngo.username,
        certificate.certificateUrl
      ).catch(error => {
        console.error('Failed to send certificate notification email:', error);
      });

      res.json({ 
        message: "Certificate generated successfully",
        certificateUrl: certificate.certificateUrl,
        fileName: pdfFileName,
        task: {
          title: task.title,
          volunteer: volunteer.username,
          ngo: ngo.username,
          completedAt: task.completedAt || new Date(),
          hours: task.hours || 4
        }
      });

    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ 
        error: "Failed to generate certificate",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Download certificate endpoint
  app.get("/api/certificates/download/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'server', 'certificates', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      res.status(500).json({ error: "Failed to download certificate" });
    }
  });

  // Projects routes - TODO: Implement project storage methods
  /*
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validation = insertProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const project = await storage.createProject(validation.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Server status routes
  app.get("/api/server-status", async (req, res) => {
    try {
      const statuses = await storage.getServerStatus();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server status" });
    }
  });

  app.post("/api/server-status", async (req, res) => {
    try {
      const validation = insertServerStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const status = await storage.updateServerStatus(validation.data);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to update server status" });
    }
  });

  // Project stats routes
  app.get("/api/project-stats/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const stats = await storage.getProjectStats(projectId);
      if (!stats) {
        return res.status(404).json({ error: "Project stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project stats" });
    }
  });

  app.post("/api/project-stats", async (req, res) => {
    try {
      const validation = insertProjectStatsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const stats = await storage.updateProjectStats(validation.data);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project stats" });
    }
  });
  */

  // Apply for a task
  app.post("/api/tasks/:taskId/apply", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId } = req.params;
      const { message } = req.body;

      if (role !== "volunteer") {
        return res.status(403).json({ error: "Only volunteers can apply for tasks" });
      }

      // Check if task exists and is open
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.status !== "open") {
        return res.status(400).json({ error: "Task is not open for applications" });
      }

      // Check if already applied
      if (task.appliedVolunteers.includes(userId)) {
        return res.status(400).json({ error: "You have already applied for this task" });
      }

      // Create application
      const application = new TaskApplication({
        taskId,
        volunteerId: userId,
        motivation: message,
        status: "pending"
      });

      await application.save();

      // Add volunteer to task's applied volunteers list
      task.appliedVolunteers.push(userId);
      await task.save();

      res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
      console.error("Error applying for task:", error);
      res.status(500).json({ error: "Failed to apply for task" });
    }
  });

  // Get applications for a task (NGO)
  app.get("/api/tasks/:taskId/applications", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId } = req.params;

      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can view task applications" });
      }

      // Verify task belongs to the NGO
      const task = await Task.findById(taskId);
      if (!task || task.postedBy.toString() !== userId) {
        return res.status(404).json({ error: "Task not found or unauthorized" });
      }

      const applications = await TaskApplication.find({ taskId })
        .populate('volunteerId', 'name email')
        .sort({ appliedAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Approve/Reject application
  app.patch("/api/applications/:applicationId", verifyToken, async (req: any, res) => {
    try {
      const applicationId = req.params.id;
      const { status } = req.body;
      const { role, userId } = req.user;

      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'pending', 'approved', or 'rejected'" });
      }

      // Get the application to check permissions
      const application = await storage.getTaskApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Get the task to verify the NGO owns it
      const task = await storage.getTask(application.taskId);
      if (!task) {
        return res.status(404).json({ error: "Associated task not found" });
      }

      // Check permissions - only the NGO that posted the task can approve/reject
      if (role === "ngo" && task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only manage applications for your own tasks" });
      }

      if (role !== "ngo" && role !== "admin") {
        return res.status(403).json({ error: "Only NGOs and admins can update applications" });
      }

      const updatedApplication = await storage.updateTaskApplication(applicationId, { 
        status,
        approvedAt: status === 'approved' ? new Date() : null
      });

      if (!updatedApplication) {
        return res.status(404).json({ error: "Application not found after update" });
      }

      // Get additional details for response
      const volunteer = await storage.getUser(updatedApplication.volunteerId);
      const ngo = await storage.getUser(task.ngoId);

      const response = {
        id: updatedApplication.id,
        taskId: updatedApplication.taskId,
        volunteerId: updatedApplication.volunteerId,
        status: updatedApplication.status,
        appliedAt: updatedApplication.createdAt,
        motivation: updatedApplication.message,
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          location: task.location,
          organization: ngo ? ngo.username : 'Organization'
        },
        volunteer: {
          id: volunteer?.id,
          name: volunteer?.username,
          email: volunteer?.email
        }
      };

      // Send email notification to volunteer (async, don't wait for it)
      if (volunteer && ngo && (status === 'approved' || status === 'rejected')) {
        emailService.sendApplicationStatusNotification(
          volunteer.email,
          volunteer.username,
          task.title,
          ngo.username,
          status as 'approved' | 'rejected'
        ).catch(error => {
          console.error('Failed to send application status notification email:', error);
        });
      }

      res.json(response);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Attendance Management Routes
  app.post("/api/attendance", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId, volunteerId, status, notes, hoursWorked } = req.body;

      // Only NGOs can mark attendance
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can mark attendance" });
      }

      // Verify the task belongs to this NGO
      const task = await storage.getTask(taskId);
      if (!task || task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only mark attendance for your own tasks" });
      }

      // Check if volunteer is approved for this task
      const application = await storage.getApplicationByTaskAndVolunteer(taskId, volunteerId);
      if (!application || application.status !== 'approved') {
        return res.status(400).json({ error: "Volunteer must be approved for this task" });
      }

      // Check if attendance already exists
      const existingAttendance = await storage.getAttendanceByTaskAndVolunteer(taskId, volunteerId);
      if (existingAttendance) {
        return res.status(400).json({ error: "Attendance already marked for this volunteer" });
      }

      const attendanceData = {
        taskId,
        volunteerId,
        status,
        markedBy: userId,
        notes: notes || '',
        hoursWorked: hoursWorked || 0,
        verified: false
      };

      const attendance = await storage.createAttendanceRecord(attendanceData);

      // Update application status based on attendance
      if (status === 'present') {
        await storage.updateApplicationStatus(application.id, 'approved', {
          attendance: 'present',
          attendanceMarkedAt: new Date()
        });
      } else if (status === 'absent') {
        await storage.updateApplicationStatus(application.id, 'approved', {
          attendance: 'absent',
          attendanceMarkedAt: new Date()
        });
      }

      res.json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ error: "Failed to mark attendance" });
    }
  });

  app.put("/api/attendance/:id", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { id } = req.params;
      const updates = req.body;

      // Only NGOs can update attendance
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can update attendance" });
      }

      const attendance = await storage.updateAttendanceRecord(id, updates);
      if (!attendance) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ error: "Failed to update attendance" });
    }
  });

  app.post("/api/attendance/:id/verify", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { id } = req.params;

      // Only NGOs can verify attendance
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can verify attendance" });
      }

      const attendance = await storage.updateAttendanceRecord(id, {
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: userId
      });

      if (!attendance) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      // Update application status to verified
      const application = await storage.getApplicationByTaskAndVolunteer(
        attendance.taskId, 
        attendance.volunteerId
      );
      
      if (application) {
        await storage.updateApplicationStatus(application.id, 'approved', {
          verified: true,
          verifiedAt: new Date()
        });
      }

      res.json(attendance);
    } catch (error) {
      console.error("Error verifying attendance:", error);
      res.status(500).json({ error: "Failed to verify attendance" });
    }
  });

  // Get today's tasks for attendance management (NEW)
  app.get("/api/attendance/tasks/today", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;

      // Only NGOs can view today's tasks for attendance
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can view today's tasks" });
      }

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      // Get all tasks for this NGO that are scheduled for today
      const todaysTasks = await Task.find({
        ngoId: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'closed' }
      }).populate('appliedVolunteers', 'name email')
        .populate('approvedVolunteers', 'name email')
        .lean();

      // For each task, get the attendance records and applications
      const tasksWithAttendance = await Promise.all(
        todaysTasks.map(async (task) => {
          // Get all approved applications for this task
          const applications = await TaskApplication.find({
            taskId: task._id,
            status: 'approved'
          }).populate('volunteerId', 'name email').lean();

          // Get attendance records for this task
          const attendanceRecords = await Attendance.find({
            taskId: task._id
          }).lean();

          // Create a map of attendance by volunteer ID
          const attendanceMap = new Map();
          attendanceRecords.forEach(record => {
            attendanceMap.set(record.volunteerId.toString(), record);
          });

          // Combine application and attendance data
          const volunteers = applications.map(app => ({
            id: app.volunteerId._id,
            name: app.volunteerId.name,
            email: app.volunteerId.email,
            applicationId: app._id,
            attendance: attendanceMap.get(app.volunteerId._id.toString()) || null,
            attendanceStatus: attendanceMap.get(app.volunteerId._id.toString())?.status || 'not-marked'
          }));

          return {
            id: task._id,
            title: task.title,
            description: task.description,
            location: task.location,
            date: task.date,
            hours: task.hours,
            volunteers,
            totalVolunteers: volunteers.length,
            presentCount: volunteers.filter(v => v.attendanceStatus === 'present').length,
            absentCount: volunteers.filter(v => v.attendanceStatus === 'absent').length,
            pendingCount: volunteers.filter(v => v.attendanceStatus === 'not-marked').length
          };
        })
      );

      res.json(tasksWithAttendance);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  // Get tasks for a specific date (NEW)
  app.get("/api/attendance/tasks/:date", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { date } = req.params;

      // Only NGOs can view tasks for attendance
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can view tasks for attendance" });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }

      // Create date range for the specified date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      // Get all tasks for this NGO on the specified date
      const dateTasks = await Task.find({
        ngoId: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'closed' }
      }).populate('appliedVolunteers', 'name email')
        .populate('approvedVolunteers', 'name email')
        .lean();
      // Similar processing as today's tasks
      const tasksWithAttendance = await Promise.all(
        dateTasks.map(async (task) => {
          const applications = await TaskApplication.find({
            taskId: task._id,
            status: 'approved'
          }).populate('volunteerId', 'name email').lean();

          const attendanceRecords = await Attendance.find({
            taskId: task._id
          }).lean();

          const attendanceMap = new Map();
          attendanceRecords.forEach(record => {
            attendanceMap.set(record.volunteerId.toString(), record);
          });

          const volunteers = applications.map(app => ({
            id: app.volunteerId._id,
            name: app.volunteerId.name,
            email: app.volunteerId.email,
            applicationId: app._id,
            attendance: attendanceMap.get(app.volunteerId._id.toString()) || null,
            attendanceStatus: attendanceMap.get(app.volunteerId._id.toString())?.status || 'not-marked'
          }));

          return {
            id: task._id,
            title: task.title,
            description: task.description,
            location: task.location,
            date: task.date,
            hours: task.hours,
            volunteers,
            totalVolunteers: volunteers.length,
            presentCount: volunteers.filter(v => v.attendanceStatus === 'present').length,
            absentCount: volunteers.filter(v => v.attendanceStatus === 'absent').length,
            pendingCount: volunteers.filter(v => v.attendanceStatus === 'not-marked').length
          };
        })
      );

      res.json(tasksWithAttendance);
    } catch (error) {
      console.error("Error fetching tasks for date:", error);
      res.status(500).json({ error: "Failed to fetch tasks for date" });
    }
  });

  // Certificate Template Management
  app.post("/api/certificate-templates", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      console.log('- User ID:', userId);
      console.log('- Role:', role);

      // Only NGOs can view task attendance
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can view task attendance" });
      }

      // Get the specific task
      const task = await Task.findById(taskId).lean();
      if (!task) {
        console.log('❌ Task not found');
        return res.status(404).json({ error: "Task not found" });
      }

      console.log('✅ Task found:', task.title);
      console.log('- Task ngoId:', task.ngoId?.toString());
      console.log('- Task postedBy:', task.postedBy?.toString());

      // Verify the task belongs to this NGO (use ngoId if available, fallback to postedBy)
      const taskOwnerId = task.ngoId?.toString() || task.postedBy?.toString();
      console.log('- Task owner ID:', taskOwnerId);
      console.log('- Ownership check:', taskOwnerId === userId);
      
      if (taskOwnerId !== userId) {
        console.log('❌ Authorization failed');
        return res.status(403).json({ error: "You can only view attendance for your own tasks" });
      }

      console.log('✅ Authorization passed');

      // Get all approved applications for this task
      const applications = await TaskApplication.find({
        taskId: taskId,
        status: 'approved'
      }).populate('volunteerId', 'name email').lean();

      console.log('📋 Applications found:', applications.length);

      // Get attendance records for this task
      const attendanceRecords = await Attendance.find({
        taskId: taskId
      }).lean();

      console.log('📊 Attendance records found:', attendanceRecords.length);

      // Create a map of attendance by volunteer ID
      const attendanceMap = new Map();
      attendanceRecords.forEach(record => {
        attendanceMap.set(record.volunteerId.toString(), record);
      });

      // Combine application and attendance data in the format frontend expects
      const volunteers = applications.map(app => {
        const attendance = attendanceMap.get(app.volunteerId._id.toString());
        return {
          volunteerId: app.volunteerId._id,
          volunteerName: app.volunteerId.name,
          volunteerEmail: app.volunteerId.email,
          attendanceStatus: attendance?.status || 'pending',
          hoursCompleted: attendance?.hoursCompleted || 0,
          markedAt: attendance?.markedAt || null,
          attendanceId: attendance?._id || null,
          trackingStatus: 'Not Started' // Default tracking status
        };
      });

      console.log('👥 Volunteers processed:', volunteers.length);

      // Return in the format frontend expects
      const taskAttendance = {
        taskId: task._id,
        taskTitle: task.title,
        taskDate: task.date,
        volunteers
      };

      console.log('📤 Sending response:', JSON.stringify(taskAttendance, null, 2));

      res.json(taskAttendance);
    } catch (error) {
      console.error("Error fetching task attendance:", error);
      res.status(500).json({ error: "Failed to fetch task attendance" });
    }
  });

  // Certificate Template Management
  app.post("/api/certificate-templates", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;

      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can create certificate templates" });
      }

      const templateData = {
        ...req.body,
        ngoId: userId
      };

      const template = await storage.createCertificateTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating certificate template:", error);
      res.status(500).json({ error: "Failed to create certificate template" });
    }
  });

  app.get("/api/certificate-templates", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;

      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can access certificate templates" });
      }

      const templates = await storage.getCertificateTemplatesByNGO(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching certificate templates:", error);
      res.status(500).json({ error: "Failed to fetch certificate templates" });
    }
  });

  app.put("/api/certificate-templates/:id", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { id } = req.params;

      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can update certificate templates" });
      }

      const template = await storage.updateCertificateTemplate(id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Certificate template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error updating certificate template:", error);
      res.status(500).json({ error: "Failed to update certificate template" });
    }
  });

  // Enhanced Certificate Generation with Templates
  app.post("/api/certificates/request", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId, volunteerId } = req.body;

      // Only verified attendance can request certificates
      const attendance = await storage.getAttendanceByTaskAndVolunteer(taskId, volunteerId);
      if (!attendance || !attendance.verified || attendance.status !== 'present') {
        return res.status(400).json({ 
          error: "Certificate can only be requested for verified attendance" 
        });
      }

      // Check if certificate already exists
      const existingCertificate = await storage.getCertificateByTaskAndVolunteer(taskId, volunteerId);
      if (existingCertificate) {
        return res.status(400).json({ error: "Certificate already exists for this task" });
      }

      // Generate certificate number
      const certificateNumber = `CERT-${taskId.slice(-6)}-${volunteerId.slice(-6)}-${Date.now()}`;

      const certificateData = {
        taskId,
        volunteerId,
        certificateNumber,
        status: 'requested',
        requestedAt: new Date(),
        hoursCompleted: attendance.hoursWorked,
        skills: [] // Will be filled from task data
      };

      const certificate = await storage.createCertificate(certificateData);
      res.json(certificate);
    } catch (error) {
      console.error("Error requesting certificate:", error);
      res.status(500).json({ error: "Failed to request certificate" });
    }
  });

  app.get("/api/certificates/volunteer/:volunteerId", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { volunteerId } = req.params;

      // Check permissions
      if (role === "volunteer" && userId !== volunteerId) {
        return res.status(403).json({ error: "You can only view your own certificates" });
      }

      const certificates = await storage.getCertificatesByVolunteer(volunteerId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching volunteer certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  app.get("/api/certificates/task/:taskId", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId } = req.params;

      // Verify access to this task
      if (role === "ngo") {
        const task = await storage.getTask(taskId);
        if (!task || task.ngoId !== userId) {
          return res.status(403).json({ error: "You can only view certificates for your own tasks" });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const certificates = await storage.getCertificatesByTask(taskId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching task certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Status Progression Automation
  app.post("/api/applications/:applicationId/progress-status", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { applicationId } = req.params;
      const { action, data } = req.body; // action: 'mark-present', 'verify', 'generate-certificate'

      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Check permissions
      if (role === "ngo") {
        const task = await storage.getTask(application.taskId);
        if (!task || task.ngoId !== userId) {
          return res.status(403).json({ error: "Insufficient permissions" });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      let result;
      
      switch (action) {
        case 'mark-present':
          // Create attendance record
          const attendanceData = {
            taskId: application.taskId,
            volunteerId: application.volunteerId,
            status: 'present',
            markedBy: userId,
            notes: data?.notes || '',
            hoursWorked: data?.hoursWorked || 0
          };
          
          result = await storage.createAttendanceRecord(attendanceData);
          
          // Update application
          await storage.updateApplicationStatus(applicationId, 'approved', {
            attendance: 'present',
            attendanceMarkedAt: new Date()
          });
          break;

        case 'verify':
          // Find and verify attendance
          const attendance = await storage.getAttendanceByTaskAndVolunteer(
            application.taskId, 
            application.volunteerId
          );
          
          if (attendance) {
            result = await storage.updateAttendanceRecord(attendance.id, {
              verified: true,
              verifiedAt: new Date(),
              verifiedBy: userId
            });
            
            await storage.updateApplicationStatus(applicationId, 'approved', {
              verified: true,
              verifiedAt: new Date()
            });
          }
          break;

        case 'generate-certificate':
          // Auto-generate certificate for verified attendance
          const verifiedAttendance = await storage.getAttendanceByTaskAndVolunteer(
            application.taskId, 
            application.volunteerId
          );
          
          if (verifiedAttendance && verifiedAttendance.verified) {
            const certificateNumber = `CERT-${application.taskId.slice(-6)}-${application.volunteerId.slice(-6)}-${Date.now()}`;
            
            const certificateData = {
              taskId: application.taskId,
              volunteerId: application.volunteerId,
              certificateNumber,
              status: 'generated',
              generatedAt: new Date(),
              hoursCompleted: verifiedAttendance.hoursWorked
            };
            
            result = await storage.createCertificate(certificateData);
            
            await storage.updateApplicationStatus(applicationId, 'approved', {
              certificateRequested: true,
              certificateIssued: true
            });
          }
          break;

        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      res.json({ success: true, result });
    } catch (error) {
      console.error("Error progressing status:", error);
      res.status(500).json({ error: "Failed to progress status" });
    }
  });

  // Attendance routes
  
  // Get today's tasks for attendance marking
  app.get("/api/attendance/today", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can access attendance" });
      }

      const todaysTasks = await storage.getTodaysTasks(userId);
      res.json(todaysTasks);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  // Get attendance for a specific task
  app.get("/api/attendance/task/:taskId", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId } = req.params;
      
      console.log('🔍 Individual task attendance endpoint called:');
      console.log('- Role:', role);
      console.log('- User ID:', userId);
      console.log('- Task ID:', taskId);
      
      if (role !== "ngo") {
        console.log('❌ Authorization failed: Not an NGO');
        return res.status(403).json({ error: "Only NGOs can view attendance" });
      }

      // Verify the task belongs to the NGO
      const task = await storage.getTask(taskId);
      console.log('📋 Task found:', !!task);
      if (task) {
        console.log('- Task ngoId:', task.ngoId);
        console.log('- Task postedBy:', task.postedBy);
        console.log('- Authorization check: ngoId match =', task.ngoId.toString() === userId);
        console.log('- Authorization check: postedBy match =', task.postedBy ? task.postedBy.toString() === userId : false);
      }
      
      if (!task || (task.ngoId.toString() !== userId && (!task.postedBy || task.postedBy.toString() !== userId))) {
        console.log('❌ Authorization failed: Task ownership');
        return res.status(403).json({ error: "You can only view attendance for your own tasks" });
      }

      // Get approved volunteers for this task
      const applications = await storage.getApplicationsByTask(taskId);
      console.log('📄 Applications found:', applications.length);
      
      const approvedVolunteers = applications.filter(app => app.status === 'approved');
      console.log('✅ Approved volunteers:', approvedVolunteers.length);
      
      if (approvedVolunteers.length > 0) {
        console.log('📝 Approved volunteer details:');
        approvedVolunteers.forEach((app, index) => {
          console.log(`  ${index + 1}. ${app.volunteerName} (${app.volunteerEmail}) - ID: ${app.volunteerId}`);
        });
      }
      
      // Get attendance records
      const attendanceRecords = await storage.getAttendanceByTask(taskId);
      console.log('📋 Attendance records found:', attendanceRecords.length);
      
      // Combine volunteer info with attendance status
      const attendanceData = approvedVolunteers.map(app => {
        const attendance = attendanceRecords.find(att => att.volunteerId === app.volunteerId);
        return {
          volunteerId: app.volunteerId,
          volunteerName: app.volunteerName,
          volunteerEmail: app.volunteerEmail,
          attendanceStatus: attendance?.status || 'pending',
          hoursCompleted: attendance?.hoursCompleted || 0,
          markedAt: attendance?.markedAt || null,
          attendanceId: attendance?.id || null
        };
      });

      console.log('📊 Final attendance data:', attendanceData.length, 'records');
      
      const response = {
        taskId,
        taskTitle: task.title,
        taskDate: task.createdAt,
        volunteers: attendanceData
      };
      
      console.log('🚀 Sending response:', JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error) {
      console.error("❌ Error fetching task attendance:", error);
      res.status(500).json({ error: "Failed to fetch task attendance" });
    }
  });

  // Mark attendance for a volunteer
  app.post("/api/attendance/mark", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId, volunteerId, status, hoursCompleted } = req.body;
      
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can mark attendance" });
      }

      if (!['present', 'absent'].includes(status)) {
        return res.status(400).json({ error: "Invalid attendance status" });
      }

      // Verify the task belongs to the NGO
      const task = await storage.getTask(taskId);
      if (!task || task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only mark attendance for your own tasks" });
      }

      const attendance = await storage.markAttendance(taskId, volunteerId, status, userId, hoursCompleted || 0);
      
      if (!attendance) {
        return res.status(500).json({ error: "Failed to mark attendance" });
      }

      res.json({
        message: "Attendance marked successfully",
        attendance
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ error: "Failed to mark attendance" });
    }
  });

  // Certificate routes
  
  // Generate certificate for a volunteer
  app.post("/api/certificates/generate", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId, volunteerId } = req.body;
      
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can generate certificates" });
      }

      // Verify the task belongs to the NGO
      const task = await storage.getTask(taskId);
      if (!task || task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only generate certificates for your own tasks" });
      }

      // Check if volunteer was marked present
      const attendance = await storage.getAttendanceByTask(taskId);
      const volunteerAttendance = attendance.find(att => att.volunteerId === volunteerId && att.status === 'present');
      
      if (!volunteerAttendance) {
        return res.status(400).json({ error: "Certificate can only be generated for volunteers marked as present" });
      }

      const certificate = await storage.generateCertificate(taskId, volunteerId);
      
      if (!certificate) {
        return res.status(500).json({ error: "Failed to generate certificate" });
      }

      res.json({
        message: "Certificate generated successfully",
        certificate
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  // Get certificates for a task (NGO view)
  app.get("/api/certificates/task/:taskId", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      const { taskId } = req.params;
      
      if (role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can view task certificates" });
      }

      // Verify the task belongs to the NGO
      const task = await storage.getTask(taskId);
      if (!task || task.ngoId !== userId) {
        return res.status(403).json({ error: "You can only view certificates for your own tasks" });
      }

      const certificates = await storage.getCertificatesByTask(taskId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching task certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Get certificates for a volunteer (Volunteer view)
  app.get("/api/certificates/my", verifyToken, async (req: any, res) => {
    try {
      const { role, userId } = req.user;
      
      if (role !== "volunteer") {
        return res.status(403).json({ error: "Only volunteers can view their certificates" });
      }

      const certificates = await storage.getCertificatesByVolunteer(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching volunteer certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Download certificate
  app.get("/api/certificates/download/:certificateId", verifyToken, async (req: any, res) => {
    try {
      const { userId } = req.user;
      const { certificateId } = req.params;
      
      // Get certificate details
      const certificate = await Certificate.findById(certificateId)
        .populate('taskId', 'title date postedBy')
        .populate('volunteerId', 'name')
        .populate({
          path: 'taskId',
          populate: {
            path: 'postedBy',
            select: 'name'
          }
        });

      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      // Check if user has permission to download
      if (certificate.volunteerId._id.toString() !== userId) {
        return res.status(403).json({ error: "You can only download your own certificates" });
      }

      // Generate PDF certificate (this is a simplified version)
      const certificateData = {
        certificateNumber: certificate.certificateNumber,
        volunteerName: certificate.volunteerId.name,
        taskTitle: certificate.taskId.title,
        taskDate: certificate.taskId.date,
        ngoName: certificate.taskId.postedBy.name,
        hoursCompleted: certificate.hoursCompleted,
        issuedDate: certificate.generatedAt
      };

      // Update download status
      await storage.downloadCertificate(certificateId);

      res.json({
        message: "Certificate ready for download",
        certificateData,
        downloadUrl: `/certificates/${certificate.certificateNumber}.pdf`
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      res.status(500).json({ error: "Failed to download certificate" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Create and save contact message to database
      const contactMessage = new Contact({
        firstName,
        lastName,
        email,
        subject,
        message,
        status: 'new'
      });

      const savedContact = await contactMessage.save();
      console.log("📧 New contact message saved to database:", savedContact.id);

      // Optional: Send email notification to admin
      try {
        await emailService.sendContactNotification({
          name: `${firstName} ${lastName}`,
          email,
          subject,
          message
        });
        console.log("✅ Contact notification email sent to admin");
      } catch (emailError) {
        console.error("❌ Failed to send contact notification email:", emailError);
        // Don't fail the request if email fails
      }

      res.json({
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        contactId: savedContact.id
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to process contact message" });
    }
  });

  // Get all contact messages (admin only)
  app.get("/api/contact-messages", verifyToken, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin only." });
      }

      const messages = await Contact.find()
        .sort({ createdAt: -1 })
        .select('firstName lastName email subject message status createdAt')
        .lean();

      res.json({
        success: true,
        messages: messages.map(msg => ({
          id: msg._id,
          fullName: `${msg.firstName} ${msg.lastName}`,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          status: msg.status,
          createdAt: msg.createdAt
        }))
      });
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  // Get contact messages count for dashboard
  app.get("/api/contact-stats", async (req, res) => {
    try {
      const total = await Contact.countDocuments();
      const newMessages = await Contact.countDocuments({ status: 'new' });
      const readMessages = await Contact.countDocuments({ status: 'read' });
      const repliedMessages = await Contact.countDocuments({ status: 'replied' });
      const resolvedMessages = await Contact.countDocuments({ status: 'resolved' });

      res.json({
        total,
        new: newMessages,
        read: readMessages,
        replied: repliedMessages,
        resolved: resolvedMessages
      });
    } catch (error) {
      console.error("Error fetching contact stats:", error);
      res.status(500).json({ error: "Failed to fetch contact statistics" });
    }
  });

  const server = createServer(app);
  return server;
}
