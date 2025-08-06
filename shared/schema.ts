import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("volunteer"), // ngo, volunteer, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  techStack: text("tech_stack").array().notNull(),
  status: text("status").notNull().default("development"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serverStatus = pgTable("server_status", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  status: text("status").notNull(),
  port: integer("port"),
  lastChecked: timestamp("last_checked").defaultNow(),
});

export const projectStats = pgTable("project_stats", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  components: integer("components").default(0),
  apiRoutes: integer("api_routes").default(0),
  databaseModels: integer("database_models").default(0),
  pages: integer("pages").default(0),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  date: timestamp("date").notNull(),
  hours: integer("hours").default(1),
  status: text("status").notNull().default("Not Started"), // Not Started, In Progress, Completed
  postedBy: integer("posted_by").references(() => users.id).notNull(),
  appliedVolunteers: integer("applied_volunteers").array().default([]),
  approvedVolunteers: integer("approved_volunteers").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskApplications = pgTable("task_applications", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  appliedAt: timestamp("applied_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  revieweeId: integer("reviewee_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  ngoId: integer("ngo_id").references(() => users.id).notNull(),
  certificateUrl: text("certificate_url"),
  issuedAt: timestamp("issued_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ngo", "volunteer", "admin"]),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  appliedVolunteers: true,
  approvedVolunteers: true,
});

// MongoDB-compatible task schema
export const mongoTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  requiredSkills: z.array(z.string()).min(1, "At least one skill is required"),
  date: z.string().transform((str) => {
    // Create date without timezone issues by specifying time as noon UTC
    const dateParts = str.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2]);
      return new Date(year, month, day, 12, 0, 0); // Noon local time
    }
    return new Date(str);
  }), // Convert string to Date without timezone issues
  duration: z.string().optional().default("1 hour"),
  hours: z.number().positive().optional().default(1),
  status: z.enum(['open', 'in-progress', 'completed', 'cancelled', 'closed']).optional().default("open"),
  taskStatus: z.enum(['Not Started', 'In Progress', 'Completed', 'Closed']).optional().default("Not Started"),
  maxVolunteers: z.number().positive().optional().default(10),
  urgency: z.enum(['low', 'medium', 'high']).optional().default("medium"),
  category: z.string().optional().default("General"),
  postedBy: z.string().min(1, "Posted by is required"), // MongoDB ObjectId as string
  appliedVolunteers: z.array(z.string()).optional().default([]),
  approvedVolunteers: z.array(z.string()).optional().default([]),
});

export const insertTaskApplicationSchema = createInsertSchema(taskApplications).omit({
  id: true,
  appliedAt: true,
  approvedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServerStatusSchema = createInsertSchema(serverStatus).omit({
  id: true,
  lastChecked: true,
});

export const insertProjectStatsSchema = createInsertSchema(projectStats).omit({
  id: true,
});

// MongoDB-compatible interfaces for the storage layer
export interface SelectUser {
  id: string;
  username?: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectTask {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  timeCommitment: string;
  skillsRequired: string[];
  status: string;
  ngoId: string;
  date?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectTaskApplication {
  id: string;
  taskId: string;
  volunteerId: string;
  status: string;
  message?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Additional interfaces for future use
export interface SelectReview {
  id: string;
  taskId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface SelectCertificate {
  id: string;
  taskId: string;
  volunteerId: string;
  ngoId: string;
  certificateUrl: string;
  issuedAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertServerStatus = z.infer<typeof insertServerStatusSchema>;
export type ServerStatus = typeof serverStatus.$inferSelect;

export type InsertProjectStats = z.infer<typeof insertProjectStatsSchema>;
export type ProjectStats = typeof projectStats.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTaskApplication = z.infer<typeof insertTaskApplicationSchema>;
export type TaskApplication = typeof taskApplications.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
